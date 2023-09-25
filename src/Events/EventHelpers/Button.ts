import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { client } from '../..';
import { ExtPlayer } from '../../misc/twmClient';
import { buttonMap } from '../Controller/!buttonHandler';
import { logger } from '../../misc/logger';
import util from '../../misc/Util';

const Button = async (button: ButtonInteraction) => {
  if (button.customId.startsWith('songcontrol')) {
    const player = client.poru.players.get(button.guildId!) as ExtPlayer;

    if (!player) {
      return await button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ This player isn't active anymore. ]")
            .setColor(util.twmPurpleHex),
        ],
      });
    }

    const action = button.customId.split('-')[1];
    const handler = buttonMap[action];
    const args = [button, player, client];

    if (!player.isPlaying && !player.isPaused) {
      return button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Nothing is playing right now. ]')
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }

    if (!handler) {
      return await button.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Something broke while processing this button. ]')
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }

    try {
      await handler(...args);
    } catch (error) {
      logger.error(`Failed to process button ${button.customId}: ${error.stack}`);

      await button.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Something went wrong while running this. ]')
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }
  }
};

export default Button;
