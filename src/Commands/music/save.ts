import { SlashCommandBuilder } from 'discord.js'
import { fetchMember } from '../../Funcs/FetchMember'
import { SaveStatus } from '../../Helpers/PlayerController'
import type Command from '../../types/Command'

const save: Command<true> = {
  permissions: {
    user: ['SendMessages', 'Connect', 'Speak'],
    bot: ['SendMessages', 'Connect', 'Speak']
  },

  data: new SlashCommandBuilder()
    .setName('save')
    .setDescription('Saves the currently playing track to DMs'),

  musicOptions: {
    requiresPlaying: true,
    requiresVc: true
  },

  callback: async ({ interaction, player }) => {
    if (!interaction.guild) return

    const member = await fetchMember(interaction.guild.id, interaction.user.id)

    // Typeguard
    if (!member) return

    const status = await player.controller.saveTrack(member, interaction.guild)

    if (status === SaveStatus.NotPlaying) {
      return await interaction.reply({
        content: 'Nothing is playing right now.',
        ephemeral: true
      })
    }

    if (status === SaveStatus.DmChannelFailure) {
      return await interaction.reply({
        content: 'I can\'t send you a DM.',
        ephemeral: true
      })
    }

    if (status === SaveStatus.Success) {
      return await interaction.reply({
        content: 'Song saved to DMs!',
        ephemeral: true
      })
    }
  }
}

export default save
