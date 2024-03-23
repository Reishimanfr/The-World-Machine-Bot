import { ActionRowBuilder, Attachment, AttachmentBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User } from 'discord.js'
import { client } from '..'
import { playlists } from '../Models'
import { Track } from 'poru'
import { formatSeconds } from '../Funcs/FormatSeconds'
import axios from 'axios'
import { ExtPlayer } from '../Helpers/ExtendedPlayer'

export interface Playlist {
  name: string
  tracks: string | null
  userId: string
  createdAt: Date
  lastUpdatedAt: Date
  length: number
}

export enum PlaylistResponse {
  SUCCESS,
  ALREADY_EXISTS,
  NOT_FOUND,
  ERROR,
  NO_TRACKS,
  NO_PLAYLISTS,
  TOO_MANY_TRACKS,
  TOO_MANY_PLAYLISTS,
  INVALID_PLAYLIST_URL,
  EMPTY_PLAYLIST,
  INVALID_DATA,
  NOTHING_TO_DO
}

class PlaylistManager {
  private readonly playlistLimit = 25
  private readonly trackLimit = 2500

  /**
   * Returns all playlists for a user by their user ID
   */
  public async getAllPlaylists(userId: string): Promise<[Array<Playlist>?, Error?]> {
    try {
      const allPlaylists = await playlists.findAll({
        where: {
          userId: userId
        }
      })

      const playlistsArray: Array<Playlist> = allPlaylists.map(playlist => {
        return {
          name: playlist.dataValues.name,
          tracks: playlist.dataValues.tracks?.split(' ') ?? null,
          length: playlist.dataValues.tracks?.split(' ')?.length ?? 0,
          createdAt: playlist.dataValues.createdAt,
          lastUpdatedAt: playlist.dataValues.lastUpdatedAt,
          userId: playlist.dataValues.userId
        }
      })

      return [playlistsArray]
    } catch (error) {
      return [undefined, error]
    }
  }

  /**
   * Checks if a string is valid json
   */
  private validateJSON(data: string): boolean {
    try {
      JSON.parse(data)
    } catch (error) {
      return false
    }

    return true
  }

  /**
   * Returns a user playlist by name 
   */
  public async getPlaylistFromName(name: string, userId: string): Promise<[PlaylistResponse, Playlist?, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)
    const playlist = allPlaylists?.find(playlist => playlist.name === name) as any

    if (!allPlaylists || !playlist) return [PlaylistResponse.ERROR, undefined, error]

    // LMAO this is some hacky shit on god
    // I'm a programming god and I know what I'm doing (not 
    if (playlist.tracks !== null && playlist.tracks instanceof Array) {
      playlist.tracks = playlist.tracks.join(' ')
    }

