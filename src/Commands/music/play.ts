import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
  TextChannel,
  ChatInputCommandInteraction
} from 'discord.js'
import { Track, type LavalinkResponse } from 'poru'
import { client } from '../..'
import { clipString } from '../../Funcs/ClipString'
import { formatSeconds } from '../../Funcs/FormatSeconds'
import { ExtPlayer, MessageManager, PlayerController, QueueManager } from '../../Helpers/ExtendedPlayer'
import { config as botConfig, logger } from '../../config'
import { combineConfig } from '../../Funcs/CombinePlayerConfig'
import { Command } from '../../Types/Command'
import CreateVote, { VoteStatus } from '../../Helpers/CreateVote'

const messages = {
  LOAD_FAILED: 'Failed to load track **{query}**.',
  NO_MATCHES: 'No matches found for **{query}**.',
  TRACK_ADDED: 'Track **{query}** added to the queue.'
}

interface TracksType {
  name: string
  value: string
  length?: number
}

async function loadPlaylist(interaction: ChatInputCommandInteraction, player: ExtPlayer, result: LavalinkResponse): Promise<void> {
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

  helpData: {
    description: 'Adds a song to the queue or plays is immediately if `bypass-queue` is set to true and other users vote "yes"',
    examples: [
      `> **Search for a song and play the first result**
      \`\`\`/play
      url-or-search: Do I wanna know - Arctic Monkeys \`\`\``,

      `> **Play a song by URL**
      \`\`\`/play
      url-or-search:[URL here]\`\`\``,

      `> **Play a song bypassing the queue**
      \`\`\`/play
      url-or-search: A song
      bypass-queue: True\`\`\``
    ]
  },

  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays or adds a song to the queue')
    .addStringOption(input => input
      .setName('url-or-search')
      .setDescription('Search query or URL to the song/playlist.')
      .setRequired(true)
      .setAutocomplete(botConfig.hostPlayerOptions.autocomplete)
    )
    .addBooleanOption(bypass => bypass
      .setName('bypass-queue')
      .setDescription('Forcefully plays a song skipping the queue (no songs get removed from the queue)')
    ),

  callback: async ({ interaction, client }) => {
    if (!interaction.guild || !interaction.channel) return

    await interaction.deferReply({ ephemeral: true })

    const member = await interaction.guild.members.fetch(interaction.user.id)
    const bypassQueue = interaction.options.getBoolean('bypass-queue') ?? false
    const query = interaction.options.getString('url-or-search', true)

    let player = client.poru.players.get(interaction.guild.id) as ExtPlayer | undefined

    // Typeguard
    if (!member.voice.channel) {
      return await interaction.editReply({
        content: 'You must be in a voice channel to use this.'
      })
    }

    if (!member.voice.channel.joinable) {
      return await interaction.editReply({
        content: 'I can\'t join this voice channel!'
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

    let track: Track

    if (bypassQueue && player.currentTrack) {
      const nonBotMembers = member.voice.channel.members.filter(m => !m.user.bot).size
      const requiredVotes = Math.round((nonBotMembers * (player.settings.voteSkipThreshold / 100)))

      await interaction.editReply({
        content: 'Waiting for users to place their votes...'
      })

      const [status, error] = await CreateVote({
        interaction: interaction,
        reason: 'Wants to bypass the current song',
        requiredVotes: requiredVotes,
        time: 180000,
        voiceChannel: member.voice.channel,
        voiceText: interaction.channel as TextChannel
      })

      switch (status) {
      case VoteStatus.Success: {
        if (player.currentTrack) {
          player.queue.splice(0, 0, player.currentTrack)
        }

        const [loadType, data] = await player.controller
          .resolveQueryOrUrl(query, interaction.user)

        switch (loadType) {
        case 'LOAD_FAILED':
        case 'NO_MATCHES': {
          return await interaction.followUp({
            content: messages[loadType].replace('{query}', query),
            ephemeral: true
          })
        }

        case 'PLAYLIST_LOADED':
        case 'TRACK_LOADED': {
          track = data.tracks[0]

          await interaction.followUp({
            content: `Track **${track.info.title}** will now play bypassing the queue.`,
            ephemeral: true
          })

          player.queue.splice(0, 0, track)
          player.stop() // Why is this not named skip like what
          // I'm making my own library fuck this shit
        }
        }
        break
      }
      case VoteStatus.Failure: {
        interaction.editReply({
          content: 'The voting resulted in a failure.'
        })
        return
      }
      case VoteStatus.Error: {
        if (!error) return // Typeguard
        interaction.editReply({
          content: 'The voting resulted in a error.',
        })
        logger.error(`Voting failed with error: ${error.stack}`)
        return
      }
      }
    } else {
      const [loadType, data] = await player.controller
        .resolveQueryOrUrl(query, interaction.user)

      switch (loadType) {
      case 'LOAD_FAILED':
      case 'NO_MATCHES': {
        return await interaction.editReply({
          content: messages[loadType].replace('{query}', query)
        })
      }

      case 'TRACK_LOADED': {
        track = data.tracks[0]

        await interaction.editReply({
          content: `Track **${track.info.title}** added to the queue.`
        })
        break
      }

      case 'PLAYLIST_LOADED': await loadPlaylist(interaction, player, data); break
      }
    }

    if (player.isConnected && !player.isPlaying) player.play()

    player.guildId ||= interaction.guild.id
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
          name: '❌ This link is too large! (Discord limitation :<)',
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
