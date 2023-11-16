import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClasses";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";
import PlayerEmbedManager from "../../../functions/MusicEmbedManager";

const pause: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer,
    _: any,
    builder: PlayerEmbedManager
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
      ephemeral: true
    });

    const message = await player?.message?.fetch().catch(() => null)

    if (!message) return;

    message.edit({ embeds: [await builder.constructSongStateEmbed()] })
      .catch(() => { })
  },
};

export default pause;
