import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type Guild, type GuildMember, type Message } from 'discord.js'
import { Player, type Track } from 'poru'
import { logger } from './Logger'
import type { Segment } from 'sponsorblock-api'
import axios from 'axios'
import constructProgressBar from '../Funcs/ProgressBarConstructor'
import { playerGifUrl, inactiveGifUrl } from './Util'
import type { PlayerSettingsI } from '../Models'
import { TimeFormatter } from '../Classes/TimeFormatter'

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
  DmChannelFailure = 0,
  NotPlaying = 1,
  Success = 2
}

export interface PlayerIconsI {
  [key: string]: string
}

export class ExtPlayer extends Player {
  private $message: Message | undefined
  private $timeout: NodeJS.Timeout | null
  private $settings: PlayerSettingsI
  private $voteSkipActive = false
  private $sponsorSegments: Array<Segment>
  private $icons: PlayerIconsI
  private $serverMuted: boolean

  // Managers
  public messageManger: MessageManager
  public queueManager: QueueManager
  public controller: PlayerController

  get serverMuted() {
    return this.$serverMuted
  }

  set serverMuted(bool: boolean) {
    this.$serverMuted = bool
  }

  get icons() {
    return this.$icons
  }

  set icons(data: PlayerIconsI) {
    this.$icons = data
  }

  get sponsorSegments(): Array<Segment> {
    return this.$sponsorSegments
  }

  set sponsorSegments(value: Array<Segment>) {
    this.$sponsorSegments = value
  }

  get message(): Message | undefined {
    return this.$message
  }

  set message(message: Message | undefined) {
    this.$message = message
  }

  get timeout(): NodeJS.Timeout | null {
    return this.$timeout
  }

  set timeout(timeout: NodeJS.Timeout | null) {
    this.$timeout = timeout
  }

  get settings(): PlayerSettingsI {
    return this.$settings
  }

