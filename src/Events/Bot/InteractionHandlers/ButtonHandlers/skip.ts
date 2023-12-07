import { EmbedBuilder } from "discord.js";
import { VoteSkipStatus } from "../../../../Helpers/PlayerController";
import { embedColor } from "../../../../Helpers/Util";
import { ButtonFunc } from "./!buttonHandler";

export const skip: ButtonFunc = async ({ interaction, controller, player }) => {
  const status = await controller.invokeVoteSkip(interaction)

  if (status === VoteSkipStatus.LoopingEnabled) {
    return interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Disable looping the track to skip. ]')
          .setColor(embedColor)
      ], ephemeral: true
    })
  }

  if (status === VoteSkipStatus.Disabled) {
    player.seekTo(99999999)

    return interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Song skipped: Vote skipping is disabled in this server. ]')
          .setColor(embedColor)
      ], ephemeral: true
    })
  }

  if (status === VoteSkipStatus.UnmetCondition) {
    player.seekTo(99999999)

    return interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Song skipped: Not enough members in voice channel. ]')
          .setColor(embedColor)
      ], ephemeral: true
    })
  }

  if (status === VoteSkipStatus.Error) {
    return interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ A error occurred while invoking a vote skip. ]')
          .setColor('DarkRed')
      ], ephemeral: true
    })
  }
};
