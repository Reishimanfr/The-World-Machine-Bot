import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

const clear: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresVc: true,
    requiresDjRole: true,
    requiresPlaying: true
  },

  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears the queue'),

  helpData: {
    description: 'Clears the player\'s queue',
    examples: ['```/clear```']
  },

  callback: async ({ interaction, player }) => {
    if (player.queue.length <= 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Queue is empty. Nothing to clear. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    player.queue.length = 0

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Queue cleared. ]')
          .setColor(embedColor)
      ],
      ephemeral: true
    })
  }
}

export default clear
