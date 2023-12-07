import { ChatInputCommandInteraction } from 'discord.js';
import { ExtClient, ExtPlayer } from '../Helpers/ExtendedClasses';
import { MessageManager } from '../Helpers/MessageManager';
import { PlayerController } from '../Helpers/PlayerController';
import { QueueManager } from '../Helpers/QueueManager';

export interface MusicOptions {
  /** Must be in a voice channel to be used */
  requiresVc?: boolean;
  /** Must be playing music to use */
  requiresPlaying?: boolean;
  /** Must be active player to use */
  requiresPlayer?: boolean;
  /** Must have the DJ role to use */
  requiresDjRole?: boolean;
}

interface Subcommand {
  callback: (args: {
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer,
    client: ExtClient,
    controller: PlayerController,
    builder: MessageManager,
    queue: QueueManager
  }) => any;
  musicOptions: MusicOptions
}

export default Subcommand;
