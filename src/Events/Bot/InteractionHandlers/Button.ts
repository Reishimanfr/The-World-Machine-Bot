import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { client } from '../../..';
import { ExtPlayer } from '../../../Helpers/ExtendedClasses';
import { log } from '../../../Helpers/Logger';
import { MessageManager } from '../../../Helpers/MessageManager';
import { PlayerController } from '../../../Helpers/PlayerController';
import { QueueManager } from '../../../Helpers/QueueManager';
import { embedColor } from '../../../Helpers/Util';
import { buttonMap } from './ButtonHandlers/!buttonHandler';

const Button = async (interaction: ButtonInteraction) => {
  if (interaction.customId.startsWith('songcontrol')) {
    const player = client.poru.players.get(interaction.guildId!) as ExtPlayer;
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    const isExceptionButton = ['queueHelp', 'showQueue'].includes(interaction.customId);

    if (!player) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ This player isn't active anymore. ]")
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    if (!member?.voice.channel && !isExceptionButton) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in a voice channel to use this. ]')
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    if (
      member?.voice.channelId !== interaction.guild?.members.me?.voice.channelId &&
      !isExceptionButton
    ) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in the same voice channel to use this. ]')
            .setColor(embedColor),
        ],
      });
    }

    const action = interaction.customId.split('-')[1];
    const handler = buttonMap[action];
    const controller = new PlayerController(player)
    const builder = new MessageManager(player)
    const queue = new QueueManager(player)

    const args = {
      interaction,
      player,
      client,
      controller,
      builder,
      queue
    };

    if (!player?.isPlaying && !player.isPaused && !isExceptionButton) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Nothing is playing right now. ]')
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    if (!handler) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Something broke while processing this button. ]')
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();

    try {
      await handler(args);
    } catch (error) {
      log.error(`Failed to process button ${interaction.customId}: ${error}`);
    }
  }
};

export default Button;
