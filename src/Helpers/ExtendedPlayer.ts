import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildMember, Message, User } from 'discord.js'
import { LavalinkResponse, LoadType, Player, Response, Track } from 'poru'
import { PlayerSettings, config, logger } from '../config'
import { Segment } from 'sponsorblock-api'
import axios from 'axios'
import { formatSeconds } from '../Funcs/FormatSeconds'
import constructProgressBar from '../Funcs/ProgressBarConstructor'
import { playerGifUrl, inactiveGifUrl, embedColor } from './Util'

const TranslateSponsorBlockNames = {
  filler: 'Filler',
  interaction: 'Interaction',
  intro: 'Intro',
  music_offtopic: 'Non-music part',
  outro: 'Outro',
  preview: 'Preview',
  selfpromo: 'Self-promotion',
  sponsor: 'Sponsored portion'
} as const

export enum SaveStatus {
  'DmChannelFailure',
  'NotPlaying',
  'Success'
}

export class ExtPlayer extends Player {
  private $message: Message | undefined
  private $pauseEditing: boolean
  private $timeout: NodeJS.Timeout | null
  private $settings: PlayerSettings
  private $voteSkipActive = false
  private $lavalinkUpdateTics = 0
  private $currentSponsoredSegments: Array<Segment>

  // Managers
  public messageManger: MessageManager
  public queueManager: QueueManager
  public controller: PlayerController

  get currentSponsoredSegments(): Array<Segment> {
    return this.$currentSponsoredSegments
  }

  set currentSponsoredSegments(value: Array<Segment>) {
    this.$currentSponsoredSegments = value
  }

  get lavalinkUpdateTics(): number {
    return this.$lavalinkUpdateTics
  }

  set lavalinkUpdateTics(newValue: number) {
    this.$lavalinkUpdateTics = newValue
  }

  get message(): Message | undefined {
    return this.$message
  }

  set message(message: Message) {
    this.$message = message
  }
  get pauseEditing() {
    return this.$pauseEditing
  }

  set pauseEditing(bool: boolean) {
    this.$pauseEditing = bool
  }

  get timeout(): NodeJS.Timeout | null {
    return this.$timeout
  }

  set timeout(timeout: NodeJS.Timeout | null) {
    this.$timeout = timeout
  }

  get settings(): PlayerSettings {
    return this.$settings
  }

  set settings(settings: PlayerSettings) {
    this.$settings = settings
  }

  get votingActive() {
    return this.$voteSkipActive
  }

  set votingActive(bool: boolean) {
    this.$voteSkipActive = bool
  }
}

