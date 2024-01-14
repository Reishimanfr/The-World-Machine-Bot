import { ButtonFunc } from './!buttonHandler';

export const togglePlayback: ButtonFunc = async ({ interaction, player }) => {
  Promise.all([
    interaction.deferUpdate(),
    player.controller.togglePlayback(),
    player.messageManger.updatePlayerMessage()
  ])
};
