import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { logger } from "../../Helpers/Logger";
import PlayerEmbedManager from "../../functions/MusicEmbedManager";
import Event from "../../types/Event";

// Updates the player song state embed stuff
const PlayerUpdate: Event = {
  name: "playerUpdate",
  once: false,
  execute: async (player: ExtPlayer) => {
    const time = player.timeInVc ||= 0
    player.timeInVc = time + 15

    if (!player.settings?.dynamicNowPlayingMessage) return
    if (player.pauseEditing) return;
    if (!player.isPlaying) return;
    if (player.isPaused) return;

    const existsMessage = await player?.message?.fetch().catch(() => { }) ?? null;

    if (!existsMessage) return;

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
