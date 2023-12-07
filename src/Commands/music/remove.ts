import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { log } from "../../Helpers/Logger";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

const remove: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes a song (or multiple songs) from the queue.")
    .addStringOption(input => input
      .setName("songs")
      .setDescription("Songs to be removed. Check help for bulk removing.")
      .setRequired(true)
    ),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: async ({ interaction, player, message }) => {
    let queue = player.queue;
    let input = interaction.options.getString("songs", true);

    const positions: number[] = [];

    const parts = input.split(/[\s,]+/);
    for (const part of parts) {
      if (part.includes("-")) {
        const range = part.split("-");
        const start = parseInt(range[0]);
        const end = parseInt(range[1]);

        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            positions.push(i);
          }
        }
      } else {
        const position = parseInt(part);
        if (!isNaN(position)) {
          positions.push(position);
        }
      }
    }

    const sortedPositions = positions.sort((a, b) => b - a);

    for (const position of sortedPositions) {
      if (position >= 1 && position <= queue.length) {
        queue.splice(position - 1, 1);
      }
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[ Removed position(s) \`${input}\` from the queue. ]`
          )
          .setColor(embedColor),
      ],
      ephemeral: true
    });

    if (!player?.message) return;

    const embed = await message.createPlayerEmbed();

    player.message
      .edit({
        embeds: [embed],
      })
      .catch((error) => log.error(error));
  },
};

export default remove;
