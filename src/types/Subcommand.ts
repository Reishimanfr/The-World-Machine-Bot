import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { ExtClient, ExtPlayer } from '../Helpers/ExtendedClient';
import PlayerEmbedManager from '../functions/playerEmbedManager';

interface Subcommand {
  callback: (
    interaction: CommandInteraction | ChatInputCommandInteraction,
    player: ExtPlayer,
    client: ExtClient,
    builder: PlayerEmbedManager,
  ) => any;
  musicOptions: {
    // Must be in vc to use
    requiresVc: boolean;
    // Must be playing music to use
    requiresPlaying: boolean;
    // Must be active player to use
    requiresPlayer: boolean;
  };
}

export default Subcommand;
