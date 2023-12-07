import { EmbedBuilder } from 'discord.js';
import { embedColor } from '../../../../Helpers/Util';
import { ButtonFunc } from './!buttonHandler';

export const togglePlayback: ButtonFunc = async ({ interaction, player, controller, builder }) => {
  await controller.togglePlayback()
  await builder.updatePlayerMessage()

  await interaction.followUp({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ ${player.isPaused ? "Paused" : "Resumed"}. ]`)
        .setColor(embedColor),
    ], ephemeral: true
  });
};
