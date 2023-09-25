import {
  CommandInteraction,
  PermissionResolvable,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { ExtClient } from '../misc/twmClient';

interface Command {
  data:
    | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
    | SlashCommandSubcommandsOnlyBuilder;
  permissions: PermissionResolvable[] | null;
  musicCommand?: boolean;
  callback: (interaction: CommandInteraction, client: ExtClient) => any;
}

export default Command;
