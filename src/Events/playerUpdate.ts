import { ExtPlayer } from '../misc/twmClient';
import PlayerEmbedManager from '../functions/playerEmbedManager';
import { logger } from '../misc/logger';

// Updates the player song state embed stuff
const playerUpdate = async (player: ExtPlayer) => {
  const existsMessage = await player?.message?.fetch();

  if (!existsMessage) return;
  if (player.isPaused) return;
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
    logger.error(`Failed to update player song state embed in guild ${player.message?.guildId}: ${error.stack}`);
  }
};

export default playerUpdate;
