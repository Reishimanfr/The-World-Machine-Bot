import { Client, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, PermissionResolvable, CommandInteraction } from 'discord.js'

export default interface Command {
    data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> | SlashCommandSubcommandsOnlyBuilder
    permissions: PermissionResolvable[]
    run: (interaction: CommandInteraction, client: Client) => Promise<any> | any
}