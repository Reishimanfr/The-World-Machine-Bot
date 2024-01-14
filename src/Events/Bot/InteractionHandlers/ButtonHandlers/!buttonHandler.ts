import { ButtonInteraction } from 'discord.js';
import { ExtClient, ExtPlayer } from '../../../../Helpers/ExtendedClasses';
import { MessageManager } from '../../../../Helpers/MessageManager';
import { PlayerController } from '../../../../Helpers/PlayerController';
import { QueueManager } from '../../../../Helpers/QueueManager';
import { loop } from './loop';
import { save } from './save';
import { showQueue } from './showQueue';
import { skip } from './skip';
import { togglePlayback } from './togglePlayback';

export const buttonMap = {
  showQueue,
  togglePlayback,
  skip,
  loop,
  save,
};

export type ButtonFunc = (args: {
  interaction: ButtonInteraction,
  player: ExtPlayer,
  client: ExtClient,
  controller: PlayerController,
  builder: MessageManager,
  queue: QueueManager
}) => Promise<any>
