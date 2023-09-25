import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import addToAuditLog from '../../bot_data/addToAduitLog';
import util from '../../misc/Util';

export async function pause(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer
) {
  if (!interaction.inCachedGuild()) return;

  if (player.isPaused) {
    player.pause(false);
  } else {
    player.pause(true);
  }

  addToAuditLog(
    player,
    interaction.user,
    `${player.isPaused ? 'Paused' : 'Resumed'} the player`
  );

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ ${player.isPaused ? 'Paused' : 'Resumed'}. ]`)
        .setColor(util.twmPurpleHex),
    ],
    ephemeral: true,
  });
}
