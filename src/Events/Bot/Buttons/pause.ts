import type { Button } from '../../../Types/Button'

const togglePlayback: Button = {
  name: 'togglePlayback',
  musicOptions: {
    requiresDjRole: true,
    requiresVc: true
  },

  run: async ({ interaction, player }) => {
    player.pause(!player.isPaused)
    player.messageManger.updatePlayerMessage()

    interaction.reply({
      content: player.isPaused ? 'Paused' : 'Resumed',
      ephemeral: true
    })
  }
}

export default togglePlayback