import { SaveStatus } from '../../../Helpers/ExtendedPlayer'
import { Button } from '../../../Types/Button'

export const save: Button = async ({ interaction, player }) => {
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
      content: 'Song saved to DMs.',
    })
  }
}
