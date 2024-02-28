import { ButtonInteraction } from 'discord.js'
import { ExtPlayer } from '../Helpers/ExtendedPlayer'
import { ExtClient } from '../Helpers/ExtendedClient'

export type Button = (args: {
  interaction: ButtonInteraction
  player: ExtPlayer
  client: ExtClient
}) => void