import { SaveStatus } from '../../../Helpers/ExtendedPlayer'
import { Button } from '../../../Types/Button'

const save: Button = {
  name: 'save',
  musicOptions: {
    requiresPlaying: true,
    requiresVc: true
  },

  run: async ({ interaction, player }) => {
    await interaction.deferReply({ ephemeral: true })
  
    const member = await interaction.guild.members.fetch(interaction.user.id)
    const status = await player.controller.saveTrack(member, interaction.guild)
  
    const replies = {
      [SaveStatus.DmChannelFailure]: 'I can\'t send you a DM.',
      [SaveStatus.NotPlaying]: 'Nothing is playing right now.',
      [SaveStatus.Success]: 'Song saved to DMs.',
    }
  
    interaction.editReply({
      content: replies[status],
    })
  }
}

export default save
