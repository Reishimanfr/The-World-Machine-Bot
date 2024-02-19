import { ButtonFunc } from './_Buttons'

export const loop: ButtonFunc = async ({ interaction, player }) => {
  const loopString = {
    NONE: 'Looping disabled',
    TRACK: 'Looping this track',
    QUEUE: 'Looping the queue'
  }

  player.controller.toggleLoop()
  player.messageManger.updatePlayerMessage()

  await interaction.reply({
    content: loopString[player.loop],
    ephemeral: true
  })
}
