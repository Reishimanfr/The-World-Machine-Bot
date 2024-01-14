import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const pause: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Toggles playback of the player"),

  callback: async ({ interaction, player }) => {
    player.controller.togglePlayback()
    player.messageManger.updatePlayerMessage()

    interaction.reply({
      content: player.isPaused ? "Paused" : "Resumed",
      ephemeral: true
    })
  },
}

export default pause