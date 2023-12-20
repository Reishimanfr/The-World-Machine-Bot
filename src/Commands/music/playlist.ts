import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import crypto from "node:crypto";
import { fetchMember } from "../../Funcs/FetchMember";
import { formatSeconds } from "../../Funcs/FormatSeconds";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { log } from "../../Helpers/Logger";
import { embedColor } from "../../Helpers/Util";
import { combineConfig } from "../../Helpers/config/playerSettings";
import { playlists as playlistsDB } from "../../Models";
import Command from "../../types/Command";

function createEmbed(
  tracks,
  interaction: ChatInputCommandInteraction,
  action: string
) {
  const name = interaction.options.getString('name', true)

  log.debug(tracks)

  let mapTracks: string[] = []
  let totalLength = 0
  let idx = 0

  for (const track of tracks) {
    const info = track.info
    idx++

    totalLength += info.length

    if (idx <= 5) {
      // I don't think you can make this shorter
      mapTracks.push(`\`#${idx}\`: [${info.title} - ${info.author}](${info.uri}) (${formatSeconds(info.length / 1000)})`)
    }
  }

  if (mapTracks.length !== tracks.length) {
    mapTracks.push(`And ${tracks.length - mapTracks.length} more...`)
  }

  return new EmbedBuilder()
    .setAuthor({
      name: `${name} • ${action}`,
      iconURL: interaction.guild?.iconURL() ?? undefined
    })
    .setDescription(`### Tracks
${mapTracks.join('\n')}

🕛 Total length: ${formatSeconds(totalLength)}
🎵 Tracks: ${tracks.length}

Tip: You can edit your existing playlists using the \`/playlist edit\` command.`)
    .setColor(embedColor)
}

