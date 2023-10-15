import { ChatInputCommandInteraction, EmbedBuilder, Message } from 'discord.js';
import { ExtPlayer } from '../../../Helpers/ExtendedClient';
import { logger } from '../../../Helpers/Logger';
import util from '../../../Helpers/Util';
import PlayerEmbedManager from '../../../functions/playerEmbedManager';
import Subcommand from '../../../types/Subcommand';

const nowplaying: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer,
    _: any,
    builder: PlayerEmbedManager,
  ) => {
    if (!interaction.inCachedGuild()) return;
    interaction.deferReply({ ephemeral: true });

    try {
      await player.message?.delete();
    } catch (error) {
      logger.error(`Failed to delete old song state message: ${error.stack}`);
    }

    const nowPlayingEmbed = await builder.constructSongStateEmbed();
    const buttons = builder.constructRow();

    if (!nowPlayingEmbed) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Something went wrong while generating the embed. ]')
            .setColor(util.embedColor),
        ],
      });
    }

    let res: Message<true> | undefined = undefined; // idk the type for it lol

    try {
      res = await interaction.channel?.send({
        embeds: [nowPlayingEmbed],
        components: [buttons],
      });
    } catch (error) {
      logger.error(`[nowplaying.ts]: Failed to send message: ${error.stack}`);
    }

    if (!res) return;

    player.message = res;

    try {
      await interaction.deleteReply();
    } catch {}
  },
};

export default nowplaying;
