import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import PlayerEmbedManager from '../../bot_data/playerEmbedManager';
import { logger } from '../../misc/logger';
import addToAuditLog from '../../bot_data/addToAduitLog';

export async function remove(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer,
  _: any,
  builder: PlayerEmbedManager
) {
  let queue = player.queue;
  let input = interaction.options.getString('songs', true);

  const positions: number[] = [];

  const parts = input.split(/[\s,]+/);
  for (const part of parts) {
    if (part.includes('-')) {
      const range = part.split('-');
      const start = parseInt(range[0]);
      const end = parseInt(range[1]);

      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          positions.push(i);
        }
      }
    } else {
      const position = parseInt(part);
      if (!isNaN(position)) {
        positions.push(position);
      }
    }
  }

  const sortedPositions = positions.sort((a, b) => b - a);

  for (const position of sortedPositions) {
    if (position >= 1 && position <= queue.length) {
      queue.splice(position - 1, 1);
    }
  }

  addToAuditLog(
    player,
    interaction.user,
    `Removed song(s) from the queue (position(s): ${input}`
  );

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ Removed position(s) \`${input}\` from the queue. ]`)
        .setColor('#8b00cc'),
    ],
    ephemeral: true,
  });

  if (!player?.message) return;

  const embed = builder.constructSongStateEmbed();

  player.message
    .edit({
      embeds: [embed],
    })
    .catch((error) => logger.error(error.stack));
}
