import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import { ExtClient, ExtPlayer } from '../Helpers/ExtendedClasses';
import PlayerEmbedManager from '../functions/MusicEmbedManager';

interface Subcommand {
  callback: (
    interaction: CommandInteraction | ChatInputCommandInteraction,
    player: ExtPlayer,
    client: ExtClient,
    builder: PlayerEmbedManager,
  ) => any;
  musicOptions: {
    /** Must be in a voice channel to be used */
    requiresVc: boolean;
    /** Must be playing music to use */
    requiresPlaying: boolean;
    /** Must be active player to use */
    requiresPlayer: boolean;
    /** Must have the DJ role to use */
    requiresDjRole: boolean;
  };
}

export default Subcommand;
