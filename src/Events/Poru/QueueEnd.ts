import { EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { logger } from "../../Helpers/Logger";
import util from "../../Helpers/Util";
import constructProgressBar from "../../functions/ProgressBarConstructor";
import Event from "../../types/Event";
import timeoutPlayer from "../../functions/TimeoutPlayer";
import PlayerDestroy from "./PlayerDestroy";

const QueueEnd: Event = {
  name: "queueEnd",
  once: false,
  execute: async (player: ExtPlayer) => {
    if (!player?.message) return;

    const embed = EmbedBuilder.from(player.message?.embeds[0]);
    const descriptionSplit = embed.data.description?.split("\n");

    if (player.settings.leaveAfterQueueEnd) {
      return await PlayerDestroy.execute(player, 'the queue ended.')
    }

    // Sets the player timeout 
    timeoutPlayer.setup(player);

    embed.setDescription(`${descriptionSplit?.[0] ?? ""}\n\n${constructProgressBar(1, 1)}\nSong ended.`);
    embed.setAuthor({
      name: "Waiting for another song...",
      iconURL: util.playerGifUrl,
    });

    player.pauseEditing = true;

    try {
      player.message.edit({
        embeds: [embed],
      });
    } catch (error) {
      logger.error(`Failed to update message on queue end: ${error}`);
    }
  },
};

export default QueueEnd;
