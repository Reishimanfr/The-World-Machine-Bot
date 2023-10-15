import {
  CommandInteraction,
  PermissionResolvable,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { ExtClient } from '../Helpers/ExtendedClient';

type Command = {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder;
  permissions: PermissionResolvable[] | null;
  callback: (interaction: CommandInteraction, client: ExtClient) => any;
};

export default Command;
