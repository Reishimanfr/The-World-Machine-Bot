import { type ButtonInteraction } from 'discord.js'
import { type ExtClient, type ExtPlayer } from '../../../../Helpers/ExtendedClasses'
import { type MessageManager } from '../../../../Helpers/MessageManager'
import { type PlayerController } from '../../../../Helpers/PlayerController'
import { type QueueManager } from '../../../../Helpers/QueueManager'
import { loop } from './loop'
import { save } from './save'
import { showQueue } from './showQueue'
import { skip } from './skip'
import { togglePlayback } from './togglePlayback'

export const buttonMap = {
  showQueue,
  togglePlayback,
  skip,
  loop,
  save
}

export type ButtonFunc = (args: {
  interaction: ButtonInteraction
  player: ExtPlayer
  client: ExtClient
  controller: PlayerController
  builder: MessageManager
  queue: QueueManager
}) => Promise<any>
