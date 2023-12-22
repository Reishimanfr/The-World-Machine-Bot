import constructProgressBar from "../../Funcs/ProgressBarConstructor";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { log } from "../../Helpers/Logger";
import { MessageManager } from "../../Helpers/MessageManager";
import { PlayerController } from "../../Helpers/PlayerController";
import { inactiveGifUrl } from "../../Helpers/Util";
import Event from "../../types/Event";
import PlayerDestroy from "./PlayerDestroy";

const QueueEnd: Event = {
  name: "queueEnd",
  once: false,
  execute: async (player: ExtPlayer) => {
    const builder = new MessageManager(player)
    const controller = new PlayerController(player)

    // Set the player timeout
    controller.setupPlayerTimeout()

    const embed = await builder.createPlayerEmbed()
    const buttons = builder.createPlayerButtons(true)
    const descriptionSplit = embed.data.description?.split("\n");

    if (player.settings.queueEndDisconnect) {
      return await PlayerDestroy.execute(player, 'the queue ended.')
    }

    const message = await player.message?.fetch()
      .catch(() => null)

    if (!message) return

    embed.setDescription(`${descriptionSplit?.[0] ?? ""}\n\n${constructProgressBar(1, 1)}\nSong ended.`);
    embed.setAuthor({
      name: "Waiting for another song...",
      iconURL: inactiveGifUrl
    });

    player.pauseEditing = true;

    try {
      await message.edit({
        embeds: [embed],
        components: [buttons]
      });
    } catch (error) {
      log.error(`Failed to update message on queue end: ${error}`);
    }
  },
};

export default QueueEnd;
