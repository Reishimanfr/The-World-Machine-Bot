import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

export default <Command>{
  permissions: [],
  musicCommand: true,

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
