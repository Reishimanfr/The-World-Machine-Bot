import { EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../Helpers/ExtendedClient';
import { logger } from '../../Helpers/Logger';
import util from '../../Helpers/Util';
import { config } from '../../config';
import PlayerEmbedManager from '../../functions/playerEmbedManager';
import constructProgressBar from '../../functions/progressBar';

const QueueEnd = {
  name: 'queueEnd',
  once: false,
  execute: (player: ExtPlayer) => {
    if (!player?.message) return;
  
    const embed = EmbedBuilder.from(player.message?.embeds[0]);
    const descriptionSplit = embed.data.description?.split('\n');
    const builder = new PlayerEmbedManager(player);
  
    if (config.player.leaveAfterQueueEnd) {
      player.disconnect();
      player.destroy();
  
      embed.setAuthor({ name: `Stopped: The queue ended.`, iconURL: util.playerGifUrl });
      embed.setDescription(
        `${descriptionSplit?.[0] ?? ''}\n\n${constructProgressBar(1, 1)}\nSong ended.`,
      );
  
      try {
        player.message.edit({
          embeds: [embed],
          components: [builder.constructRow(true)],
        });
      } catch (error) {
        logger.error(`A error occured while trying to edit message after queue end`);
        logger.error(error);
      }
      return;
    }
  
    embed.setDescription(
      `${descriptionSplit?.[0] ?? ''}\n\n${constructProgressBar(1, 1)}\nSong ended.`,
    );
    embed.setAuthor({
      name: 'Waiting for another song...',
      iconURL: util.playerGifUrl,
    });
  
    player.pauseEditing = true;
  
    try {
      player.message.edit({
        embeds: [embed],
      });
    } catch (error) {
      logger.error(`Failed to update message on queue end: ${error.stack}`);
    }
  }
}

export default QueueEnd;
