import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import util from '../../misc/Util';
import Queue from 'poru/dist/src/guild/Queue';
import addToAuditLog from '../../bot_data/addToAduitLog';

export async function skipto(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer
) {
  const pos = interaction.options.getNumber('position', true);
  const queueLen = player.queue.length;

  if (queueLen < pos) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[ Position **${pos}** is out of queue's scope (Length: **${queueLen}**) ]`
          )
          .setColor(util.twmPurpleHex),
      ],
      ephemeral: true,
    });
  }

  const currentQueue = player.queue;
  const newQueue = currentQueue.slice(pos - 1, queueLen) as Queue;

  player.queue = newQueue;
  player.seekTo(player.currentTrack.info.length);

  addToAuditLog(
    player,
    interaction.user,
    `(skipto): Skipped to song at position ${pos}`
  );

  return await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ Skipped to song **${newQueue.at(0).info.title}**. ]`)
        .setColor(util.twmPurpleHex),
    ],
    ephemeral: true,
  });
}
