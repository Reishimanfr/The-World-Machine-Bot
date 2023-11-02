import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClient";
import util from "../../../Helpers/Util";
import { config } from "../../../config";
import Subcommand from "../../../types/Subcommand";

const pause: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer
  ) => {
    if (!interaction.inCachedGuild()) return;

    // Toggle playback
    player.isPaused ? player.pause(false) : player.pause(true);

    util.addToAuditLog(
      player,
      interaction.user,
      `${player.isPaused ? "Paused" : "Resumed"} the player`
    );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ ${player.isPaused ? "Paused" : "Resumed"}. ]`)
          .setColor(util.embedColor),
      ],
      ephemeral: !config.player.announcePlayerActions,
    });
  },
};

export default pause;
