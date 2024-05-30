import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { SaveStatus } from '../../Helpers/ExtendedPlayer'
import type { Command } from '../../Types/Command'

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
    examples: ['```/save```']
  },

  musicOptions: {
    requiresPlaying: true,
    requiresVc: true
  },

  callback: async ({ interaction, player }) => {
    await interaction.deferReply({ ephemeral: true })

    const member = await interaction.guild.members.fetch(interaction.user.id)
    const status = await player.controller.saveTrack(member, interaction.guild)

    const replies = {
      [SaveStatus.NotPlaying]: 'Nothing is playing right now',
      [SaveStatus.DmChannelFailure]: ' I can\'t DM you',
      [SaveStatus.Success]: 'Song saved to DMs'
    }

    interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ ${replies[status]}. ]`)
          .setColor(embedColor)
      ]
    })
  }
}

export default save
