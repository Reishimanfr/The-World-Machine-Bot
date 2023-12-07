import {
  EmbedBuilder, SlashCommandBuilder
} from "discord.js";
import { log } from "../../Helpers/Logger";
import { VoteSkipStatus } from "../../Helpers/PlayerController";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

const skip: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the currently playing song."),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true,
    requiresDjRole: false
  },

  callback: async ({ interaction, controller, player }) => {
    const status = await controller.invokeVoteSkip(interaction)

    log.debug(`Vote skipping invokation status: ${status}`)

    if (status === VoteSkipStatus.LoopingEnabled) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Disable looping the track to skip. ]')
            .setColor(embedColor)
        ], ephemeral: true
      })
    }

    if (status === VoteSkipStatus.Disabled) {
      player.seekTo(99999999)

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Song skipped: Vote skipping is disabled in this server. ]')
            .setColor(embedColor)
        ], ephemeral: true
      })
    }

    if (status === VoteSkipStatus.UnmetCondition) {
      player.seekTo(99999999)

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Song skipped: Not enough members in voice channel. ]')
            .setColor(embedColor)
        ], ephemeral: true
      })
    }

    if (status === VoteSkipStatus.Error) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ A error occurred while invoking a vote skip. ]')
            .setColor('DarkRed')
        ], ephemeral: true
      })
    }
  },
};

export default skip;