import { EmbedBuilder } from 'discord.js';
import { embedColor } from '../../../../Helpers/Util';
import { ButtonFunc } from './!buttonHandler';

export const loop: ButtonFunc = async ({ interaction, player }) => {
  const loopString = {
    'NONE': 'Looping disabled',
    'TRACK': 'Looping this track',
    'QUEUE': 'Looping the queue'
  }

  player.controller.toggleLoop()
  player.messageManger.updatePlayerMessage()

  interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setDescription(`[ ${loopString[player.loop]}. ]`)
      .setColor(embedColor),
    ], ephemeral: true,
  })
};