    return [PlaylistResponse.SUCCESS, playlist]
  }

  /**
   * Creates a menu of all playlists
   */
  public async generateMenu(userId: string): Promise<[ActionRowBuilder<StringSelectMenuBuilder>?, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [undefined, error]
    if (!allPlaylists.length) return [undefined, new Error('No playlists found')]

    const menuEntries: Array<StringSelectMenuOptionBuilder> = []

    for (const playlist of allPlaylists) {
      menuEntries.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(playlist.name)
          .setValue(playlist.name)
          .setEmoji('🎵')
          .setDescription(`Tracks: ${playlist.tracks?.length ?? 0}`)
      )
    }

    return [new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('playlistSelect')
          .setPlaceholder('Select a playlist')
          .addOptions(...menuEntries)
      )]
  }

  /**
   * Generates a embed of all tracks in a playlist
   */
  public async generatePlaylistEmbed(playlist: Playlist, iconUrl?: string): Promise<[PlaylistResponse, Array<EmbedBuilder>?, Error?]> {
    try {
      if (playlist.tracks === null) {
        return [
          PlaylistResponse.SUCCESS,
          [
            new EmbedBuilder()
              .setAuthor({ name: `Playlist • ${playlist.name}`, iconURL: iconUrl })
              .setDescription(':x: Empty playlist!')
              .setFooter({ text: 'Page 1 of 1' })
          ]
        ]
      } else {
        const tracks: Array<Track> = (playlist.tracks !== null) ? await client.poru.decodeTracks(playlist.tracks.split(' '), client.poru.leastUsedNodes[0]) as any : []
        const tracksStrings: Array<string> = []

        if (tracks.length === 0) {
          return [
            PlaylistResponse.SUCCESS, [
              new EmbedBuilder()
                .setAuthor({ name: `Playlist • ${playlist.name}`, iconURL: iconUrl })
                .setDescription(':x: Empty playlist!')
                .setFooter({ text: 'Page 1 of 1' })
            ]]
        } else {
          for (let i = 0; i < tracks.length; i++) {
            tracksStrings.push(`\`#${i + 1}\`: **[${tracks[i].info.title} - ${tracks[i].info.author}](${tracks[i].info.uri})** - ${formatSeconds(tracks[i].info.length / 1000)}`)
          }

          const embeds: Array<EmbedBuilder> = []

          for (let i = 0; i < tracksStrings.length; i += 10) {
            embeds.push(
              new EmbedBuilder()
                .setAuthor({ name: `Playlist • ${playlist.name}` })
                .setDescription(tracksStrings.slice(i, i + 10).join('\n'))
                .setFooter({ text: `Page ${i / 10 + 1} of ${Math.ceil(tracksStrings.length / 10)}` })
            )
          }

          return [PlaylistResponse.SUCCESS, embeds]
        }
      }
    } catch (error) {
      return [PlaylistResponse.ERROR, undefined, error]
    }
  }

  /**
   * Creates a empty playlist
   */
  public async create(name: string, userId: string): Promise<[PlaylistResponse, Playlist?, Error?]> {
    const [allPlaylists] = await this.getAllPlaylists(userId)

    if (allPlaylists?.find(playlist => playlist.name === name)) {
      return [PlaylistResponse.ALREADY_EXISTS]
    }

    if (allPlaylists && allPlaylists.length >= this.playlistLimit) {
      return [PlaylistResponse.TOO_MANY_PLAYLISTS]
    }

    const newPlaylist: Playlist = {
      name: name,
      userId: userId,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      length: 0,
      tracks: null,
    }

    try {
      await playlists.create({ ...newPlaylist })
    } catch (error) {
      return [PlaylistResponse.ERROR, undefined, error]
    }

    return [PlaylistResponse.SUCCESS, newPlaylist]
  }

  /**
   * Imports a playlist from a URL
   */
  public async importFromUrl(name: string, userId: string, playlistUrl: string): Promise<[PlaylistResponse, Playlist?, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(name)

    if (!allPlaylists) return [PlaylistResponse.ERROR, undefined, error]
    if (allPlaylists.find(playlist => playlist.name === name)) return [PlaylistResponse.ALREADY_EXISTS]

    const resolveUrl = await client.poru.resolve({ query: playlistUrl })

    if (resolveUrl.loadType !== 'playlist') return [PlaylistResponse.INVALID_PLAYLIST_URL]
    if (resolveUrl.tracks.length > this.trackLimit) return [PlaylistResponse.TOO_MANY_TRACKS]

    let playlistLength = 0

    for (const track of resolveUrl.tracks) {
      playlistLength += Math.trunc(track.info.length / 1000)
    }

    const newPlaylist: Playlist = {
      name: name,
      userId: userId,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      length: playlistLength,
      tracks: resolveUrl.tracks.map(track => track.track).join(' ')
    }

    await playlists.create({ ...newPlaylist })

    return [PlaylistResponse.SUCCESS, newPlaylist]
  }

  /**
   * Deletes a existing playlist
   */
  public async delete(name: string, userId: string): Promise<[PlaylistResponse, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [PlaylistResponse.ERROR, error]

    const playlist = allPlaylists.find(playlist => playlist.name === name)

    if (!playlist) return [PlaylistResponse.NOT_FOUND]

    try {
      await playlists.destroy({
        where: {
          name: name,
          userId: userId
        }
      })
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS]
  }

  /**
   * Updates a playlist name
   */
  public async update(name: string, newName: string, userId: string): Promise<[PlaylistResponse, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [PlaylistResponse.ERROR, error]

    try {
      await playlists.update({
        name: newName,
        lastUpdatedAt: new Date(),
      }, {
        where: {
          name: name,
          userId: userId
        }
      })
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS]
  }

  /**
   * Duplicates a existing playlist 
   */
  public async duplicate(name: string, newName: string, userId: string): Promise<[PlaylistResponse, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [PlaylistResponse.ERROR, error]
    if (allPlaylists.find(playlist => playlist.name === newName)) return [PlaylistResponse.ALREADY_EXISTS]

    const playlist = allPlaylists.find(playlist => playlist.name === name)

    if (!playlist) return [PlaylistResponse.NOT_FOUND]

    const newPlaylist: Playlist = {
      name: newName,
      userId: userId,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      length: playlist.length,
      tracks: playlist.tracks
    }

    try {
      await playlists.create({ ...newPlaylist })
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS]
  }

  /**
   * Clears a playlist
   */
  public async clear(name: string, userId: string): Promise<[PlaylistResponse, Playlist?, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [PlaylistResponse.ERROR, undefined, error]

    const playlist = allPlaylists.find(playlist => playlist.name === name)

    if (!playlist) return [PlaylistResponse.NOT_FOUND]

    playlist.tracks = null

    try {
      await playlists.update({ ...playlist }, {
        where: {
          name: name,
          userId: userId
        }
      })
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS, playlist]
  }

  /**
   * Generates embeds for all playlists
   */
  public async list(userId: string): Promise<[Array<EmbedBuilder>?, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [undefined, error]
    if (allPlaylists.length === 0) return [[]]

    const embeds: Array<EmbedBuilder> = []
    let idx = 1

    for (const playlist of allPlaylists) {
      try {
        const tracksStrings: Array<string> = []

        if (playlist.tracks === null || playlist.tracks) {
          tracksStrings.push(':x: Empty playlist!')
        } else {
          const tracks = await client.poru.decodeTracks(playlist.tracks.split(' '), client.poru.leastUsedNodes[0]) as Array<Track>

          for (const track of tracks) {
            tracksStrings.push(`[${track.info.title} - ${track.info.author}](${track.info.uri}) - (${formatSeconds(track.info.length / 1000)})`)
          }
        }

        embeds.push(
          new EmbedBuilder()
            .setAuthor({ name: `Playlist • ${playlist.name}` })
            .setDescription(tracksStrings.join('\n'))
            .setFooter({ text: `Length: ${formatSeconds(playlist.length)} • Page ${idx}/${allPlaylists.length}` })
        )

        idx++
      } catch (error) {
        return [undefined, error]
      }
    }

    return [embeds]
  }

  /**
   * Exports a playlist as a JSON file 
   */
  public async exportPlaylist(name: string, userId: string): Promise<[PlaylistResponse, AttachmentBuilder?, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [PlaylistResponse.ERROR, undefined, error]

    const playlist = allPlaylists.find(playlist => playlist.name === name)

    if (!playlist) return [PlaylistResponse.NOT_FOUND]

    const dataToExport = {
      tracks: playlist.tracks
    }

    const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(dataToExport)), {
      name: `playlist_${name}-${userId}.json`,
      description: 'Exported playlist'
    })

    return [PlaylistResponse.SUCCESS, attachment]
  }

  /**
   * Imports a playlist from a JSON file
   */
  public async importPlaylist(name: string, userId: string, file: Attachment): Promise<[PlaylistResponse, Error?]> {
    const [allPlaylists, error] = await this.getAllPlaylists(userId)

    if (!allPlaylists) return [PlaylistResponse.ERROR, error]
    if (allPlaylists.find(playlist => playlist.name === name)) return [PlaylistResponse.ALREADY_EXISTS]

    try {
      const request = await axios.get(file.url)

      const data = request.data

      // Validate json data
      if (!data.tracks || !this.validateJSON) return [PlaylistResponse.INVALID_DATA]

      const newPlaylist: Playlist = {
        name: name,
        userId: userId,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        length: data.tracks.length,
        tracks: data.tracks.join(' ')
      }

      await playlists.create({ ...newPlaylist })
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS]
  }

  /**
   * Part of #manage -> Adds a song to a playlist at a specified index
   */
  public async addSong(playlist: Playlist, song: string, index?: number): Promise<[PlaylistResponse, Playlist?, Error?]> {
    try {
      const resolveUrl = await client.poru.resolve({ query: song })

      switch (resolveUrl.loadType) {
        case 'error': return [PlaylistResponse.ERROR, undefined, new Error(`Failed to resolve: ${song}`)]
        case 'empty': return [PlaylistResponse.ERROR, undefined, new Error(`No matches found for: ${song}`)]

        case 'search':
        case 'playlist':
        case 'track': {
          const track = resolveUrl.tracks[0]
          const splitTracks = playlist.tracks?.split(' ') ?? []

          let idx = index ?? splitTracks.length + 1 // The end user will probably start from 1 not 0

          // Sanitize index
          if (idx <= 0) {
            // Make sure we don't go below 0 
            idx = 1
          } else if (idx > splitTracks.length) {
            idx = splitTracks.length + 1
          }

          splitTracks.splice(idx - 1, 0, track.track)

          playlist.tracks = splitTracks.join(' ')
          break
        }

        default: {
          return [PlaylistResponse.ERROR, undefined, new Error('Unknown error occurred')]
        }
      }
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS, playlist]
  }

  /**
   * Part of #manage -> Removes a song from a playlist
   */
  public async removeSong(playlist: Playlist, index: number): Promise<[PlaylistResponse, Playlist?, Error?]> {
    try {
      const splitTracks = playlist.tracks?.split(' ') ?? []

      if (splitTracks.length === 0) return [PlaylistResponse.NOTHING_TO_DO]

      // Sanitize index
      let indexSanitized = index <= 0 ? 1 : index

      if (indexSanitized > splitTracks.length) {
        indexSanitized = splitTracks.length + 1 // The end user will probably start from 1 not 0
      }

      splitTracks.splice(indexSanitized - 1, 1)

      playlist.tracks = splitTracks.length > 0 ? splitTracks.join(' ') : null
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS, playlist]
  }

  public async replaceTrack(playlist: Playlist, song: string, index: number): Promise<[PlaylistResponse, Playlist?, Error?]> {
    try {
      const resolveUrl = await client.poru.resolve({ query: song })

      switch (resolveUrl.loadType) {
        case 'error': return [PlaylistResponse.ERROR, undefined, new Error(`Failed to resolve: ${song}`)]
        case 'empty': return [PlaylistResponse.ERROR, undefined, new Error(`No matches found for: ${song}`)]

        case 'search':
        case 'playlist':
        case 'track': {
          const track = resolveUrl.tracks[0]
          const splitTracks = playlist.tracks?.split(' ') ?? []


          splitTracks.splice(index - 1, 1, track.track)

          playlist.tracks = splitTracks.join(' ')
          break
        }
      }
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS, playlist]
  }

  /**
   * Shuffles a playlist 
   */
  public async shuffle(playlist: Playlist): Promise<[PlaylistResponse, Playlist?, Error?]> {
    if (!playlist.tracks) return [PlaylistResponse.NOTHING_TO_DO]

    const splitTracks = playlist.tracks.split(' ')

    for (let i = splitTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[splitTracks[i], splitTracks[j]] = [splitTracks[j], splitTracks[i]]
    }

    playlist.tracks = splitTracks.join(' ')

    return [PlaylistResponse.SUCCESS, playlist]
  }

  public async load(playlist: Playlist, player: ExtPlayer, requester: User): Promise<[PlaylistResponse, Error?]> {
    if (!playlist.tracks) return [PlaylistResponse.EMPTY_PLAYLIST]

    try {
      const tracks = await client.poru.decodeTracks(playlist.tracks.split(' '), client.poru.leastUsedNodes[0]) as Array<Track>

      if (!tracks) return [PlaylistResponse.ERROR, new Error('Failed to load playlist')]

      for (const track of tracks) {
        track.info.requester = {
          username: requester.displayName,
          id: requester.id,
          avatar: requester.displayAvatarURL()
        }
        player.queue.add(track)
      }
    } catch (error) {
      return [PlaylistResponse.ERROR, error]
    }

    return [PlaylistResponse.SUCCESS]
  }
}

export { PlaylistManager }