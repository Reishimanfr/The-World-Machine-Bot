import { AutocompleteInteraction, ChatInputCommandInteraction, PermissionResolvable, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'
import { ExtPlayer } from '../Helpers/ExtendedPlayer'
import { ExtClient } from '../Helpers/ExtendedClient'

interface MusicOptions {
  /** Must be in a voice channel to be used */
  requiresVc?: boolean
  /** Must be playing music to use */
  requiresPlaying?: boolean
  /** Must have the DJ role to use */
  requiresDjRole?: boolean
}

interface Args<T> {
  interaction: ChatInputCommandInteraction
  client: ExtClient
  player: T extends true ? ExtPlayer : null
}

export interface Command<requirePlayer = true> {
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
  autocomplete?: (interaction: AutocompleteInteraction) => any
}