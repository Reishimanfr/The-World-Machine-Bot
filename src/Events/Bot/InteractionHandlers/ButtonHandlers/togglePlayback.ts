import { ButtonFunc } from './!buttonHandler';

export const togglePlayback: ButtonFunc = async ({ interaction, player, controller, builder }) => {
  await controller.togglePlayback()
  await builder.updatePlayerMessage()

  // idk if I want to reply or not
  // await interaction.followUp({
  //   embeds: [
  //     new EmbedBuilder()
  //       .setDescription(`[ ${player.isPaused ? "Paused" : "Resumed"}. ]`)
  //       .setColor(embedColor),
  //   ], ephemeral: true
  // });
};
