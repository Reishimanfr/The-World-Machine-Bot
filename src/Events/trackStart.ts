import { Track } from 'poru';
import { ExtClient, ExtPlayer } from '../misc/twmClient';
import PlayerEmbedManager from '../functions/playerEmbedManager';
import { logger } from '../misc/logger';

export const trackStart = async (player: ExtPlayer, track: Track, client: ExtClient) => {
  const guild = await client.guilds.fetch(player.guildId);
  const channel = await guild.channels?.fetch(player.textChannel);

  if (!channel?.isTextBased()) return;

  // For the global scope
  let control = new PlayerEmbedManager(player);

  const row = control.constructRow();
  const embed = await control.constructSongStateEmbed(track);

  if (!embed) return;

  const options = {
    embeds: [embed],
    components: [row],
  };

  try {
    if (player.message) {
      await player.message.edit(options);
    } else {
      player.message = await channel.send(options);
    }
  } catch (error) {
    logger.error(`Error while sending/editing song state message: ${error.stack}`);
  }

  player.pauseEditing = false;
};
