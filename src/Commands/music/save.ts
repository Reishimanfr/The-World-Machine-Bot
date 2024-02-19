import { SlashCommandBuilder } from 'discord.js'
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

  helpData: {
    description: 'Saves the currently playing song to bot DMs',
    examples: [
      '```/save```'
    ]
  },

  musicOptions: {
    requiresPlaying: true,
    requiresVc: true
  },

  callback: async ({ interaction, player }) => {
    if (!interaction.guild) return
    await interaction.deferReply({ ephemeral: true })

    const member = await interaction.guild.members.fetch(interaction.user.id)
    const status = await player.controller.saveTrack(member, interaction.guild)

    if (status === SaveStatus.NotPlaying) {
      return await interaction.editReply({
        content: 'Nothing is playing right now.'
      })
    }

    if (status === SaveStatus.DmChannelFailure) {
      return await interaction.editReply({
        content: 'I can\'t send you a DM.'
      })
    }

    if (status === SaveStatus.Success) {
      return await interaction.editReply({
        content: 'Song saved to DMs!'
      })
    }
  }
}

export default save
