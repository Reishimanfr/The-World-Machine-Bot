import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { formatSeconds } from './formatSeconds';
import { ExtPlayer } from '../misc/twmClient';
import constructProgressBar from './progressBar';
import { Track } from 'poru';
import util from '../misc/Util';

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
      { id: 'songcontrol-showQueue', emoji: '<:show_queue:1136985358920331274>' },
      {
        id: 'songcontrol-togglePlayback',
        emoji: `${
          this.player.isPlaying
            ? 'pausexxl:1136983966428180624'
            : 'playxxl:1136983968735039488'
        }`,
      },
      {
        id: 'songcontrol-loop',
        emoji: '<:loop:1136983970052051064>',
        style: this.player.loop == 'NONE' ? ButtonStyle.Danger : ButtonStyle.Success,
      },
      {
        id: 'songcontrol-skip',
        emoji: '<:skip:1137003301259444305>',
      },
      {
        id: 'songcontrol-queueHelp',
        emoji: '❔',
      },
    ];

    for (const entry of data) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(entry.id)
          .setEmoji(entry.emoji)
          .setStyle(entry.style ?? ButtonStyle.Danger)
          .setDisabled(disableAll)
      );
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
  }

  public constructSongStateEmbed(
    metadata: Track = this.player.currentTrack
  ): EmbedBuilder {
    const timeInSeconds = formatSeconds(Math.trunc(metadata?.info?.length / 1000));
    const playerInSeconds = formatSeconds(Math.trunc(this.player?.position / 1000));

    const embed = EmbedBuilder.from(this.player?.message?.embeds[0]!);

    if (!metadata?.info) {
      return embed.setFooter({ text: '⚠️ Missing metadata info. ' });
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
        iconURL: util.nikoGifUrl,
      })
      .setTitle(metadata.info.title)
      .setURL(metadata.info.uri)
      .setDescription(
        `By: **${metadata.info.author}**
        \n${constructProgressBar(
          metadata.info.length,
          this.player.position
        )}\n${playerInSeconds}/${timeInSeconds}`
      )
      .setThumbnail(metadata.info.image ?? null)
      .setFooter({
        text: `Requested by ${metadata.info?.requester?.user?.tag}`,
        iconURL: metadata.info?.requester?.user?.displayAvatarURL(),
      })
      .setColor(util.twmPurpleHex);
  }
}

export default PlayerEmbedManager;
