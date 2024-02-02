import { type ButtonFunc } from './_Buttons'

export const togglePlayback: ButtonFunc = async ({ interaction, player }) => {
  player.controller.togglePlayback()

  void Promise.all([
    interaction.deferUpdate(),
    player.messageManger.updatePlayerMessage()
  ])
}
