import { EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../Helpers/ExtendedClasses";
import { logger } from "../Helpers/Logger";
import util from "../Helpers/Util";
import PlayerEmbedManager from "./MusicEmbedManager";
import { config } from "../config";

class timeoutPlayer {
  /**
   * 
   */
  static setup(player: ExtPlayer) {
    if (config.hostPlayerOptions.playerTimeout <= 0) return;

    player.timeout = setTimeout(async () => {
      const message = player?.message
      const embedManager = new PlayerEmbedManager(player);

      player.destroy();

      try {
        message?.edit({
          embeds: [EmbedBuilder.from(message.embeds[0]).setAuthor({ name: 'The player has timed out.', iconURL: util.playerGifUrl })],
          components: [embedManager.constructRow(true)]
        })
      } catch (error) {
        logger.error(`A error occurred while editing message after event playerTimeout: ${error.message}`);
      }

    }, config.hostPlayerOptions.playerTimeout * 60 * 1000);
  }

  static cancel(player: ExtPlayer) {
    // Typeguard
    if (!player.timeout) return;

    // Cancel the timeout and set the player's timeout property to null
    clearTimeout(player.timeout);
    player.timeout = null;
  }
}

export default timeoutPlayer