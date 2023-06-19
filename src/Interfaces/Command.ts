import { Client, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, PermissionResolvable, CommandInteraction } from 'discord.js';

export default interface Command {
    data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder;
    permissions: PermissionResolvable[];
    run: (interaction: CommandInteraction, client: Client) => Promise<any> | any;
} // eslint-disable-line
  // For some reason eslint kept requiring a semicolen
  // no matter how many you added ¯\_(ツ)_/¯