import { Button } from '../../../Types/Button'

export const togglePlayback: Button = async ({ interaction, player }) => {
  player.controller.togglePlayback()

  void Promise.all([
    interaction.deferUpdate(),
    player.messageManger.updatePlayerMessage()
  ])
}
