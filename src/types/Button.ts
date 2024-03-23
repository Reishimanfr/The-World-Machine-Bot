import { ButtonInteraction } from 'discord.js'
import { ExtPlayer } from '../Helpers/ExtendedPlayer'
import { Bot } from '../Classes/Bot'

export type Button = (args: {
  interaction: ButtonInteraction
  player: ExtPlayer
  client: Bot
}) => any