import { EmbedBuilder } from "discord.js";
import { fetchMember } from "../../../../Funcs/FetchMember";
import { SaveStatus } from "../../../../Helpers/PlayerController";
import { embedColor } from "../../../../Helpers/Util";
import { ButtonFunc } from "./!buttonHandler";

export const save: ButtonFunc = async ({ interaction, player, controller }) => {
  // Typeguard
  if (!interaction.guild) return

  const member = await fetchMember(interaction.guild.id, interaction.user.id)

  // Typeguard
  if (!member) return

  const status = await controller.saveTrack(member, interaction.guild)

  if (status === SaveStatus.NotPlaying) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Nothing is playing right now ]')
          .setColor(embedColor)
      ], ephemeral: true
    })
  }

  if (status === SaveStatus.DmChannelFailure) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ I can\'t DM you. ]')
          .setColor(embedColor)
      ], ephemeral: true
    })
  }

  if (status === SaveStatus.Success) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Song saved to DMs! ]')
          .setColor(embedColor)
      ], ephemeral: true
    })
  }
}