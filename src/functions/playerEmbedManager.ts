import axios from 'axios';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { Track } from 'poru';
import { ExtPlayer } from '../Helpers/ExtendedClient';
import util from '../Helpers/Util';
import { formatSeconds } from './formatSeconds';
import constructProgressBar from './progressBar';

// Embed manager for the music player state embed
// This class both has code for the embed and buttons
class PlayerEmbedManager {
  private player: ExtPlayer;

  constructor(player: ExtPlayer) {
    this.player = player;
  }

  public constructRow(disableAll = false): ActionRowBuilder<ButtonBuilder> {
    let buttons: ButtonBuilder[] = [];
    const data = [
      { id: 'showQueue', emoji: '<:show_queue:1136985358920331274>' },
      {
        id: 'togglePlayback',
        emoji: `${
          this.player.isPlaying
            ? 'pausexxl:1136983966428180624'
            : 'playxxl:1136983968735039488'
        }`,
      },
      {
        id: 'loop',
        emoji: '<:loop:1136983970052051064>',
        style: this.player.loop == 'NONE' ? null : ButtonStyle.Success,
      },
      {
        id: 'skip',
        emoji: '<:skip:1137003301259444305>',
      },
      {
        id: 'queueHelp',
        emoji: '❔',
        style: ButtonStyle.Secondary,
      },
    ];

    for (const entry of data) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`songcontrol-${entry.id}`)
          .setEmoji(entry.emoji)
          .setStyle(entry.style ?? ButtonStyle.Primary)
          .setDisabled(disableAll)
      );
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
  }

  public async constructSongStateEmbed(
    metadata: Track = this.player.currentTrack
  ): Promise<EmbedBuilder> {
    const info = metadata?.info;
    const embed = EmbedBuilder.from(this.player?.message?.embeds[0]!);

    if (!info) {
      return embed.setFooter({ text: '⚠️ Missing metadata info. ' });
    }

    const timeInSeconds = formatSeconds(Math.trunc(info.length / 1000));
    const playerInSeconds = formatSeconds(Math.trunc(this.player?.position / 1000));

    let image = info.image;

    if (info.sourceName == 'spotify') {
      const res = await axios.get(
        `https://embed.spotify.com/oembed/?url=spotify:track:${info.identifier}`
      );

      image = res.data.thumbnail_url;
    }

    const queueLenOrPlayingStatus =
      this.player.queue.length > 0
        ? `There ${
            this.player.queue.length == 1
              ? 'is one song'
              : `are ${this.player.queue.length} songs`
          } in the queue`
        : this.player.isPaused
        ? 'Paused...'
        : 'Now Playing...';

    return new EmbedBuilder()
      .setAuthor({
        name: `${queueLenOrPlayingStatus}`,
        iconURL: util.playerGifUrl,
      })
      .setTitle(info.title)
      .setURL(info.uri)
      .setDescription(
        `By: **${info.author}**\n
        \n${constructProgressBar(
          info.length,
          this.player.position
        )}\n${playerInSeconds}/${timeInSeconds}`
      )
      .setThumbnail(image ?? null)
      .setFooter({
        text: `Requested by ${info?.requester?.user?.username}`,
        iconURL: info?.requester?.user?.displayAvatarURL(),
      })
      .setColor(util.embedColor);
  }
}

export default PlayerEmbedManager;
