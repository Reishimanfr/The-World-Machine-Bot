import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import addToAuditLog from '../../bot_data/addToAduitLog';
import Queue from 'poru/dist/src/guild/Queue';
import util from '../../misc/Util';

export default function clear(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer
) {
  player.queue = new Queue();

  addToAuditLog(player, interaction.user, 'Cleared the queue');

  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription('[ Queue cleared. ]')
        .setColor(util.twmPurpleHex),
    ],
  });
}
