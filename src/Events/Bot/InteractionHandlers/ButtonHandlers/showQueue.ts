import { logger } from "../../../../Helpers/Logger";
import { ButtonFunc } from "./!buttonHandler";

export const showQueue: ButtonFunc = async ({ interaction, queue }) => {
  const embeds = queue.createQueueEmbed();

  if (!embeds) {
    return interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true
    });
  }

  logger.info(`Embeds: ${embeds.length}`);

  if (embeds.length === 1) {
    return interaction.reply({
      embeds: [...embeds],
      ephemeral: true
    });
  }

  let description = embeds[0].data.description += '### :warning: For full list of songs, use the `/queue` command!'

  await interaction.reply({
    embeds: [
      embeds[0].setDescription(description)
    ],
    ephemeral: true
  });
}