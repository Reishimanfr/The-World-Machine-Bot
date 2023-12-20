import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionResolvable,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
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

type Command = {
  data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder
  permissions: PermissionResolvable[] | null
  callback: (args: {
    interaction: ChatInputCommandInteraction
    client: ExtClient
    player: ExtPlayer
    message: MessageManager
    controller: PlayerController
    queue: QueueManager
  }) => any;
  helpPage?: EmbedBuilder
  musicOptions?: MusicOptions
};

export default Command;