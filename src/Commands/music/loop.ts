import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const loop: Command = {
  permissions: [],
  musicOptions: {
    requiresDjRole: true,
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Toggles looping for the currently playing track"),

  callback: async ({ interaction, player }) => {
    const loopString = {
      'NONE': 'Looping disabled',
      'TRACK': 'Looping this track',
      'QUEUE': 'Looping the queue'
    }

    await player.controller.toggleLoop()

    interaction.reply({
      content: loopString[player.loop],
      ephemeral: true
    });
  },
}

export default loop