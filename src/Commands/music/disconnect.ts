import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const disconnect: Command = {
  permissions: [],
  musicOptions: {
    requiresDjRole: true,
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnects the bot from the channel and clears the queue"),

  callback: ({ interaction, player }) => {
    player.disconnect();

    interaction.reply({
      content: 'The bot has been disconnected.'
    });
  },
}

export default disconnect