export class MessageManager {
  private readonly player: ExtPlayer
  private readonly icons = {
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

  public async fetchSpotifyThumbnail(identifier: string): Promise<string | null> {
    try {
      const request = await axios.get(`https://embed.spotify.com/oembed/?url=spotify:track:${identifier}`)
      const image = request.data.thumbnail_url

      return image
    } catch (error) {
      logger.error(`Failed to fetch spotify thumbnail: ${error.stack}`)
      return null
    }
  }

  /**
   * Construct a music player state embed
   */
  public async createPlayerEmbed(): Promise<Array<EmbedBuilder>> {
    const player = this.player
    const info = player.currentTrack.info

    const image = (info.sourceName === 'spotify')
      ? await this.fetchSpotifyThumbnail(info.identifier)
      : info.image

    const progressBar = constructProgressBar(info.length, player.position)
    // These are used for the user-readable progress notation under the progress bar
    const songLength = formatSeconds(info.length / 1000)

    // Here we round the number to the nearest one divisible by 5 (for more consistency)
    // unless the song finished playing. For exmaple 14 = 15 or 12 = 10
    let playerPosition = formatSeconds(info.length)

    if (player.position < info.length) {
      playerPosition = formatSeconds(Math.round((player.position / 1000) / 5) * 5)
    }

    const description = `By: **${info.author}**\n\n${progressBar}\n${playerPosition}/${songLength}\n\n:information_source: Check \`/help\` to get started!`
    const queueOrPlaying = (player.queue.length > 0)
      ? `There ${player.queue.length === 1 ? 'is one song' : `are ${player.queue.length} songs`} in the queue`
      : player.isPaused ? 'Paused' : 'Now Playing' + '...'

    const returnArray: Array<EmbedBuilder> = []

    returnArray.push(
      new EmbedBuilder()
        .setAuthor({
          name: queueOrPlaying,
          iconURL: this.player.isPlaying ? playerGifUrl : inactiveGifUrl
        })
        .setTitle(info.title)
        .setURL(info.uri)
        .setDescription(description)
        .setThumbnail(image ?? null)
        .setFooter({
          text: `Requested by ${info.requester.username ?? ''}`,
          iconURL: info.requester.avatar ?? undefined
        })
        .setColor('#2b2d31')
    )

    const sponsoredSegments = player?.currentSponsoredSegments ?? [] // just to be safe

    const sponsoredPartsStrings: Array<string> = []

    for (const part of sponsoredSegments) {
      sponsoredPartsStrings.push(`**${TranslateSponsorBlockNames[part.category]}** from \`${formatSeconds(Math.trunc(part.startTime))}\` to \`${formatSeconds(Math.trunc(part.endTime))}\``)
    }

    if (sponsoredPartsStrings.length > 0) {
      returnArray.push(
        new EmbedBuilder()
          .setAuthor({ name: 'Sponsorblock: auto-skipping these parts:' })
          .setDescription(sponsoredPartsStrings.join('\n'))
          .setColor('#2b2d31')
      )
    }

    return returnArray
  }

  /**
   * Construct buttons for the music player embed
   */
  public createPlayerButtons(disableAll = false, overrides?: {
    queue?: boolean
    playback?: boolean
    skip?: boolean
    loop?: boolean
    save?: boolean
  }): ActionRowBuilder<ButtonBuilder> {
    const loopColor = {
      NONE: ButtonStyle.Primary,
      TRACK: ButtonStyle.Success,
      QUEUE: ButtonStyle.Danger
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
          .setDisabled(overrides?.skip ?? this.player.loop === 'TRACK' ? true : disableAll),

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
      )
  }

  /**
   * Forcefully updates the music player embed message
   */
  public async updatePlayerMessage() {
    const message = await this.player.message?.fetch()
      .catch(() => undefined)

    if (!message) return

    const embeds = await this.createPlayerEmbed()

    await message.edit({
      embeds: [...embeds],
      components: [this.createPlayerButtons()]
    })
  }
}

export class PlayerController {
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

      embed[0].setAuthor({
        name: 'The player has timed out.',
        iconURL: inactiveGifUrl
      })

      await message.edit({
        embeds: [...embed],
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

export class QueueManager {
  private readonly player: ExtPlayer
  private readonly ENTRIES_PER_PAGE = 6

  constructor(player: ExtPlayer) {
    this.player = player
  }

  /**
   * Formats a embed queue field 
   */
  private formatQueueField(track: Track, iteration: number) {
    const info = track.info

    const linkedTitleAndAuthor = `\`${iteration}\`: **[${info.title} - ${info.author}](${info.uri})**`

    return `${linkedTitleAndAuthor}\nAdded by <@${info.requester.id}> | Duration: \`${formatSeconds(info.length / 1000)}\`\n\n`
  }

  /**
   * Creates a embed with the current queue entries
   */
  public createQueueEmbed(): EmbedBuilder[] | null {
    const queue = this.player.queue

    if (queue.length < 1) return null

    const entryStrings: string[] = []
    const embeds: EmbedBuilder[] = []

    for (let i = 0; i < queue.length; i++) {
      const entry: Track = queue[i]
      entryStrings.push(this.formatQueueField(entry, i + 1))
    }

    // Split by 6 entries per page
    for (let i = 0; i < entryStrings.length; i += this.ENTRIES_PER_PAGE) {
      const slice = entryStrings.slice(i, i += this.ENTRIES_PER_PAGE)

      let description = ''

      for (const part of slice) {
        description += part
      }

      embeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `[ There are ${entryStrings.length} songs in the queue. ]`,
          })
          .setDescription(description)
      )
    }

    return embeds
  }
}