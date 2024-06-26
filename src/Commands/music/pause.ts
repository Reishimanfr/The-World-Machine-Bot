import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

const pause: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresVc: true,
    requiresPlaying: false
  },

  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Toggles playback of the player'),

  helpData: {
    description: 'Toggles music playback',
    examples: ['```/pause```']
  },

  callback: async ({ interaction, player }) => {
    player.pause(!player.isPaused)

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ Playback ${!player.isPaused ? 'paused' : 'resumed'}. ]`)
          .setColor(embedColor)
      ],
      ephemeral: true
    })

    player.messageManger.updatePlayerMessage()
  }
}

export default pause
