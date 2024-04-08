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
        content: '`❌` - Previous track not available.',
        ephemeral: true
      })
    }

    await interaction.reply({
      content: '`✅` - The previous track will now play.',
      ephemeral: true
    })

    player.queue.length = 0
    player.queue.push(player.previousTrack, ...player.queue)
    player.stop() // "skip"

    if (!player.isPlaying) player.play()
  }
}

export default previous