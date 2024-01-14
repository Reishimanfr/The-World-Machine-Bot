import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const shuffle: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the queue"),

  callback: ({ interaction, player }) => {
    player.queue.shuffle();
    interaction.reply({ content: "Queue shuffled!", ephemeral: true });
  }
}

export default shuffle