import { EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../Helpers/ExtendedClient";
import { logger } from "../../Helpers/Logger";
import util from "../../Helpers/Util";
import PlayerEmbedManager from "../../functions/playerEmbedManager";
import constructProgressBar from "../../functions/progressBar";
import Event from "../../types/Event";
import timeoutPlayer from "../../functions/timeoutPlayer";

const QueueEnd: Event = {
  name: "queueEnd",
  once: false,
  execute: (player: ExtPlayer) => {
    if (!player?.message) return;

    const embed = EmbedBuilder.from(player.message?.embeds[0]);
    const descriptionSplit = embed.data.description?.split("\n");
    const builder = new PlayerEmbedManager(player);

    // if (player.settings.leaveAfterQueueEnd) {
    //   player.disconnect();
    //   player.destroy();

    //   embed.setAuthor({
    //     name: `Stopped: The queue ended.`,
    //     iconURL: util.playerGifUrl,
    //   });
    //   embed.setDescription(
    //     `${descriptionSplit?.[0] ?? ""}\n\n${constructProgressBar(
    //       1,
    //       1
    //     )}\nSong ended.`
    //   );

    //   try {
    //     player.message.edit({
    //       embeds: [embed],
    //       components: [builder.constructRow(true)],
    //     });
    //   } catch (error) {
    //     logger.error(
    //       `A error occurred while trying to edit message after queue end`
    //     );
    //     logger.error(error);
    //   }
    //   return;
    // }

    // Sets the player timeout 
    timeoutPlayer.setup(player);

    embed.setDescription(
      `${descriptionSplit?.[0] ?? ""}\n\n${constructProgressBar(
        1,
        1
      )}\nSong ended.`
    );
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
