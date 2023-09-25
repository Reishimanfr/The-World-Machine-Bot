import PlayerEmbedManager from '../../bot_data/playerEmbedManager';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import { logger } from '../../misc/logger';
import util from '../../misc/Util';

export async function nowplaying(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer,
  _: any,
  builder: PlayerEmbedManager
) {
  if (!interaction.inCachedGuild()) return;
  interaction.deferReply({ ephemeral: true });

  try {
    await player.message?.delete();
  } catch (error) {
    logger.error(`Failed to delete old song state message: ${error.stack}`);
  }

  const nowPlayingEmbed = builder.constructSongStateEmbed();
  const buttons = builder.constructRow();

  if (!nowPlayingEmbed) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Something went wrong while generating the embed. ]')
          .setColor(util.twmPurpleHex),
      ],
    });
  }

  const res = await interaction.channel?.send({
    embeds: [nowPlayingEmbed],
    components: [buttons],
  });

  if (!res) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Something went wrong while sending the message. ]')
          .setColor(util.twmPurpleHex),
      ],
    });
  }

  player.message = res;

  try {
    await interaction.deleteReply();
  } catch (error) {
    logger.error(`Failed to delete old interaction: ${error.stack}`);
  }
}
