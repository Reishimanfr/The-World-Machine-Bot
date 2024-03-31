import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'

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
        content: 'Nothing to clear.',
        ephemeral: true
      })
    }

    player.queue.length = 0

    await interaction.reply({
      content: 'Queue cleared.',
      ephemeral: true
    })
  }
}

export default clear
