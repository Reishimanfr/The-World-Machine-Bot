import { Button } from '../../../Types/Button'

export const loop: Button = async ({ interaction, player }) => {
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
