import { SlashCommandBuilder } from 'discord.js'
import type Command from '../../types/Command'

const shuffle: Command<true> = {
  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles the queue'),

  callback: async ({ interaction, player }) => {
    player.queue.shuffle()
    await interaction.reply({ content: 'Queue shuffled!', ephemeral: true })
  }
}

export default shuffle
