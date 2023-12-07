import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

const pause: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Toggles playback of the player"),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: async ({ interaction, player, controller, message }) => {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ ${player.isPaused ? "Paused" : "Resumed"}. ]`)
          .setColor(embedColor),
      ], ephemeral: true
    });

    await controller.togglePlayback()
  },
};

export default pause;
