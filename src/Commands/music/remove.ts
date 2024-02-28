import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { embedColor } from '../../Helpers/Util'
import { Command } from '../../Types/Command'

const remove: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  helpData: {
    description: 'Removes a song or multiple songs from the queue',
    examples: [
      `> **Remove a specific song**
      \`\`\`/remove
      songs: 1\`\`\``,

      `> **Remove multiple songs at once**
      \`\`\`/remove
      songs: 1, 3, 7\`\`\``,

      `> **Remove a range of songs**
      \`\`\`/remove
      songs: 1-5\`\`\``
    ]
  },

  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a song (or multiple songs) from the queue.')
    .addStringOption(input => input
      .setName('songs')
      .setDescription('Songs to be removed. Check help for bulk removing.')
      .setRequired(true)
    ),

  callback: async ({ interaction, player }) => {
    const queue = player.queue
    const input = interaction.options.getString('songs', true)

    const positions: number[] = []

    const parts = input.split(/[\s,]+/)
    for (const part of parts) {
      if (part.includes('-')) {
        const range = part.split('-')
        const start = parseInt(range[0])
        const end = parseInt(range[1])

        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            positions.push(i)
          }
        }
      } else {
        const position = parseInt(part)
        if (!isNaN(position)) {
          positions.push(position)
        }
      }
    }

    const sortedPositions = positions.sort((a, b) => b - a)

    for (const position of sortedPositions) {
      if (position >= 1 && position <= queue.length) {
        queue.splice(position - 1, 1)
      }
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[ Removed position(s) \`${input}\` from the queue. ]`
          )
          .setColor(embedColor)
      ],
      ephemeral: true
    })

    await player.messageManger.updatePlayerMessage()
  }
}

export default remove
