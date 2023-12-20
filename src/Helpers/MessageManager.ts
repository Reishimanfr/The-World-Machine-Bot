import axios from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { formatSeconds } from "../Funcs/FormatSeconds";
import constructProgressBar from "../Funcs/ProgressBarConstructor";
import { ExtPlayer } from "./ExtendedClasses";
import { inactiveGifUrl, playerGifUrl } from "./Util";

interface ButtonOverrides {
  queue?: boolean
  playback?: boolean
  skip?: boolean
  loop?: boolean
  save?: boolean
}

class MessageManager {
  private readonly player: ExtPlayer
  private icons = {
    play: '<:play:1175222722788331641>',
    pause: '<:pause:1175222719726497874>',
    queue: '<:queue:1175222726420594738>',
    skip: '<:skip:1175222721865597018>',
    loop: '<:loop:1175222728010252450>',
    save: '<:save:1175222724143091713>'
  }

  constructor(player: ExtPlayer) {
    this.player = player
  }

  public async fetchSpotifyThumbnail(identifier: string): Promise<string> {
    const request = await axios.get(`https://embed.spotify.com/oembed/?url=spotify:track:${identifier}`);
    const image = request.data.thumbnail_url

    return image
  }

  /**
   * Construct a music player state embed
   */
  public async createPlayerEmbed() {
    const player = this.player
    const info = player.currentTrack.info

    const image = (info.sourceName === 'spotify')
      ? await this.fetchSpotifyThumbnail(info.identifier)
      : info.image

    const progressBar = constructProgressBar(info.length, player.position)
    // These are used for the user-readable progress notation under the progress bar
    const songLength = formatSeconds(info.length / 1000)
    // Here we round the number to the nearest one divisible by 5 (for more consistency)
    // For exmaple 14 -> 15, 12 -> 10
    const playerPosition = formatSeconds(Math.round((player.position / 1000) / 5) * 5)

    const description = `By: **${info.author}**\n\n${progressBar}\n${playerPosition}/${songLength}`
    const queueOrPlaying = (player.queue.length > 0)
      ? `There ${player.queue.length === 1 ? 'is one song' : `are ${player.queue.length} songs`} in the queue`
      : player.isPaused ? 'Paused' : 'Now Playing' + '...'

    return new EmbedBuilder()
      .setAuthor({
        name: queueOrPlaying,
        iconURL: this.player.isPlaying ? playerGifUrl : inactiveGifUrl
      })
      .setTitle(`${info.title}`)
      .setURL(info.uri)
      .setDescription(description)
      .setThumbnail(image ?? null)
      .setFooter({
        text: `Requested by ${info.requester.username}`,
        iconURL: info.requester.avatar
      })
      .setColor('#2b2d31')
  }

  /**
   * Construct buttons for the music player embed
   */
  public createPlayerButtons(disableAll = false, overrides?: ButtonOverrides): ActionRowBuilder<ButtonBuilder> {
    const loopColor = {
      'NONE': ButtonStyle.Primary,
      'TRACK': ButtonStyle.Success,
      'QUEUE': ButtonStyle.Danger
    }

    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('songcontrol-showQueue')
          .setEmoji(this.icons.queue)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(overrides?.queue ?? disableAll),

        new ButtonBuilder()
          .setCustomId('songcontrol-togglePlayback')
          .setEmoji(this.player.isPaused ? this.icons.play : this.icons.pause)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(overrides?.playback ?? disableAll),

        new ButtonBuilder()
          .setCustomId('songcontrol-skip')
          .setEmoji(this.icons.skip)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(overrides?.skip || this.player.loop === 'TRACK' ? true : disableAll),

        new ButtonBuilder()
          .setCustomId('songcontrol-loop')
          .setEmoji(this.icons.loop)
          .setStyle(loopColor[this.player.loop])
          .setDisabled(overrides?.loop ?? disableAll),

        new ButtonBuilder()
          .setCustomId('songcontrol-save')
          .setEmoji(this.icons.save)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(overrides?.save ?? disableAll)
      );
  }

  /**
   * Forcefully updates the music player embed message
   */
  public async updatePlayerMessage() {
    const message = await this.player.message?.fetch()
      .catch(() => undefined)

    if (!message) return

    await message.edit({
      embeds: [await this.createPlayerEmbed()],
      components: [this.createPlayerButtons()]
    })
  }
}

export { MessageManager };

