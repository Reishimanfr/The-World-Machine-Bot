import type { Button } from '../../../Types/Button'

const togglePlayback: Button = {
  name: 'togglePlayback',
  musicOptions: {
    requiresDjRole: true,
    requiresVc: true
  },

  run: async ({ interaction, player }) => {
    const member = await interaction.guild?.members.fetch(interaction.user.id)

    if (!member?.voice.channel) {
      return interaction.reply({
        content: 'You must be in a voice channel to use this command.',
        ephemeral: true
      })
    }
  
    await interaction.deferUpdate()
    player.pause(!player.isPaused)
    player.messageManger.updatePlayerMessage()
  }
}

export default togglePlayback