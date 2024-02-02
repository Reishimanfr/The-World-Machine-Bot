import {
 AutocompleteInteraction,
 ChatInputCommandInteraction,
 Message,
 PermissionResolvable,
 SlashCommandBuilder,
 SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'
import { ExtClient, ExtPlayer } from '../Helpers/ExtendedClasses'
import { MessageManager } from '../Helpers/MessageManager'
import { PlayerController } from '../Helpers/PlayerController'
import { QueueManager } from '../Helpers/QueueManager'

interface MusicOptions {
  /** Must be in a voice channel to be used */
  requiresVc?: boolean
  /** Must be playing music to use */
  requiresPlaying?: boolean
  /** Must have the DJ role to use */
  requiresDjRole?: boolean
}

interface LegacyArgs<T> {
  client: ExtClient
  player: T extends true ? ExtPlayer : null
  message: Message
  args: ReadonlyArray<string>
}

export interface Args<T> {
  interaction: ChatInputCommandInteraction
  client: ExtClient
  player: T extends true ? ExtPlayer : null
  message: T extends true ? MessageManager : null
  controller: T extends true ? PlayerController : null
  queue: T extends true ? QueueManager : null
}

interface Command<requirePlayer = true> {
  // Command data
  data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder

  helpData?: {
    description: string
    examples: Array<string>
    image?: string
    options?: Array<{
      name: string
      description: string
      required: boolean
    }>
  }

  // Permissions
  permissions: {
    user?: Array<PermissionResolvable>
    bot?: Array<PermissionResolvable>
  }

  musicOptions?: MusicOptions

  // Callback functions
  callback: (args: Readonly<Args<requirePlayer>>) => any
  legacy?: (args: Readonly<LegacyArgs<requirePlayer>>) => any
  autocomplete?: (interaction: AutocompleteInteraction) => any
}

export default Command
