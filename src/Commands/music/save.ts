import { ChatInputCommandInteraction, DMChannel, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import util from '../../misc/Util';
import { logger } from '../../misc/logger';
import axios from 'axios';

export async function save(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer
) {
  const currentTrack = player.currentTrack?.info;

  if (!currentTrack) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder().setDescription('[ Nothing is playing right now. ]'),
      ],
      ephemeral: true,
    });
  }

  let dmChannel: DMChannel;

  try {
    dmChannel = await interaction.user.createDM();
  } catch (error) {
    logger.error(
      `Failed to create dm channel for user ${interaction.user.username} (${interaction.user.id}): ${error.stack}`
    );
    return;
  }

  let image = currentTrack.image;

  if (currentTrack.sourceName == 'spotify') {
    const res = await axios.get(
      `https://embed.spotify.com/oembed/?url=spotify:track:${currentTrack.identifier}`
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
      }
    )
    .setImage(image ?? null)
    .setColor(util.twmPurpleHex)
    .setFooter({ text: 'Enjoy the song!' });

  try {
    await dmChannel?.send({
      embeds: [saveTrack],
    });
  } catch (error) {
    logger.error(`[save.ts]: Error while sending to DM channel: ${error.stack}`);
  }
}
