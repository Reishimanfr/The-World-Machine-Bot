import { ButtonFunc } from './!buttonHandler';

export const togglePlayback: ButtonFunc = async ({ controller, builder, interaction }) => {
  Promise.all([
    interaction.deferUpdate(),
    controller.togglePlayback(),
    builder.updatePlayerMessage()
  ])
};
