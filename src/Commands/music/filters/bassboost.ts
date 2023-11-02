import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClient";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";

const bassboost: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer
  ) => {
    const bassboost = interaction.options.getNumber("value", true) / 100;

    player.filters.setEqualizer(
      bassboost
        ? Array(6)
          .fill(0.22)
          .map((x, i) => ({ band: i, gain: x * bassboost }))
        : []
    );

    player.currentTrack.info.requester.

      util.addToAuditLog(
        player,
        interaction.user,
        `Set the bass boost filter to ${bassboost}%`
      );

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ Bassboost filter set to **${bassboost}%** ]`)
          .setColor(util.embedColor)
          .setFooter({
            text: "Notice: You may need to way a bit before the filter gets set!",
          }),
      ],
      ephemeral: true,
    });
  },
};

export default bassboost;
