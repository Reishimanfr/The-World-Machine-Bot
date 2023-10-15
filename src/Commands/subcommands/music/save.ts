import axios from 'axios';
import { ChatInputCommandInteraction, DMChannel, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../../Helpers/ExtendedClient';
import { logger } from '../../../Helpers/Logger';
import util from '../../../Helpers/Util';
import Subcommand from '../../../types/Subcommand';

const save: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: false,
  },

  callback: async (interaction: ChatInputCommandInteraction, player: ExtPlayer) => {
    const currentTrack = player.currentTrack?.info;

    if (!currentTrack) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setDescription('[ Nothing is playing right now. ]')],
        ephemeral: true,
      });
    }

    let dmChannel: DMChannel;

    try {
      dmChannel = await interaction.user.createDM();
    } catch (error) {
      logger.error(
        `Failed to create dm channel for user ${interaction.user.username} (${interaction.user.id}): ${error.stack}`,
      );
      return;
    }

    let image = currentTrack.image;

    if (currentTrack.sourceName == 'spotify') {
      const res = await axios.get(
        `https://embed.spotify.com/oembed/?url=spotify:track:${currentTrack.identifier}`,
      );

      image = res.data.thumbnail_url;
    }

    const saveTrack = new EmbedBuilder()
      .setAuthor({
        name: `Saved from ${interaction.guild?.name} | #${interaction.guild?.members.me?.voice.channel?.name}`,
        iconURL: interaction.guild?.iconURL() ?? undefined,
      })
      .setFields(
        {
          name: 'Title',
          value: `**[${currentTrack.title}](${currentTrack.uri})**`,
        },
        {
          name: 'Author',
          value: `${currentTrack.author}`,
        },
      )
      .setImage(image ?? null)
      .setColor(util.embedColor)
      .setFooter({ text: 'Enjoy the song!' });

    try {
      await dmChannel?.send({
        embeds: [saveTrack],
      });
    } catch (error) {
      logger.error(`[save.ts]: Error while sending to DM channel: ${error.stack}`);
    }
  },
};

export default save;
