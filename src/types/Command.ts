import { AutocompleteInteraction, ChatInputCommandInteraction, PermissionResolvable, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'
import { ExtPlayer } from '../Helpers/ExtendedPlayer'
import { Bot } from '../Classes/Bot'

export interface Command<T = true> {
  // Command data
  data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder

  helpData?: {
    description: string
    examples?: string[]
    tags?: string[]
    options?: {
      name: string
      description: string
      required: boolean
    }[]
  }

  // Permissions
  permissions: {
    user?: PermissionResolvable[]
    bot?: PermissionResolvable[]
  }

  musicOptions?: {
    /** Must be in a voice channel to be used */
    requiresVc?: boolean
    /** Must be playing music to use */
    requiresPlaying?: boolean
    /** Must have the DJ role to use */
    requiresDjRole?: boolean
  }

  // Callback functions
  callback: (args: Readonly<{
    interaction: ChatInputCommandInteraction
    client: Bot
    player: T extends true ? ExtPlayer : null
  }>) => any
  autocomplete?: (interaction: AutocompleteInteraction) => any
}