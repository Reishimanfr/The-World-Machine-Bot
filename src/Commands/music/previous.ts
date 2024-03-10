import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'

const previous: Command = {
  data: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Go to the previous track in the queue'),

  permissions: {
    user: ['SendMessages', 'Connect', 'Speak'],
    bot: ['SendMessages', 'Connect', 'Speak']
  },

  callback: async ({ interaction, player }) => {
    if (!player.previousTrack) {
      return interaction.reply({
        content: 'There are no previous tracks in the queue.',
        ephemeral: true
      })
    }

    await interaction.reply({
      content: 'Playing the previous track now.',
      ephemeral: true
    })

    player.queue = [player.previousTrack, player.currentTrack, ...player.queue] as any
    player.stop() // "skip"
  }
}

export default previous