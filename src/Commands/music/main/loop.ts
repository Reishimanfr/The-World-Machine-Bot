import { CommandInteraction, EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClasses";
import util from "../../../Helpers/Util";
import PlayerEmbedManager from "../../../functions/MusicEmbedManager";
import Subcommand from "../../../types/Subcommand";

const loop: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true,
    requiresDjRole: true
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
      ], ephemeral: true,
    });
  },
};

export default loop;
