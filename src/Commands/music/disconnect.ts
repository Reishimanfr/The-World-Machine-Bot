import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const disconnect: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Destroys the player and disconnects the bot."),

  callback: ({ interaction, player }) => {
    player.disconnect();

    interaction.reply({
      content: 'The bot has been disconnected.'
    });
  },
}

export default disconnect