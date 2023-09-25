import { EmbedBuilder, VoiceState } from 'discord.js';
import { ExtClient, ExtPlayer } from '../misc/twmClient';
import PlayerEmbedManager from '../bot_data/playerEmbedManager';
import { logger } from '../misc/logger';

const UpdateVoiceState = async (
  oldState: VoiceState,
  newState: VoiceState,
  client: ExtClient
) => {
  const guildId = oldState?.guild?.id ?? newState?.guild?.id;
  const player = client.poru.players.get(guildId) as ExtPlayer;

  if (!player) return;

  const builder = new PlayerEmbedManager(player);
  const botChannel = newState.guild.members.me?.voice.channel ?? null;

  // Bot disconnect event
  if (!botChannel) {
    player.destroy();

    if (!player?.message) return;

    const embed = EmbedBuilder.from(player.message.embeds[0]);

    embed.setAuthor({
      name: `Stopped: bot was disconnected.`,
      iconURL:
        'https://media.discordapp.net/attachments/968786035788120099/1134526510334738504/niko.gif',
    });

    try {
      player.message.edit({
        embeds: [embed],
        components: [builder.constructRow(true)],
      });
    } catch (error) {
      logger.error(
        `A error occured while editing message after event [bot disconnected]: ${error.stack}`
      );
    }
    return;
  }

  const membersWithoutBots = botChannel?.members?.filter((user) => !user.user.bot);

  // Everyone left voice
  if (membersWithoutBots.size == 0) {
    player.destroy();

    if (!player?.message) return;

    const embed = EmbedBuilder.from(player.message.embeds[0]);
    embed.setAuthor({
      name: 'Stopped: everyone left the channel.',
      iconURL:
        'https://media.discordapp.net/attachments/968786035788120099/1134526510334738504/niko.gif',
    });

    try {
      await player.message.edit({
        embeds: [embed],
        components: [builder.constructRow(true)],
      });
    } catch (error) {
      logger.error(
        `A error occured while editing message after event [everyone left channel]: ${error.stack}`
      );
    }
  }
};

export default UpdateVoiceState;
