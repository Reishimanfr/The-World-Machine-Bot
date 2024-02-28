import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'

const pause: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresVc: true,
    requiresPlaying: true
  },

  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Toggles playback of the player'),

  helpData: {
    description: 'Toggles music playback',
    examples: ['```/pause```']
  },

  callback: async ({ interaction, player }) => {
    player.controller.togglePlayback()
    void player.messageManger.updatePlayerMessage()

    await interaction.reply({
      content: player.isPaused ? 'Paused' : 'Resumed',
      ephemeral: true
    })
  }
}

export default pause