export default <Command>{
  permissions: ['Speak', 'SendMessages', 'Connect'],

  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Manage your saved playlists')
    .addSubcommand(add => add
      .setName('add')
      .setDescription('Adds a playlist from a provided url')
      .addStringOption(url => url
        .setName('playlist-url')
        .setDescription('Url of the playlist')
        .setRequired(true)
      )
      .addStringOption(name => name
        .setName('name')
        .setDescription('Name to set for the playlist')
        .setRequired(true)
      )
    )
    .addSubcommand(remove => remove
      .setName('remove')
      .setDescription('Remove a playlist from your saved playlists')
      .addStringOption(name => name
        .setName('name')
        .setDescription('Name of the playlist to be removed')
        .setRequired(true)
        .setAutocomplete(true)
      )
    )
    .addSubcommand(load => load
      .setName('load')
      .setDescription('Load a playlist into the queue')
      .addStringOption(playlist => playlist
        .setName('name')
        .setDescription('Name of the playlist to be loaded')
        .setRequired(true)
        .setAutocomplete(true)
      )
    ),

  callback: async ({ interaction, client, player }) => {
    // Typeguard
    if (!interaction.guild) return

    const subcommand = interaction.options.getSubcommand()

    const currentPlaylists = await playlistsDB.findAll({
      where: { userId: interaction.user.id }
    })

    switch (subcommand) {
      case 'add': {
        const url = interaction.options.getString('playlist-url', true)
        const name = interaction.options.getString('name', true)
        const results = await client.poru.resolve({ query: url })

        if (results.loadType !== 'PLAYLIST_LOADED') {
          return interaction.reply({
            content: 'This doesn\'t seem to be a correct playlist url.',
            ephemeral: true
          })
        }

        const playlists = currentPlaylists.map(t => t.getDataValue('name'))

        if (playlists.length >= 25) {
          return interaction.reply({
            content: 'You can have a maximum of 25 playlists saved.',
            ephemeral: true
          })
        }

        if (playlists.includes(name)) {
          return interaction.reply({
            content: 'A playlist with this name already exists.',
            ephemeral: true
          })
        }

        const tracks = results.tracks
        const confirmEmbed = createEmbed(tracks, interaction, 'Add playlist?')

        const buttons = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('yes')
              .setLabel('Add')
              .setEmoji('✅')
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId('no')
              .setLabel('Discard')
              .setEmoji('❌')
              .setStyle(ButtonStyle.Primary)
          )

        const response = await interaction.reply({
          embeds: [confirmEmbed],
          components: [buttons],
          ephemeral: true
        })

        const button = await response.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 60000,
        })

        if (!button) return
        await button.deferUpdate()

        if (button.customId === 'no') {
          return interaction.reply({
            embeds: [],
            components: [],
            content: 'Playlist discarded.'
          })
        }

        interaction.editReply({
          embeds: [],
          components: [],
          content: 'Playlist added.'
        })

        await playlistsDB.create(
          {
            userId: interaction.user.id,
            name: name,
            tracks: tracks
          }
        )
        break;
      }

      case 'remove': {
        const name = interaction.options.getString('name', true)
        if (name === 'autocomplete_no_user_input') return

        const names: string[] = currentPlaylists.map(t => t.getDataValue('name'))

        if (!names.includes(name)) {
          return interaction.reply({
            content: 'A playlist with this name doesn\'t exist.',
            ephemeral: true
          })
        }

        const request = currentPlaylists.find(t => t.getDataValue('name') === name)

        if (!request) {
          return interaction.reply({
            content: 'No data found for this playlist.',
            ephemeral: true
          })
        }

        const tracks = request.dataValues.tracks

        const confirmEmbed = createEmbed(tracks, interaction, 'Remove playlist?')

        const buttons = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('yes')
              .setLabel('Remove')
              .setEmoji('✅')
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId('no')
              .setLabel('Keep')
              .setEmoji('❌')
              .setStyle(ButtonStyle.Primary)
          )

        const response = await interaction.reply({
          embeds: [confirmEmbed],
          components: [buttons],
          ephemeral: true
        })

        const button = await response.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 60000,
        })

        if (!button) return

        await button.deferUpdate()

        if (button.customId === 'no') {
          return interaction.reply({
            embeds: [],
            components: [],
            content: 'Keeping this playlist.'
          })
        }

        interaction.editReply({
          embeds: [],
          components: [],
          content: 'Playlist removed.'
        })

        await playlistsDB.destroy({
          where: {
            userId: interaction.user.id,
            name: name
          }
        })
        break;
      }

      case 'load': {
        const name = interaction.options.getString('name', true)
        if (name === 'autocomplete_no_user_input') return

        const names: string[] = currentPlaylists.map(t => t.getDataValue('name'))

        if (!names.includes(name)) {
          return interaction.reply({
            content: 'A playlist with this name doesn\'t exist.',
            ephemeral: true
          })
        }

        const request = currentPlaylists.find(t => t.getDataValue('name') === name)

        if (!request) {
          return interaction.reply({
            content: 'No data found for this playlist.',
            ephemeral: true
          })
        }

        const member = await fetchMember(interaction.guild.id, interaction.user.id)

        // Member is not in voice channel
        if (!member?.voice.channel?.id) {
          return interaction.reply({
            content: 'You must be in a voice channel to use this.',
            ephemeral: true
          })
        }

        if (!player) {
          player = client.poru.createConnection({
            guildId: interaction.guild!.id,
            voiceChannel: member!.voice.channel!.id,
            textChannel: interaction.channel!.id,
            deaf: true,
            mute: false,
          }) as ExtPlayer;
        }

        // Member is not in the same voice channel as bot
        if (player && member.voice.channel.id !== player.voiceChannel) {
          return interaction.reply({
            content: 'You must be in the same voice channel as me to use this.',
            ephemeral: true
          })
        }

        const config = await combineConfig(interaction.guild.id)

        // Member doesn't have the DJ role
        if (config.requireDjRole && !member.roles.cache.find(r => r.id === config.djRoleId)) {
          return interaction.reply({
            content: `You must have the <@&${config.djRoleId}> role to use this command.`,
            ephemeral: true
          })
        }

        const tracks = request.dataValues.tracks
        const confirmEmbed = createEmbed(tracks, interaction, 'Load playlist?')

        const buttons = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('yes')
              .setLabel('Load')
              .setEmoji('✅')
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId('no')
              .setLabel('Don\'t')
              .setEmoji('❌')
              .setStyle(ButtonStyle.Primary)
          )

        const response = await interaction.reply({
          embeds: [confirmEmbed],
          components: [buttons],
          ephemeral: true
        })

        const button = await response.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 60000,
        })

        if (!button) return

        await button.deferUpdate()

        if (button.customId === 'no') {
          return interaction.reply({
            embeds: [],
            components: [],
            content: 'Playlist won\'t be loaded.'
          })
        }

        interaction.editReply({
          embeds: [],
          components: [],
          content: 'Playlist added to the queue.'
        })

        for (const track of tracks) {
          track.info.requester = {
            username: member.user.username,
            id: member.user.id,
            avatar: member.displayAvatarURL()
          }

          player.queue.add(track)
        }

        if (player.isConnected && !player.isPlaying) player.play()

        player.guildId ||= interaction.guild.id
        player.sessionId ||= crypto.randomBytes(6).toString('hex')
        player.settings ||= config
        break
      }
    }
  }
}