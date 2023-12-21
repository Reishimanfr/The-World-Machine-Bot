import {
  SlashCommandBuilder
} from "discord.js";
import { VoteSkipStatus } from "../../Helpers/PlayerController";
import Command from "../../types/Command";

const skip: Command = {
  permissions: ['Speak', 'Connect', 'SendMessages'],
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the currently playing song."),

  callback: async ({ interaction, player }) => {
    const status = await player.controller.invokeVoteSkip(interaction)

    if (status === VoteSkipStatus.LoopingEnabled) {
      return interaction.reply({
        content: 'Disable looping to skip this track.',
        ephemeral: true
      })
    }

    if (status === VoteSkipStatus.Disabled
      || status === VoteSkipStatus.UnmetCondition
      || status === VoteSkipStatus.OwnSkip) {
      player.seekTo(99999999)

      return interaction.reply({
        content: 'Song skipped.',
        ephemeral: true
      })
    }

    if (status === VoteSkipStatus.Error) {
      return interaction.reply({
        content: 'A error occurred while invokin a vote skip.',
        ephemeral: true
      })
    }
  },
}

export default skip