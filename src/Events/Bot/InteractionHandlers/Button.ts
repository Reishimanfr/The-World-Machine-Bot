import { ButtonInteraction, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { client } from '../../..';
import { ExtPlayer } from '../../../Helpers/ExtendedClient';
import { logger } from '../../../Helpers/Logger';
import util from '../../../Helpers/Util';
import { buttonMap } from './ButtonHandlers/!buttonHandler';
import { config } from '../../../config';

const Button = async (button: ButtonInteraction) => {

  if (config.maintenance) {
    return button.reply({
      content: 'The bot is down for maintenance.',
      ephemeral: true
    })
  }

  if (button.customId.startsWith('songcontrol')) {
    const player = client.poru.players.get(button.guildId!) as ExtPlayer;
    const member = await button.guild?.members.fetch(button.user.id);
    const isExceptionButton = ['queueHelp', 'showQueue'].includes(button.customId);

    if (!player) {
      return await button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ This player isn't active anymore. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (!member?.voice.channel && !isExceptionButton) {
      return await button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in a voice channel to use this. ]')
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (
      member?.voice.channelId !== button.guild?.members.me?.voice.channelId &&
      !isExceptionButton
    ) {
      return await button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in the same voice channel to use this. ]')
            .setColor(util.embedColor),
        ],
      });
    }

    const action = button.customId.split('-')[1];
    const handler = buttonMap[action];
    const args = [button, player, client];

    if (!player?.isPlaying && !player.isPaused && !isExceptionButton) {
      return button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Nothing is playing right now. ]')
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (!handler) {
      return await button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Something broke while processing this button. ]')
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    await button.deferReply({ ephemeral: true });

    try {
      await handler(...args);
    } catch (error) {
      logger.error(`Failed to process button ${button.customId}: ${error}`);
    }
  }
};

export default Button;
