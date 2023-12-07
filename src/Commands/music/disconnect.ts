import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

const disconnect: Command = {
  permissions: [],

  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnects the bot from the channel and clears the queue"),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: ({ interaction, player }) => {
    player.disconnect();

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("[ The bot has been disconnected. ]")
          .setColor(embedColor),
      ],
    });
  },
};

export default disconnect;
