import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

const clear: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clears the queue"),

  musicOptions: {
    requiresPlayer: false,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: ({ interaction, player }) => {
    if (player.queue.length <= 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Nothing to clear. ]')
            .setColor(embedColor)
        ], ephemeral: true
      })
    }

    player.queue.length = 0;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("[ Queue cleared. ]")
          .setColor(embedColor),
      ],
      ephemeral: true,
    });
  },
};

export default clear;
