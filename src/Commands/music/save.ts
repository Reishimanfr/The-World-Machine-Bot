import { SlashCommandBuilder } from "discord.js";
import { fetchMember } from "../../Funcs/FetchMember";
import { SaveStatus } from "../../Helpers/PlayerController";
import Command from "../../types/Command";

const save: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("save")
    .setDescription("Saves the currently playing track to DMs"),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: false,
    requiresDjRole: false
  },

  callback: async ({ interaction, player }) => {
    const guild = interaction.guild

    // Typeguard
    if (!guild) return

    const member = await fetchMember(interaction.guild.id, interaction.user.id)

    // Typeguard
    if (!member) return

    const status = await player.controller.saveTrack(member, guild)

    if (status === SaveStatus.NotPlaying) {
      return interaction.reply({
        content: 'Nothing is playing right now.',
        ephemeral: true
      })
    }

    if (status === SaveStatus.DmChannelFailure) {
      return interaction.reply({
        content: 'I can\'t send you a DM.',
        ephemeral: true
      })
    }

    if (status === SaveStatus.Success) {
      return interaction.reply({
        content: 'Song saved to DMs!',
        ephemeral: true
      })
    }
  },
}

export default save