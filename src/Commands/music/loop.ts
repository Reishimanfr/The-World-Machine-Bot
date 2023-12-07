import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

const loop: Command = {
  permissions: [],

  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Toggles looping for the currently playing track"),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true,
    requiresDjRole: true
  },

  callback: async ({ interaction, player, controller }) => {
    const loopString = {
      'NONE': 'Looping disabled',
      'TRACK': 'Looping this track',
      'QUEUE': 'Looping the queue'
    }
    
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ ${loopString[player.loop]}. ]`)
          .setColor(embedColor),
      ], ephemeral: true,
    });
    
    await controller.toggleLoop()
  },
};

export default loop;
