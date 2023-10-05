import { EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../misc/twmClient';
import constructProgressBar from '../functions/progressBar';
import { logger } from '../misc/logger';
import util from '../misc/Util';

const queueEnd = (player: ExtPlayer) => {
  if (!player?.message) return;

  const embed = EmbedBuilder.from(player.message?.embeds[0]);
  const descriptionSplit = embed.data.description?.split('\n');

  embed.setDescription(`${descriptionSplit?.[0] ?? ''}\n\n${constructProgressBar(1, 1)}\nSong ended.`);
  embed.setAuthor({
    name: 'Waiting for another song...',
    iconURL: util.nikoGifUrl,
  });

  player.pauseEditing = true;

  try {
    player.message.edit({
      embeds: [embed],
    });
  } catch (error) {
    logger.error(`Failed to update message on queue end: ${error.stack}`);
  }
};

export default queueEnd;
