import { EmbedBuilder, Events, VoiceState } from 'discord.js';
import { ExtClient, ExtPlayer } from '../../Helpers/ExtendedClient';
import { logger } from '../../Helpers/Logger';
import util from '../../Helpers/Util';
import PlayerEmbedManager from '../../functions/playerEmbedManager';

const UpdateVoiceState = {
  name: Events.VoiceStateUpdate,
  once: false,
  execute: async (oldState: VoiceState, newState: VoiceState, client: ExtClient) => {
    const guildId = oldState?.guild?.id ?? newState?.guild?.id;
    const player = client.poru.players.get(guildId) as ExtPlayer;
  
    if (!player) return;
  
    const builder = new PlayerEmbedManager(player);
    const newBotChannel = newState.guild.members.me?.voice.channel ?? null;
  
    // Bot disconnect event
    if (!newBotChannel) {
      player.destroy();
  
      if (!player?.message) return;
  
      const embed = EmbedBuilder.from(player.message.embeds[0]);
  
      embed.setAuthor({
        name: `Stopped: bot was disconnected.`,
        iconURL: util.playerGifUrl,
      });
  
      try {
        player.message.edit({
          embeds: [embed],
          components: [builder.constructRow(true)],
        });
      } catch (error) {
        logger.error(
          `A error occured while editing message after event [bot disconnected]: ${error.stack}`,
        );
      }
      return;
    }
  
    const membersWithoutBots = newBotChannel?.members?.filter((user) => !user.user.bot);
  
    // Everyone left voice
    if (membersWithoutBots.size == 0) {
      player.destroy();
  
      if (!player?.message) return;
  
      const embed = EmbedBuilder.from(player.message.embeds[0]);
      embed.setAuthor({
        name: 'Stopped: everyone left the channel.',
        iconURL: util.playerGifUrl,
      });
  
      try {
        await player.message.edit({
          embeds: [embed],
          components: [builder.constructRow(true)],
        });
      } catch (error) {
        logger.error(
          `A error occured while editing message after event [everyone left channel]: ${error.stack}`,
        );
      }
    }
  }
}

export default UpdateVoiceState;
