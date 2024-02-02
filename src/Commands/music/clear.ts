import { SlashCommandBuilder } from 'discord.js'
import type Command from '../../types/Command'

const clear: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresVc: true,
    requiresDjRole: true
  },

  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears the queue'),

  callback: async ({ interaction, player }) => {
    if (player.queue.length <= 0) {
      return await interaction.reply({
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
