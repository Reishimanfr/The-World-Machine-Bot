import { Track } from 'poru';
import { ExtClient, ExtPlayer } from '../../Helpers/ExtendedClient';
import { logger } from '../../Helpers/Logger';
import { config } from '../../config';
import PlayerEmbedManager from '../../functions/playerEmbedManager';

const TrackStart = {
  name: 'trackStart',
  once: false,
  execute: async (player: ExtPlayer, track: Track, client: ExtClient) => {
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
  
    // Send initial message
    if (!player.message) {
      player.message = await channel.send(options);
      return;
    }
  
    if (config.player.resendEmbedAfterSongEnd) {
      const exists = (await channel.messages.fetch({ limit: 1 })).at(0);
  
      // Message is not first
      if (
        exists?.author.id !== client.user?.id &&
        !exists?.embeds.length &&
        !exists?.embeds.at(0)?.footer?.text.startsWith('Requested by')
      ) {
        player.message.delete().catch(() => {});
  
        player.message = await channel.send(options);
      }
    }
  
    try {
      if (player.message) {
        await player.message.edit(options);
      }
    } catch (error) {
      logger.error(`Error while editing song state message: ${error.stack}`);
    }
  
    player.pauseEditing = false;
  }
}

export default TrackStart
