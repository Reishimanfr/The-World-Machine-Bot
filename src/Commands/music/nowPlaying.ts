import PlayerEmbedManager from '../../functions/playerEmbedManager';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import { logger } from '../../misc/logger';
import util from '../../misc/Util';

export async function nowplaying(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer,
  _: any,
  builder: PlayerEmbedManager,
) {
  if (!interaction.inCachedGuild()) return;
  interaction.deferReply({ ephemeral: true });

  try {
    await player.message?.delete();
  } catch (error) {
    logger.error(`Failed to delete old song state message: ${error.stack}`);
  }

  const nowPlayingEmbed = await builder.constructSongStateEmbed();
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

  let res; // idk the type for it lol

  try {
    res = await interaction.channel?.send({
      embeds: [nowPlayingEmbed],
      components: [buttons],
    });
  } catch (error) {
    logger.error(`[nowplaying.ts]: Failed to send message: ${error.stack}`);
  }

  player.message = res;

  try {
    await interaction.deleteReply();
  } catch {}
}
