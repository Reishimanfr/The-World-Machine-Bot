import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from 'discord.js'
import crypto from 'node:crypto'
import { type LavalinkResponse } from 'poru'
import { client } from '../..'
import { clipString } from '../../Funcs/ClipString'
import { formatSeconds } from '../../Funcs/FormatSeconds'
import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import { MessageManager } from '../../Helpers/MessageManager'
import { PlayerController } from '../../Helpers/PlayerController'
import { QueueManager } from '../../Helpers/QueueManager'
import { combineConfig } from '../../Helpers/config/playerSettings'
import { config as botConfig } from '../../config'
import type Command from '../../types/Command'

const messages = {
  LOAD_FAILED: '[ Failed to load track **{query}**. ]',
  NO_MATCHES: '[ No matches found for **{query}**. ]',
  TRACK_ADDED: '[ Track **{query}** added to the queue. ]'
}

interface TracksType {
  name: string
  value: string
  length?: number
}

async function loadPlaylist (interaction: ChatInputCommandInteraction, player: ExtPlayer, result: LavalinkResponse): Promise<void> {
  const buttons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('load')
        .setLabel(`Load ${result.tracks.length} tracks`)
        .setEmoji('✅')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('discard')
        .setLabel('Discard playlist')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Secondary)
    )

  const response = await interaction.reply({
    content: 'A playlist was found. Do you want to load it?',
    components: [buttons],
    ephemeral: true
  })

  const button = await response.awaitMessageComponent({
    componentType: ComponentType.Button
  })

  await button.deferUpdate()

  if (button.customId === 'load') {
    await interaction.editReply({
      content: `**${result.tracks.length}** tracks added to the queue.`,
      components: []
    })

    await player.controller.loadPlaylist(result)
    return
  }

  await interaction.editReply({
    content: 'Playlist discarded.',
    components: []
  })
}

const play: Command = {
  permissions: {
    user: ['Speak', 'SendMessages', 'Connect'],
    bot: ['Speak', 'SendMessages', 'Connect']
  },

  musicOptions: {
    requiresVc: true,
    requiresDjRole: true
  },

  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays or adds a song to the queue')
    .addStringOption(input => input
      .setName('url-or-search')
      .setDescription('Search query or URL to the song/playlist.')
      .setRequired(true)
      .setAutocomplete(botConfig.hostPlayerOptions.autocomplete)
    ),

  callback: async ({ interaction, client }) => {
    // Typeguard
    if (!interaction.guild || !interaction.channel) return

    const member = await interaction.guild.members.fetch(interaction.user.id)

    let query = interaction.options.getString('url-or-search', true)
    let player = client.poru.players.get(interaction.guild.id) as ExtPlayer | undefined

    if (query === 'autocomplete_no_user_input') {
      query = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }

    // Typeguard
    if (!member.voice.channel) {
      return await interaction.reply({
        content: 'You must be in a voice channel to use this.',
        ephemeral: true
      })
    }

    if (!member.voice.channel.joinable) {
      return await interaction.reply({
        content: 'I can\'t join this voice channel!',
        ephemeral: true
      })
    }

    if (!player) {
      player = client.poru.createConnection({
        guildId: interaction.guild.id,
        voiceChannel: member.voice.channel.id,
        textChannel: interaction.channel.id,
        deaf: true,
        mute: false
      }) as ExtPlayer

      // Audio quality is best on this setting
      player.setVolume(75)
    }

    // Initialize helper classes
    player.controller ||= new PlayerController(player)
    player.messageManger ||= new MessageManager(player)
    player.queueManager ||= new QueueManager(player)

    const [loadType, data] = await player.controller
      .resolveQueryOrUrl(query, interaction.user)

    switch (loadType) {
      case 'LOAD_FAILED':
      case 'NO_MATCHES': {
        return await interaction.reply({
          content: messages[loadType].replace('{query}', query),
          ephemeral: true
        })
      }

      case 'TRACK_LOADED': {
        const track = data.tracks[0]

        await interaction.reply({
          content: `Track **${track.info.title}** added to the queue.`,
          ephemeral: true
        })
        break
      }

      case 'PLAYLIST_LOADED': await loadPlaylist(interaction, player, data); break
    }

    if (player.isConnected && !player.isPlaying) player.play()

    player.guildId ||= interaction.guild.id
    player.sessionId ||= crypto.randomBytes(6).toString('hex')
    player.settings ||= await combineConfig(interaction.guild.id)
  },

  autocomplete: async (interaction) => {
    const query = interaction.options.getString('url-or-search', true)

    if (!query.length) {
      await interaction.respond([
        {
          name: '🔎 Start typing to show search options for spotify and youtube.',
          value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
      ]); return
    }

    if (query.length >= 100) {
      await interaction.respond([
        {
          name: '❌ This link is too large! (Discord limitation :< - use the legacy command instead)',
          value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
      ]); return
    }

    if (query.startsWith('https://')) {
      await interaction.respond([
        {
          name: `🔗 Load url: ${clipString({ string: query, maxLength: 85, sliceEnd: '...' })}`,
          value: query
        }
      ]); return
    }

    const tracks: TracksType[] = []

    const resolveAndPush = async (source: string, prefix: string): Promise<void> => {
      const resolve = await client.poru.resolve({ query, source })
      const resolveTracks = resolve.tracks.slice(0, 5)

      for (const track of resolveTracks) {
        let trackString = `${prefix}: `

        trackString += `${track.info.title} - ${track.info.author}`

        if (trackString.length > 99) {
          trackString = trackString.slice(0, 80) + '...'
        }

        trackString += ` - (${formatSeconds(track.info.length / 1000)})`

        tracks.push({ name: trackString.slice(0, 99), value: track.info.uri })
      }
    }

    await Promise.all([
      resolveAndPush('ytsearch', '🟥 Youtube'),
      resolveAndPush('spsearch', '🟩 Spotify')
    ])

    await interaction.respond(tracks)
  }
}

export default play
