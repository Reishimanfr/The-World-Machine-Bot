import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const pause: Command = {
  permissions: [],
  musicOptions: {
    requiresDjRole: true,
    requiresPlayer: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Toggles playback of the player"),

  callback: async ({ interaction, player }) => {
    await player.controller.togglePlayback()

    interaction.reply({
      content: player.isPaused ? "Paused" : "Resumed",
      ephemeral: true
    });
  },
}

export default pause