import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const clear: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresVc: true,
    requiresDjRole: true
  },

  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the queue"),

  callback: ({ interaction, player }) => {
    if (player.queue.length <= 0) {
      return interaction.reply({
        content: 'Nothing to clear.',
        ephemeral: true,
      });
    }

    player.queue.length = 0

    interaction.reply({
      content: 'Queue cleared.',
      ephemeral: true,
    });
  },
}

export default clear