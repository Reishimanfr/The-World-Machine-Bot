import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import Queue from 'poru/dist/src/guild/Queue';
import { ExtPlayer } from '../../../Helpers/ExtendedClient';
import util from '../../../Helpers/Util';
import { config } from '../../../config';
import Subcommand from '../../../types/Subcommand';

const skipto: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
  },

  callback: async (interaction: ChatInputCommandInteraction, player: ExtPlayer) => {
    const pos = interaction.options.getNumber('position', true);
    const queueLen = player.queue.length;

    if (queueLen < pos) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `[ Position **${pos}** is out of queue's scope (Length: **${queueLen}**) ]`,
            )
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    const currentQueue = player.queue;
    const newQueue = currentQueue.slice(pos - 1, queueLen) as Queue;

    player.queue = newQueue;
    player.seekTo(player.currentTrack!.info.length);

    util.addToAuditLog(player, interaction.user, `(skipto): Skipped to song at position ${pos}`);

    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ Skipped to song **${newQueue.at(0)!.info.title}**. ]`)
          .setColor(util.embedColor),
      ],
      ephemeral: !config.player.announcePlayerActions,
    });
  },
};

export default skipto;
