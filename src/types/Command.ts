import { AutocompleteInteraction, ChatInputCommandInteraction, PermissionResolvable, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'
import { ExtPlayer } from '../Helpers/ExtendedPlayer'
import { Bot } from '../Classes/Bot'

export interface Command<T = true> {
  data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder

  disabled?: boolean

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
    requiresVc?: boolean
    requiresPlaying?: boolean
    requiresDjRole?: boolean
  }

  // Callback functions
  callback: (args: Readonly<{
    interaction: ChatInputCommandInteraction<'cached'>
    client: Bot
    player: T extends true ? ExtPlayer : null
  }>) => any
  autocomplete?: (interaction: AutocompleteInteraction<'cached'>) => any
}