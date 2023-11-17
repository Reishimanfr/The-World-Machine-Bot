import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { ExtPlayer } from "../Helpers/ExtendedClasses";
import util from "../Helpers/Util";
import { formatSeconds } from "./FormatSeconds";
import constructProgressBar from "./ProgressBarConstructor";
import { logger } from "../Helpers/Logger";
import { Track } from "poru";

// Embed manager for the music player state embed
// This class both has code for the embed and buttons
class PlayerEmbedManager {
  private player: ExtPlayer;

  constructor(player: ExtPlayer) {
    this.player = player;
  }

  public constructRow(disableAll = false): ActionRowBuilder<ButtonBuilder> {
    const buttons: ButtonBuilder[] = [
      new ButtonBuilder()
        .setCustomId('songcontrol-showQueue')
        .setEmoji('<:show_queue:1136985358920331274>')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disableAll),

      new ButtonBuilder()
        .setCustomId('songcontrol-togglePlayback')
        .setEmoji(this.player.isPaused ? "<:playxxl:1136983968735039488>" : "<:pausexxl:1136983966428180624>")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disableAll),

      new ButtonBuilder()
        .setCustomId('songcontrol-skip')
        .setEmoji('<:skip:1137003301259444305>')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disableAll),

      new ButtonBuilder()
        .setCustomId('songcontrol-loop')
        .setEmoji('<:loop:1136983970052051064>')
        .setStyle(ButtonStyle[this.player.loop == 'NONE' ? 'Primary' : 'Success'])
        .setDisabled(disableAll),

      new ButtonBuilder()
        .setCustomId('songcontrol-queueHelp')
        .setEmoji('❔')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disableAll),
    ]

    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(buttons);
  }

  private async requestSpotifyThumbnail(identifier: string): Promise<string | null> {
    try {
      const result = await axios.get(`https://embed.spotify.com/oembed/?url=spotify:track:${identifier}`);
      return result.data.thumbnail_url
    } catch (error) {
      logger.error(`Failed to get spotify thumbnail: ${error}`);
      return null
    }
  }

  public async constructSongStateEmbed(): Promise<EmbedBuilder> {
    const player = this.player
    const info = player.currentTrack.info
    const requester = info.requester as GuildMember

    if (!info) {
      return new EmbedBuilder()
        .setDescription('[ Something went wrong. ]')
        .setColor(util.embedColor)
    }

    const songLength = formatSeconds(info.length / 1000);
    const playerPosition = formatSeconds(player?.position / 1000);

    const image = (info.sourceName == "spotify")
      ? await this.requestSpotifyThumbnail(info.identifier)
      : info.image;

    const queueLenOrPlayingStatus = (player.queue.length > 0)
      // If there are multiple tracks in the queue
      ? `There ${player.queue.length == 1 ? "is one song" : `are ${player.queue.length} songs`} in the queue`
      // If there is only one track in the queue
      : `${player.isPaused ? "Paused" : "Now Playing"}...`

    const progressBar = constructProgressBar(info.length, player.position);
    const description = `By: **${info.author}**\n\n${progressBar}\n${playerPosition}/${songLength}`

    return new EmbedBuilder()
      .setAuthor({
        name: `${queueLenOrPlayingStatus}`,
        iconURL: util.playerGifUrl,
      })
      .setTitle(info.title)
      .setURL(info.uri)
      .setDescription(description)
      .setThumbnail(image ?? null)
      .setFooter({
        text: `Requested by ${requester.user.username}`,
        iconURL: requester.user.displayAvatarURL(),
      })
      .setColor('#2b2d31');
  }

  public constructQueueEmbed(queue = this.player.queue): EmbedBuilder[] {
    let queueEntires: string[] = [];
    const splitter = 6; // The amount of queue entries to split by

    for (let i = 0; i < queue.length; i++) {
      const entry: Track = queue[i];
      const requester = entry.info.requester as GuildMember
      let content = "";

      // Parts of the content
      // Index
      content += `\`${i + 1}:\` `;
      // Title - Author in hyperlink
      content += `**[${entry.info.title} - ${entry.info.author}](${entry.info.uri})**`;
      // Added by
      content += `\nAdded by <@${requester.user.id}> `;
      // Duration
      content += `| Duration: \`${formatSeconds(
        entry.info.length / 1000
      )}\`\n\n`;

      queueEntires.push(content);
    }

    if (queue.length > splitter) {
      let embeds: EmbedBuilder[] = [];

      for (let i = 0; i < queueEntires.length; i += splitter) {
        const arraySlice = queueEntires.slice(i, i + splitter);

        embeds.push(
          new EmbedBuilder()
            .setAuthor({
              name: `[ There are ${queueEntires.length} songs in the queue. ]`,
            })
            .setDescription(arraySlice.join())
        );
      }

      return embeds;
    } else {
      return [
        new EmbedBuilder()
          .setAuthor({
            name: `[ There are ${queueEntires.length} songs in the queue. ]`,
          })
          .setDescription(queueEntires.join()),
      ];
    }
  }
}

export default PlayerEmbedManager;
