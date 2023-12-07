import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Queue from "poru/dist/src/guild/Queue";
import { embedColor } from "../../Helpers/Util";
import { config as botConfig } from "../../config";
import Command from "../../types/Command";

const skipto: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("skipto")
    .setDescription("Skip to a specified song in the queue")
    .addNumberOption(pos => pos
      .setName("position")
      .setDescription("Position in the queue to skip to")
      .setRequired(true)
      .setAutocomplete(botConfig.hostPlayerOptions.autocomplete)
      .setMinValue(1)
    ),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: async ({ interaction, player }) => {
    const position = interaction.options.getNumber("position", true);

    // This means autocomplete was used with a invalid value since pos can't be less than 1
    // If it's sent as a command (thanks discord!)
    if (position == -1) return;

    if (player.queue.length < position) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`[ There isn\'t a song in the position you specified. ]`)
            .setColor(embedColor),
        ], ephemeral: true,
      });
    }

    player.queue = player.queue.slice(position - 1, player.queue.length) as Queue;
    player.seekTo(player.currentTrack!.info.length);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ Skipped to song **${player.queue.at(0).info.title}**. ]`)
          .setColor(embedColor),
      ], ephemeral: true
    });
  },
};

export default skipto;
