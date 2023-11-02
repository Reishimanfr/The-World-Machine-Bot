import { ExtPlayer } from "../../Helpers/ExtendedClient";
import { logger } from "../../Helpers/Logger";
import PlayerEmbedManager from "../../functions/playerEmbedManager";
import Event from "../../types/Event";

// Updates the player song state embed stuff
const PlayerUpdate: Event = {
  name: "playerUpdate",
  once: false,
  execute: async (player: ExtPlayer) => {
    const existsMessage = await player?.message?.fetch() ?? null;

    if (!existsMessage) return;
    if (player.isPaused) return;
    if (!player.isPlaying) return;
    if (player.pauseEditing) return;

    const builder = new PlayerEmbedManager(player);
    const embed = await builder.constructSongStateEmbed();
    const row = builder.constructRow();

    try {
      player.message!.edit({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      logger.error(
        `Failed to update player song state embed in guild ${player.message?.guildId}: ${error}`
      );
    }
  },
};

export default PlayerUpdate;
