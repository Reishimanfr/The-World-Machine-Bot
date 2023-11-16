import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";

const timescale: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: async (interaction: ChatInputCommandInteraction, player) => {
    const scale = interaction.options.getNumber("speed", true);
    const pitch = interaction.options.getNumber("pitch") ?? null;

    if (!pitch) {
      player.filters.setTimescale({ speed: scale });
    } else {
      player.filters.setTimescale({ speed: scale, pitch: pitch });
    }

    util.addToAuditLog(
      player,
      interaction.user,
      `Set the timescale filter to ${scale}x speed ${pitch ? `And ${pitch}x pitch` : ""
      }`
    );

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[ Timescale filter set to **${scale}x speed** ${pitch ? `And **${pitch}x pitch**` : ""
            } ]`
          )
          .setColor(util.embedColor)
          .setFooter({
            text: "Notice: You may need to way a bit before the filter gets set!",
          }),
      ],
      ephemeral: true,
    });
  },
};
export default timescale;
