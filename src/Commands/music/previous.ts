import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

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
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Previous track not available. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    player.queue.length = 0
    player.queue.push(player.previousTrack, ...player.queue)
    player.stop() // "skip"

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Playing the previous track now. ]')
          .setColor(embedColor)
      ],
      ephemeral: true
    })

    if (!player.isPlaying) player.play()
  }
}

export default previous