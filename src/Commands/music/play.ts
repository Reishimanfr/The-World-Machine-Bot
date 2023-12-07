import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";
import crypto from "node:crypto";
import { Response, Track } from "poru";
import { fetchMember } from "../../Funcs/FetchMember";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { embedColor } from "../../Helpers/Util";
import { combineConfig } from "../../Helpers/config/playerSettings";
import { config as botConfig } from "../../config";
import Command from "../../types/Command";

const messages = {
  'LOAD_FAILED': '[ Failed to load track **{query}**. ]',
  'NO_MATCHES': '[ No matches found for **{query}**. ]',
  'TRACK_ADDED': '[ Track **{query}** added to the queue. ]'
}

const play: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays or adds a song to the queue")
    .addStringOption(input => input
      .setName("url-or-search")
      .setDescription("Search query or URL to the song/playlist.")
      .setRequired(true)
      .setAutocomplete(botConfig.hostPlayerOptions.autocomplete)
    ),
  musicOptions: {
    requiresPlayer: false,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: async ({ interaction, player, client, controller }) => {
    let query = interaction.options.getString("url-or-search", true);

    if (query == 'autocomplete_no_user_input') {
      query = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }

    // Typeguard: Impossible(?) case
    if (!interaction.guild) return

    const member = await fetchMember(interaction.guild.id, interaction.user.id)

    if (!player) {
      player = client.poru.createConnection({
        guildId: interaction.guild!.id,
        voiceChannel: member!.voice.channel!.id,
        textChannel: interaction.channel!.id,
        deaf: true,
        mute: false,
      }) as ExtPlayer;

      player.setVolume(75); // Set the volume to 75 to not make people's ears bleed
      // They can just change it themselves if the need to lol
      // Also makes audio clearer
    }

    const [loadType, data] = await controller.resolveQueryOrUrl(query, member || interaction.user)

    if (['LOAD_FAILED', 'NO_MATCHES'].includes(loadType)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(messages[loadType].replace('{query}', query))
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    if (loadType == 'TRACK_LOADED') {
      // Type assertion since the track was loaded and returned
      const track = data as Track

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`[ Track **${track.info.title}** added to the queue. ]`)
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    if (loadType == 'PLAYLIST_LOADED') {
      const { tracks } = data as Response

      const embed = new EmbedBuilder()
        .setDescription(`[ A playlist consisting of **${tracks.length} tracks** was found. Do you want to load it? ]`)
        .setColor(embedColor)

      const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('load')
            .setLabel('Load them!')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId('discard')
            .setLabel('Discard them!')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary)
        )

      const response = await interaction.reply({
        embeds: [embed],
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

        await controller.loadPlaylist(response)

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`[ **${response.tracks.length}** tracks added to the queue. ]`)
              .setColor(embedColor)
          ],
          components: []
        })
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription('[ Playlist discarded. ]')
              .setColor(embedColor)
          ]
        })
      }
    }

    if (player.isConnected && !player.isPlaying) player.play()

    player.guildId ||= interaction.guild.id
    player.sessionId ||= crypto.randomBytes(6).toString('hex')
    player.settings ||= await combineConfig(interaction.guild.id)
  },
};

export default play;
