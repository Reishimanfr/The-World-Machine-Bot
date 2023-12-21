import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder
} from "discord.js";
import crypto from "node:crypto";
import { Response, Track } from "poru";
import { fetchMember } from "../../Funcs/FetchMember";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { MessageManager } from "../../Helpers/MessageManager";
import { PlayerController } from "../../Helpers/PlayerController";
import { QueueManager } from "../../Helpers/QueueManager";
import { combineConfig } from "../../Helpers/config/playerSettings";
import { config as botConfig } from "../../config";
import Command from "../../types/Command";

const messages = {
  'LOAD_FAILED': '[ Failed to load track **{query}**. ]',
  'NO_MATCHES': '[ No matches found for **{query}**. ]',
  'TRACK_ADDED': '[ Track **{query}** added to the queue. ]'
}

const play: Command = {
  permissions: ['Speak', 'SendMessages', 'Connect'],
  musicOptions: {
    requiresVc: true,
    requiresDjRole: true
  },

  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays or adds a song to the queue")
    .addStringOption(input => input
      .setName("url-or-search")
      .setDescription("Search query or URL to the song/playlist.")
      .setRequired(true)
      .setAutocomplete(botConfig.hostPlayerOptions.autocomplete)
    ),

  callback: async ({ interaction, player, client }) => {
    // typeguard
    if (!interaction.guild || !interaction.channel) return
    const member = await fetchMember(interaction.guild.id, interaction.user.id)

    if (!member) {
      return interaction.reply({
        content: 'Cannot create connection: member fetch failed.',
        ephemeral: true
      })
    }

    if (!member.voice.channel) {
      return interaction.reply({
        content: 'You must be in a voice channel to use this.',
        ephemeral: true
      })
    }

    let query = interaction.options.getString("url-or-search", true);

    if (query == 'autocomplete_no_user_input') {
      query = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }

    if (!player) {
      player = client.poru.createConnection({
        guildId: interaction.guild.id,
        voiceChannel: member.voice.channel.id,
        textChannel: interaction.channel.id,
        deaf: true,
        mute: false,
      }) as ExtPlayer;

      // Audio quality is best on this setting
      player.setVolume(75)
    }

    // Initialize helper classes
    player.controller = new PlayerController(player)
    player.messageManger = new MessageManager(player)
    player.queueManager = new QueueManager(player)

    const [loadType, data] = await player.controller
      .resolveQueryOrUrl(query, interaction.user)

    if (['LOAD_FAILED', 'NO_MATCHES'].includes(loadType)) {
      // Select a message string depending on the loadType and replace 
      // {query} with the actual query
      return interaction.reply({
        content: messages[loadType].replace('{query}', query),
        ephemeral: true
      })
    }

    if (loadType == 'TRACK_LOADED') {
      // Type assertion since the track was loaded and returned
      const track = data as Track

      await interaction.reply({
        content: `Track **${track.info.title}** added to the queue.`,
        ephemeral: true
      })
    }

    if (loadType == 'PLAYLIST_LOADED') {
      const { tracks } = data as Response

      const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('load')
            .setLabel(`Load ${tracks.length} tracks`)
            .setEmoji('✅')
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId('discard')
            .setLabel('Discard playlist')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary)
        )

      const response = await interaction.reply({
        content: `A playlist was found. Do you want to load it?`,
        components: [buttons],
        ephemeral: true
      })

      const button = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 60000
      })

      await button.deferUpdate()
      if (!button) return

      if (button.customId == 'load') {
        const response = data as Response

        interaction.editReply({
          content: `**${response.tracks.length}** tracks added to the queue.`,
        })

        await player.controller.loadPlaylist(response)
      } else {
        interaction.editReply({
          content: 'Playlist discarded.'
        })
      }
    }

    if (player.isConnected && !player.isPlaying) player.play()

    player.guildId ||= interaction.guild.id
    player.sessionId ||= crypto.randomBytes(6).toString('hex')
    player.settings ||= await combineConfig(interaction.guild.id)
  },
}

export default play