import { CommandInteraction, EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClient";
import util from "../../../Helpers/Util";
import PlayerEmbedManager from "../../../functions/playerEmbedManager";
import Subcommand from "../../../types/Subcommand";
import { config } from "../../../config";

const loop: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true,
  },

  callback: (interaction: CommandInteraction, player: ExtPlayer) => {
    const { loop } = player;

    loop == "NONE" ? player.setLoop("TRACK") : player.setLoop("NONE");

    util.addToAuditLog(
      player,
      interaction.user,
      `Toggled looping (${player.loop})`
    );

    if (player?.message) {
      const row = new PlayerEmbedManager(player).constructRow();

      player.message.edit({
        components: [row],
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[ ${player.loop == "TRACK" ? "Looping this track" : "Looping disabled"
            }. ]`
          )
          .setColor(util.embedColor),
      ], ephemeral: !config.player.announcePlayerActions,
    });
  },
};

export default loop;
