import {
  CommandInteraction,
  EmbedBuilder,
  PermissionResolvable,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { ExtClient } from '../Helpers/ExtendedClasses';

type Command = {
  data:
  | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
  | SlashCommandSubcommandsOnlyBuilder;
  permissions: PermissionResolvable[] | null;
  callback: (interaction: CommandInteraction, client: ExtClient) => any;
  helpPage?: EmbedBuilder
};

export default Command;
