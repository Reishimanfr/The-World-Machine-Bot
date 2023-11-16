import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import { ExtClient, ExtPlayer } from "../../../Helpers/ExtendedClasses";
import { logger } from "../../../Helpers/Logger";
import util from "../../../Helpers/Util";
import PlayerEmbedManager from "../../../functions/MusicEmbedManager";
import Subcommand from "../../../types/Subcommand";

const nowplaying: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: false // any
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer,
    client: ExtClient,
    builder: PlayerEmbedManager
  ) => {
    if (!interaction.inCachedGuild()) return;

    if (!interaction.channel?.permissionsFor(client.user!.id)?.has('SendMessages')) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ I can\'t send messages in this channel. ]')
            .setColor(util.embedColor)
        ], ephemeral: true
      })
    }

    interaction.deferReply({ ephemeral: true });

    try {
      await player.message?.delete();
    } catch (error) {
      logger.error(`Failed to delete old song state message: ${error}`);
    } finally {
      const nowPlayingEmbed = await builder.constructSongStateEmbed();
      const buttons = builder.constructRow();

      let res: Message<true> | undefined = undefined; // idk the type for it lol

      try {
        res = await interaction.channel?.send({
          embeds: [nowPlayingEmbed],
          components: [buttons],
        });
      } catch (error) {
        logger.error(`[nowplaying.ts]: Failed to send message: ${error}`);
      }

      if (!res) return;

      player.message = res;

      try {
        await interaction.deleteReply();
      } catch { }
    }
  },
};

export default nowplaying;
