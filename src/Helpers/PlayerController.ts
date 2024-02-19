import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, type ButtonInteraction, type ChatInputCommandInteraction, type Guild, type GuildMember, type User } from 'discord.js'
import { type LavalinkResponse, type LoadType, type Response } from 'poru'
import { setTimeout as timeout } from 'timers/promises'
import { formatSeconds } from '../Funcs/FormatSeconds'
import { config } from '../config'
import { type ExtPlayer } from './ExtendedClasses'
import { logger } from '../config'
import { MessageManager } from './MessageManager'
import { embedColor, inactiveGifUrl } from './Util'

export enum SaveStatus {
  'DmChannelFailure',
  'NotPlaying',
  'Success'
}

export enum VoteSkipStatus {
  'Disabled',
  'LoopingEnabled',
  'Error',
  'Success',
  'NotPlaying',
  'UnmetCondition',
  'Failed',
  'OwnSkip'
}

class PlayerController {
  private readonly player: ExtPlayer
  private readonly messageManager: MessageManager
  private readonly sourceIcons = {
    spotify: '<:spotify:1171916955268169778>',
    youtube: '<:youtuberemovebgpreview:1171917891059331103>',
    soundcloud: '<:soundcloud:1171916943192752199>'
  }

  constructor (player: ExtPlayer) {
    this.player = player
    this.messageManager = new MessageManager(player)
  }

  /**
   * Toggles the player playback
   * @param override Set a override to ignore toggling and instead set the value to override
   */
  public togglePlayback (override?: boolean) {
    if (override !== undefined) {
      this.player.pause(override)
    } else {
      this.player.pause(!this.player.isPaused)
    }
  }

  /**
   * Resolves a search query or url and appends the result if it's a track or search result
   */
  public async resolveQueryOrUrl (query: string, requester: GuildMember | User): Promise<[LoadType, Response]> {
    const result = await this.player.poru.resolve({
      query,
      source: 'ytsearch',
      requester: {
        username: requester.displayName,
        id: requester.id,
        avatar: requester.displayAvatarURL()
      }
    })

    const loadType = result.loadType

    if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
      const track = result.tracks[0]

      this.player.queue.add(track)
      return [loadType, result]
    }

    // ['LOAD_FAILED', 'NO_MATCHES', 'PLAYLIST_LOADED']
    return [loadType, result]
  }

  /**
   * Adds all songs from a playlist to the player queue
   */
  public async loadPlaylist (result: LavalinkResponse) {
    if (result.loadType !== 'PLAYLIST_LOADED') {
      throw new Error(`Expected PLAYLIST_LOADED load type, got ${result.loadType} instead.`)
    }

    const tracks = result.tracks

    tracks.forEach(track => {
      this.player.queue.add(track)
    })
  }

  /**
   * Sets up a player timeout that destroys the player after 10 seconds unless cancelled
   */
  public async setupPlayerTimeout () {
    // Player timeout set in config.yml converted to minutes
    const playerTimeout = config.hostPlayerOptions.playerTimeout * 60 * 1000

    // Returns if the playerTimeout is set to 0 or less
    if (playerTimeout <= 0) return

    // Creates a timeout and binds it to the player.timeout property
    this.player.timeout = setTimeout(async () => {
      this.player.destroy()

      const message = await this.player.message?.fetch()
        .catch(() => undefined)

      if (!message) return

      const embed = await this.messageManager.createPlayerEmbed()

      embed.setAuthor({
        name: 'The player has timed out.',
        iconURL: inactiveGifUrl
      })

      await message.edit({
        embeds: [embed],
        components: [this.messageManager.createPlayerButtons(true)]
      })
    }, playerTimeout)
  }

  /**
   * Toggles the current player loop
   * @param override
   */
  public toggleLoop (override?: 'NONE' | 'QUEUE' | 'TRACK') {
    const currentLoop = this.player.loop

    if (override) {
      this.player.setLoop(override)
    } else {
      const loopOrder = ['NONE', 'QUEUE', 'TRACK']
      const currentIdx = loopOrder.indexOf(currentLoop)
      const nextIdx = (currentIdx + 1) % loopOrder.length
      const nextLoop = loopOrder[nextIdx]

      // Type not exported from poru :( )
      this.player.setLoop(nextLoop as any)
    }
  }

  /**
   * Cancels a pending player timeout
   */
  public cancelPlayerTimeout (): void {
    if (!this.player.timeout) return

    clearTimeout(this.player.timeout)

    this.player.timeout = null
  }

  /**
   * Sends the currently playing track to user's dms
   */
  public async saveTrack (user: GuildMember, guild: Guild): Promise<SaveStatus> {
    if (!this.player.isPlaying) return SaveStatus.NotPlaying

    const info = this.player.currentTrack.info
    const dmChannel = await user.createDM()
      .catch(() => null)

    if (!dmChannel) return SaveStatus.DmChannelFailure

    const savedFrom = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setDisabled(true)
          .setCustomId('lol')
          .setStyle(ButtonStyle.Secondary)
          .setLabel(`Send from ${guild.name}`)
      )

    const image = (info.sourceName === 'spotify')
      ? await this.messageManager.fetchSpotifyThumbnail(info.identifier)
      : info.image

    const trackInfo = new EmbedBuilder()
      .setAuthor({ name: `Originally requested by ${info.requester.username}`, iconURL: info.requester.avatar })
      .setDescription(`
* **[${info.title} - ${info.author}](${info.uri})**
* Source: **${info.sourceName.charAt(0).toUpperCase() + info.sourceName.slice(1)}** ${this.sourceIcons[info.sourceName] ?? ''}
* Length: **${formatSeconds(info.length / 1000)}**
* Saved at: **~${formatSeconds(this.player.position / 1000)}**`)
      .setImage(image ?? null)
      .setColor(embedColor)

    await dmChannel.send({
      embeds: [trackInfo],
      components: [savedFrom]
    })

    return SaveStatus.Success
  }
}

export { PlayerController }

