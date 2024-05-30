import type { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, Message, PermissionResolvable, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'
import type { ExtPlayer } from '../Helpers/ExtendedPlayer'
import type { Bot } from '../Classes/Bot'

export interface Command<T = true> {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | SlashCommandSubcommandsOnlyBuilder
        | SlashCommandOptionsOnlyBuilder

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
  }>) => Promise<unknown>
  autocomplete?: (interaction: AutocompleteInteraction<'cached'>) => Promise<unknown>
}