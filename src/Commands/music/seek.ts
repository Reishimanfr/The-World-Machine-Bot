import { SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

function convertToSeconds(timestamp: string): number {
  const match = timestamp.match(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/)

  if (match === null) return -1

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])

  return (!Number.isNaN(hours) ? hours * 3600 : 0) + (!Number.isNaN(minutes) ? minutes * 60 : 0) + seconds
}

const seek: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect', 'SendMessages'],
    bot: ['Speak', 'Connect', 'SendMessages']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  helpData: {
    description: 'Seeks to a point in the currently playing song',
    examples: [
      `> **Seek to a specific timestamp (HH:MM:SS or MM:SS format)**
      \`\`\`/seek
      time: 2:30\`\`\``,

      `> **Seek to the 15th second**
      \`\`\`/seek
      time: 15\`\`\``,

      `> **Seek 15 seconds forward**
      \`\`\`/seek
      time: +15\`\`\``,

      `> **Seek 15 seconds backward**
      \`\`\`/seek
      time: -15\`\`\``
    ]
  },

  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seeks to a point in the playing song')
    .addStringOption(timestamp => timestamp
      .setName('time')
      .setDescription('Timestamp to skip to (HH:MM:SS format)')
      .setRequired(true)
    ),

  callback: async ({ interaction, player }) => {
    if (!interaction.inCachedGuild()) return

    // You never know
    if (!player.currentTrack.info.isSeekable) {
      return interaction.reply({
        content: '`❌` - This track isn\'t seekable.',
        ephemeral: true
      })
    }

    if (player.currentTrack.info.isStream) {
      return interaction.reply({
        content: '`❌` - Seeking live streams isn\'t supported yet.',
        ephemeral: true
      })
    }

    const timestamp = interaction.options.getString('time', true)
    const timestampToSeconds = convertToSeconds(timestamp)

    if (timestamp.startsWith('+') || timestamp.startsWith('-')) {
      const direction = timestamp.startsWith('-') ? -1 : 1
      const seconds = Number(timestamp.substring(1)) // Remove the first character

      if (Number.isNaN(seconds)) {
        return interaction.reply({
          content: '`❌` - Invalid time format. Must be `-<seconds>` or `+<seconds>`',
          ephemeral: true
        })
      }

      const playerPos = player.position / 1000
      const newPosition = playerPos + (seconds * direction)
      player.seekTo(newPosition * 1000)

      return interaction.reply({
        content: `\`✅\` - Seeked by \`${seconds}s\` ${direction === 1 ? 'forward' : 'backwards'}.`,
        ephemeral: true
      })
    }

    if (timestampToSeconds !== -1) {
      player.seekTo(timestampToSeconds * 1000)

      return interaction.reply({
        content: `\`✅\`- Seeked to \`${timestamp}\`.`,
        ephemeral: true
      })
    }

    return interaction.reply({
      content: '`❌` - Invalid timestamp provided. Must be in format `HH:MM:SS`, `MM:SS`, `-<seconds>` or `+<seconds>`.',
      ephemeral: true
    })
  }
}

export default seek
