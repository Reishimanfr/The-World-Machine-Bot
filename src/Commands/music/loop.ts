import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

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
    .setName("loop")
    .setDescription("Toggles looping for the currently playing track"),

  callback: async ({ interaction, player }) => {
    const loopString = {
      'NONE': 'Looping disabled',
      'TRACK': 'Looping this track',
      'QUEUE': 'Looping the queue'
    }

    player.controller.toggleLoop()
    player.messageManger.updatePlayerMessage()

    interaction.reply({
      content: loopString[player.loop],
      ephemeral: true
    })
  },
}

export default loop