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
    player.controller.togglePlayback()
    player.messageManger.updatePlayerMessage()

    // a.k.a. reply with nothing and delete shortly after
    await interaction.deferReply({ ephemeral: true })
      .then(_ => _.delete()
        .catch(() => {}))
  }
}

export default pause
