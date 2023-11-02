import { CommandInteraction, EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClient";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";

const disconnect: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
  },

  callback: (interaction: CommandInteraction, player: ExtPlayer) => {
    player.disconnect();

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("[ The bot has been disconnected. ]")
          .setColor(util.embedColor),
      ],
    });
  },
};

export default disconnect;
