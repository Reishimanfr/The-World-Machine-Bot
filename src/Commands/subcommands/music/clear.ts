import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../../Helpers/ExtendedClient';
import util from '../../../Helpers/Util';
import { config } from '../../../config';
import Subcommand from '../../../types/Subcommand';

const clear: Subcommand = {
  musicOptions: {
    requiresPlayer: false,
    requiresPlaying: false,
    requiresVc: true,
  },

  callback: (interaction: ChatInputCommandInteraction, player: ExtPlayer) => {
    player.queue.length = 0;

    util.addToAuditLog(player, interaction.user, 'Cleared the queue');

    interaction.reply({
      embeds: [new EmbedBuilder().setDescription('[ Queue cleared. ]').setColor(util.embedColor)],
      ephemeral: !config.player.announcePlayerActions,
    });
  },
};

export default clear;
