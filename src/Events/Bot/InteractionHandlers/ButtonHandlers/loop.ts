import { EmbedBuilder } from 'discord.js';
import { embedColor } from '../../../../Helpers/Util';
import { ButtonFunc } from './!buttonHandler';

export const loop: ButtonFunc = async ({ interaction, player, controller }) => {
  const loopString = {
    'NONE': 'Looping disabled',
    'TRACK': 'Looping this track',
    'QUEUE': 'Looping the queue'
  }

  await controller.toggleLoop()

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ ${loopString[player.loop]}. ]`)
        .setColor(embedColor),
    ], ephemeral: true,
  });
};
