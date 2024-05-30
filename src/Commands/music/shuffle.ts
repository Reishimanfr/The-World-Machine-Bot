import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

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
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Queue shuffled. ]')
          .setColor(embedColor)
      ],
      ephemeral: true
    })
  }
}

export default shuffle
