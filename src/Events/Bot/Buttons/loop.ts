import type { Button } from '../../../Types/Button'

const loop: Button = {
  name: 'loop',
  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  run: async ({ interaction, player }) => {
    const loopString = {
      NONE: 'Looping disabled',
      TRACK: 'Looping this track',
      QUEUE: 'Looping the queue'
    }
  
    player.controller.toggleLoop()
    player.messageManger.updatePlayerMessage()
  
    interaction.reply({
      content: loopString[player.loop],
      ephemeral: true
    })
  }
}

export default loop