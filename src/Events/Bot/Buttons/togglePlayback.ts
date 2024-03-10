import { Button } from '../../../Types/Button'

export const togglePlayback: Button = async ({ interaction, player }) => {
  await interaction.deferUpdate()
  player.controller.togglePlayback()
  player.messageManger.updatePlayerMessage()
}