  set settings(settings: PlayerSettingsI) {
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
  public async createPlayerEmbed(fullProgressBar?: boolean): Promise<Array<EmbedBuilder>> {
    const formatter = new TimeFormatter()
    const player = this.player
    const info = player.currentTrack.info

    const image = (info.sourceName === 'spotify')
      ? await this.fetchSpotifyThumbnail(info.identifier)
      : info.artworkUrl

    const progressBar = constructProgressBar(player, fullProgressBar)
    // These are used for the user-readable progress notation under the progress bar
    const songLength = formatter.duration(info.length / 1000)

    // Here we round the number to the nearest one divisible by 5 (for more consistency)
    // unless the song finished playing. For exmaple 14 = 15 or 12 = 10
    let playerPosition = formatter.duration(info.length)

    if (player.position < info.length) {
      playerPosition = formatter.duration(Math.round((player.position / 1000) / 5) * 5)
    }

    const description = `By: **${info.author}**${info.isStream ? '' : `\n\n${progressBar}\n${playerPosition}/${songLength}`}\n\n:information_source: Check \`/help\` to get started!`
    const queueOrPlaying = (player.queue.length > 0)
      ? `There ${player.queue.length === 1 ? 'is one song' : `are ${player.queue.length} songs`} in the queue`
      : player.isPaused ? 'Paused' : 'Now Playing' + '...'

    const returnArray: Array<EmbedBuilder> = []

    returnArray.push(
      new EmbedBuilder()
        .setAuthor({
          name: info.isStream ? '🔴🎥 Playing a livestream' : queueOrPlaying,
          iconURL: this.player.isPlaying ? playerGifUrl : inactiveGifUrl
        })
        .setTitle(info.title)
        .setURL(info.uri ?? '')
        .setDescription(description)
        .setThumbnail(image ?? null)
        .setFooter({
          text: `Requested by ${info.requester.username ?? ''}`,
          iconURL: info.requester.avatar ?? undefined
        })
        .setColor(info.isStream ? 'Red' : '#2b2d31')
    )

    const sponsoredSegments = player?.sponsorSegments ?? [] // just to be safe
    const sponsoredPartsStrings: Array<string> = []

    for (const part of sponsoredSegments) {
      sponsoredPartsStrings.push(`**${TranslateSponsorBlockNames[part.category]}** from \`${formatter.duration(Math.trunc(part.startTime))}\` to \`${formatter.duration(Math.trunc(part.endTime))}\``)
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

    const pattern = /<:_:(\d+)>/

    // Used to extract IDs from the emoji strings
    const icons = Object.fromEntries(
      Object.entries(this.player.icons).map(([key, value]) => {
        const matchArray = value.match(pattern)

        return [key, matchArray?.[1] ?? '⚠']
      })
    )

    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('queue')
          .setEmoji(icons.queue)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(overrides?.queue ?? disableAll),

        new ButtonBuilder()
          .setCustomId('togglePlayback')
          .setEmoji(this.player.isPaused ? icons.play : icons.pause)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(overrides?.playback ?? disableAll),

        new ButtonBuilder()
          .setCustomId('skip')
          .setEmoji(icons.skip)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(overrides?.skip ?? this.player.loop === 'TRACK' ? true : disableAll),

        new ButtonBuilder()
          .setCustomId('loop')
          .setEmoji(icons.loop)
          .setStyle(loopColor[this.player.loop])
          .setDisabled(overrides?.loop ?? disableAll),

        new ButtonBuilder()
          .setCustomId('save')
          .setEmoji(icons.save)
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

  constructor(player: ExtPlayer) {
    this.player = player
    this.messageManager = new MessageManager(player)
  }

  /**
   * Sets up a player timeout that destroys the player after some time
   */
  public async setupPlayerTimeout(timeoutOverride?: number) {
    const playerTimeout = timeoutOverride ?? Number(process.env.PLAYER_TIMEOUT) * 60 * 1000

    if (playerTimeout <= 0) return

    // Creates a timeout and binds it to the player.timeout property
    this.player.timeout = setTimeout(async () => {
      this.player.destroy()
    }, playerTimeout)
  }

  /**
   * Toggles the current player loop
   * @param override
   */
  public toggleLoop(override?: 'NONE' | 'QUEUE' | 'TRACK') {
    const currentLoop = this.player.loop

    if (override) {
      this.player.setLoop(override)
    } else {
      const loopOrder = ['NONE', 'QUEUE', 'TRACK']
      const currentIdx = loopOrder.indexOf(currentLoop)
      const nextIdx = (currentIdx + 1) % loopOrder.length
      const nextLoop = loopOrder[nextIdx]

      // biome-ignore lint/suspicious/noExplicitAny: Poru doesn't export the LoopType type for some reason
      this.player.setLoop(nextLoop as any)
    }
  }

  /**
   * Cancels a pending player timeout
   */
  public cancelPlayerTimeout(): void {
    if (!this.player.timeout) return

    clearTimeout(this.player.timeout)

    this.player.timeout = null
  }

  /**
   * Sends the currently playing track to user's dms
   */
  public async saveTrack(user: GuildMember, guild: Guild): Promise<SaveStatus> {
    if (!this.player.isPlaying) return SaveStatus.NotPlaying

    const info = this.player.currentTrack.info
    const dmChannel = await user.createDM()
      .catch(() => null)

    if (!dmChannel) return SaveStatus.DmChannelFailure

    const formatter = new TimeFormatter()

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
      : info.artworkUrl

    const trackInfo = new EmbedBuilder()
      .setAuthor({ name: `Originally requested by ${info.requester.username}`, iconURL: info.requester.avatar })
      .setDescription(`
* **[${info.title} - ${info.author}](${info.uri})**
* Source: **${info.sourceName.charAt(0).toUpperCase() + info.sourceName.slice(1)}** ${this.player.icons[info.sourceName] ?? ''}
* Length: **${formatter.duration(info.length / 1000)}**
* Saved at: **~${formatter.duration(this.player.position / 1000)}**`)
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
    const formatter = new TimeFormatter()

    const linkedTitleAndAuthor = `\`${iteration}\`: **[${info.title} - ${info.author}](${info.uri})**`

    return `${linkedTitleAndAuthor}\nAdded by <@${info.requester.id}> | Duration: \`${formatter.duration(info.length / 1000)}\`\n\n`
  }

  /**
   * Creates a embed with the current queue entries
   */
  public createQueueEmbed(): EmbedBuilder[] {
    const queue = this.player.queue

    const entryStrings: string[] = []
    const embeds: EmbedBuilder[] = []

    for (let i = 0; i < queue.length; i++) {
      const entry: Track = queue[i]
      entryStrings.push(this.formatQueueField(entry, i + 1))
    }

    // Split by 6 entries per page
    for (let i = 0; i < entryStrings.length; i += this.ENTRIES_PER_PAGE) {
      const slice = entryStrings.slice(i, i + this.ENTRIES_PER_PAGE)

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