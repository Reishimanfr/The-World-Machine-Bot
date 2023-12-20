import { EmbedBuilder } from "discord.js";
import { VoteSkipStatus } from "../../../../Helpers/PlayerController";
import { embedColor } from "../../../../Helpers/Util";
import { ButtonFunc } from "./!buttonHandler";

export const skip: ButtonFunc = async ({ interaction, controller, player }) => {
  const status = await controller.invokeVoteSkip(interaction)

  if (status === VoteSkipStatus.LoopingEnabled) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Disable looping to skip this track. ]')
          .setColor(embedColor)
      ], ephemeral: true
    })
  }

  if (status === VoteSkipStatus.Disabled) {
    player.seekTo(99999999)

    return interaction.reply({
      content: 'Song skipped: Vote skipping is disabled on this server.',
      ephemeral: true,

    })
  }

  if (status === VoteSkipStatus.OwnSkip) {
    return interaction.reply({
      content: 'Song skipped: Track requested by user that wants to skip.',
      ephemeral: true
    })
  }

  if (status === VoteSkipStatus.UnmetCondition) {
    player.seekTo(99999999)

    return interaction.reply({
      content: 'Song skipped: Not enough members in voice channel.',
      ephemeral: true,

    })
  }

  if (status === VoteSkipStatus.Error) {
    return interaction.reply({
      content: 'Something went wrong.',
      ephemeral: true,
    })
  }
};
