import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'

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

  helpData: {
    description: 'Shuffles the current queue',
    examples: ['```/shuffle```']
  },

  callback: async ({ interaction, player }) => {
    player.queue.shuffle()
    await interaction.reply({ content: 'Queue shuffled!', ephemeral: true })
  }
}

export default shuffle
