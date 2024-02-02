import { SlashCommandBuilder } from 'discord.js'
import type Command from '../../types/Command'

const loop: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggles looping for the currently playing track'),

  callback: async ({ interaction, player }) => {
    const loopString = {
      NONE: 'Looping disabled',
      TRACK: 'Looping this track',
      QUEUE: 'Looping the queue'
    }

    player.controller.toggleLoop()
    void player.messageManger.updatePlayerMessage()

    await interaction.reply({
      content: loopString[player.loop],
      ephemeral: true
    })
  }
}

export default loop
