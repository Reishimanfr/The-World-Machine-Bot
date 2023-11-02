import { EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../Helpers/ExtendedClient";
import { logger } from "../Helpers/Logger";
import { config } from "../config";
import util from "../Helpers/Util";
import PlayerEmbedManager from "./playerEmbedManager";

class timeoutPlayer {
  static setup(player: ExtPlayer) {
    player.playerTimeout = setTimeout(async () => {
      const message = player?.message
      const embedManager = new PlayerEmbedManager(player);

      player.destroy();

      try {
        message?.edit({
          embeds: [EmbedBuilder.from(message.embeds[0]).setAuthor({ name: 'The player has timed out.', iconURL: util.playerGifUrl })],
          components: [embedManager.constructRow(true)]
        })
      } catch (error) {
        logger.error(`A error occurred while editing message after event playerTimeout: ${error}`);
      }

    }, config.player.playerTimeout * 60 * 1000);
  }

  static cancel(player: ExtPlayer) {
    // Typeguard
    if (!player.playerTimeout) return;

    // Cancel the timeout and set the player's timeout property to null
    clearTimeout(player.playerTimeout);
    player.playerTimeout = null;
  }
}

export default timeoutPlayer