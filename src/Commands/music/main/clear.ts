import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClasses";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";

const clear: Subcommand = {
  musicOptions: {
    requiresPlayer: false,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: (interaction: ChatInputCommandInteraction, player: ExtPlayer) => {
    if (!player.queue.length) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setDescription('[ Nothing to clear. ]')
          .setColor(util.embedColor)
        ], ephemeral: true
      })
    }
    player.queue.length = 0;

    util.addToAuditLog(player, interaction.user, "Cleared the queue");

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("[ Queue cleared. ]")
          .setColor(util.embedColor),
      ],
      ephemeral: true,
    });
  },
};

export default clear;
