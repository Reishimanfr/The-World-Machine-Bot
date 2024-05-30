import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'
import type { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { clipString } from '../../Funcs/ClipString'
import { client } from '../..'
import { TimeFormatter } from '../../Classes/TimeFormatter'

// Audio quality is best on this setting
const DEFAULT_PLAYER_VOLUME = 75

// Used for delays between autocomplete updates
let lastUpdate = Date.now()

const play: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays or adds a song to the queue.')
    .addStringOption(input => input
      .setName('url-or-search')
      .setDescription('Search query or URL to the song/playing you want to play.')
      .setRequired(true)
      .setAutocomplete(true)
    ),

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

  callback: async ({ interaction, client }) => {
    if (!interaction.channel) return // Typeguard
    await interaction.deferReply({ ephemeral: true })

    const member = await interaction.guild.members.fetch(interaction.user.id)
    const query = interaction.options.getString('url-or-search', true)

    let player = client.poru.players.get(interaction.guild.id) as ExtPlayer | undefined

    if (!member.voice.channel) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in a voice channel to use this. ]')
            .setColor(embedColor)
        ]
      })
    }

    if (!member.voice.channel.joinable) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ I can\'t join your voice channel. ]')
            .setColor(embedColor)
        ]
      })
    }

    if (!player) {
      player = client.poru.createConnection({
        guildId: interaction.guild.id,
        voiceChannel: member.voice.channel.id,
        textChannel: interaction.channel?.id,
        deaf: true
      }) as ExtPlayer

      player.setVolume(DEFAULT_PLAYER_VOLUME)
    }

    const fullResponse = await client.poru.resolve({
      query: query,
      requester: {
        username: member.user.displayName,
        avatar: member.displayAvatarURL(),
        id: member.user.id
      },
      source: 'ytsearch'
    })

    const { loadType, tracks } = fullResponse

    switch (loadType) {
      case 'error': {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`[ Track failed to load. ] \nFull lavalink response: ${JSON.stringify(fullResponse, null, 2)}`)
              .setColor(embedColor)
          ]
        })
      }

      case 'empty': {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription("[ Nothing found matching your search query. ]")
              .setColor(embedColor)
          ]
        })
      }

      case 'search':
      case 'track': {
        player.queue.add(tracks[0])

        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`[ \`${tracks[0].info.title} - ${tracks[0].info.author}\` added to queue. ]`)
              .setColor(embedColor)
          ]
        })
        break
      }

      case 'playlist': {
        const buttons = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('load')
              .setLabel(`Load ${tracks.length} tracks`)
              .setEmoji('✅')
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId('discard')
              .setLabel('Don\'t load playlist')
              .setEmoji('❌')
              .setStyle(ButtonStyle.Secondary)
          )

        const response = await interaction.editReply({
          content: "\`❓\` - This link seems to lead to a playlist. Do you want to load it?",
          components: [buttons]
        })

        const button = await response.awaitMessageComponent({
          componentType: ComponentType.Button
        })

        await button.deferReply()

        if (button.customId === 'load') {
          await interaction.editReply({
            content: `\`✅\` - Playlist loaded. **${tracks.length}** tracks were added to the queue.`,
            components: []
          })

          for (const track of tracks) {
            player.queue.add(track)
          }
        } else {
          await interaction.editReply({
            content: '\`❌\` - `Playlist discarded.',
            components: []
          })
        }
      }
        break
    }

    if (player.isConnected && !player.isPlaying) await player.play()
  },

  autocomplete: async (interaction) => {
    const query = interaction.options.getString('url-or-search', true)

    if (!query.length) {
      return interaction.respond([
        {
          name: '🔎 Start typing to search for songs on YouTube and Spotify.',
          value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
      ])
    }

    if (query.length >= 100) {
      return interaction.respond([
        {
          name: '❌ Search query too long! (Discord limitation :<)',
          value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }
      ])
    }

    if (query.startsWith('https://')) {
      return interaction.respond([
        {
          name: `🔗: ${clipString({ string: query, maxLength: 85, sliceEnd: '...' })}`,
          value: query
        }
      ])
    }

    if (Date.now() - lastUpdate > 600) {
      lastUpdate = Date.now()

      const tracks: { name: string, value: string }[] = []
      const formatter = new TimeFormatter()

      const resolveAndPush = async (source: string, prefix: string) => {
        const resolve = await client.poru.resolve({ query, source })

        switch (resolve.loadType) {
          case 'empty': {
            tracks.push({ name: `${prefix}: No results found.`, value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
            return
          }

          case 'error': {
            tracks.push({ name: `${prefix}: Failed to fetch results.`, value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
            return
          }
        }

        const resolveTracks = resolve.tracks.slice(0, 5)

        for (const track of resolveTracks) {
          if (!track.info.uri) continue

          let trackString = `${prefix}: `

          trackString += `${track.info.title} - ${track.info.author}`

          if (trackString.length > 99) {
            trackString = `${trackString.slice(0, 80)}...`
          }

          trackString += ` - (${formatter.duration(track.info.length / 1000)})`

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
}

export default play