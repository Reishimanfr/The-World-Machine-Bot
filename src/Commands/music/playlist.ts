import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import crypto from "node:crypto";
import { Track } from "poru";
import { setTimeout } from "timers/promises";
import { formatSeconds } from "../../Funcs/FormatSeconds";
import { ExtClient, ExtPlayer } from "../../Helpers/ExtendedClasses";
import { MessageManager } from "../../Helpers/MessageManager";
import { PlayerController } from "../../Helpers/PlayerController";
import { QueueManager } from "../../Helpers/QueueManager";
import { combineConfig } from "../../Helpers/config/playerSettings";
import { playlists } from "../../Models";
import Command from "../../types/Command";

const playlist: Command = {
  permissions: {
    user: ['Connect', 'Speak'],
    bot: ['Connect', 'Speak', 'SendMessages']
  },

  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Create, import, manage or load your playlists.')
    .addSubcommand(create => create
      .setName('create')
      .setDescription('Creates a new empty playlist.')
      .addStringOption(name => name
        .setName('name')
        .setDescription('Name for the playlist (can include emojis).')
        .setRequired(true)
      )
    )
    .addSubcommand(imprt => imprt
      .setName('import')
      .setDescription('Import a playlist from a URL. (This creates a new playlist)')
      .addStringOption(url => url
        .setName('url')
        .setDescription('URL to the playlist.')
        .setRequired(true)
      )
      .addStringOption(name => name
        .setName('name')
        .setDescription('Name for the playlist (can include emojis).')
        .setRequired(true)
      )
    )
    .addSubcommand(manage => manage
      .setName('manage')
      .setDescription('Manage existing playlists.')
      .addStringOption(playlist => playlist
        .setName('playlist')
        .setDescription('Playlist to manage.')
        .setRequired(true)
        .setAutocomplete(true)
      )
    )
    .addSubcommand(load => load
      .setName('load')
      .setDescription('Load one of your playlists.')
      .addStringOption(playlist => playlist
        .setName('playlist')
        .setDescription('Playlist to load.')
        .setRequired(true)
        .setAutocomplete(true)
      )
    )
    .addSubcommand(deleteP => deleteP
      .setName('delete')
      .setDescription('Deletes a playlist')
      .addStringOption(playlist => playlist
        .setName('playlist')
        .setDescription('Playlist to delete.')
        .setRequired(true)
        .setAutocomplete(true)
      )
    ),

  callback: async ({ interaction, client }) => {
    const subcommand = interaction.options.getSubcommand()
    const playlistName = interaction.options.getString('playlist')

    if (playlistName === '-') {
      // This fucking sucks
      return interaction.deferReply({ ephemeral: true })
        .then(_ => _.delete().catch(() => {}))
    }

    switch (subcommand) {
      case 'create': createPlaylist(interaction); break;
      case 'import': importSongs(interaction, client); break;
      case 'load': loadPlaylist(interaction, client); break;
      case 'manage': managePlaylist(interaction, client); break;
      case 'delete': deletePlaylist(interaction); break;
    }
  },

  autocomplete: async (interaction) => {
    const subcommand = interaction.options.getSubcommand()

    const record = await playlists.findAll({
      where: { userId: interaction.user.id }
    })

    const playlistData = record.map(r => r.dataValues)
    const currentPlaylists = record.map(r => r.getDataValue('name'))

    if (['manage', 'load', 'delete'].includes(subcommand)) {
      if (!currentPlaylists.length) {
        return interaction.respond([
          { name: '❌ You don\'t have any playlists saved.', value: '-' }
        ])
      }
      
      const mapNames = currentPlaylists.map(pl => {
        const songs = playlistData.find(p => p.name === pl).tracks.length

        return {
          name: `${pl} -> 🎶 ${songs === 0 ? "Empty playlist" : `${songs} songs`}`,
          value: pl
        }
      })

      return interaction.respond(mapNames)
    }
  }
}

export default playlist

interface PlaylistRecord {
  userId: string
  name: string
  tracks: Array<string>
}

const URL_REGEX = /^https:\/\/[^\s/$.?#].[^\s]*$/
const MAX_PLAYLIST_SONGS = 500
const MAX_PLAYLISTS = 25 // Exactly the same as autocomplete response limit

async function formatPlaylistEntires(client: ExtClient, tracks: Array<string>, interaction: ChatInputCommandInteraction): Promise<EmbedBuilder[]> {
  const resolvedTracks = await client.poru.decodeTracks(tracks, await client.poru.getNode()[0]) as Array<Track>
  const playlistName = interaction.options.getString('playlist', true)

  if (!resolvedTracks.length) {
    return [
      new EmbedBuilder()
        .setAuthor({
          name: `Playlist management -> ${playlistName}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setDescription(`❌ **-> Playlist is empty!**`
        + `\n\n:information_source: Your changes will be **automatically saved** after **4 minutes of inactivity**.`
          + `\n:information_source: Only you can edit this.`)
    ]
  }

  const tracksData = resolvedTracks.map(r => r.info)
  const embeds: Array<EmbedBuilder> = []

  const tracksDataStrings: Array<string> = []

  for (let i = 0; i < tracksData.length; i++) {
    const info = tracksData[i]

    tracksDataStrings.push(`\`#${i + 1}:\` **[${info.title === '' ? ":warning: No title!" : info.title}](${info.uri})**\n* By: **${info.author}** (${formatSeconds(info.length / 1000)})`)
  }

  const splitter = 7
  let playlistLength = 0

  for (const track of resolvedTracks) {
    playlistLength += track.info.length
  }

  for (let i = 0; i < tracksDataStrings.length; i += splitter) {
    const slice = tracksDataStrings.slice(i, i + splitter)
    embeds.push(
      new EmbedBuilder()
        .setAuthor({
          name: `Playlist management -> ${playlistName}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setDescription(slice.join('\n')
          + `\n\n:information_source: Your changes will be **automatically saved** after **4 minutes of inactivity**.`
          + `\n:information_source: Only you can edit this.`)
        .setFooter({ text: `Playlist length: ${formatSeconds(playlistLength / 1000)} (${resolvedTracks.length} songs)` })   
    )
  }

  return embeds
}

async function createPlaylist(interaction: ChatInputCommandInteraction) {
  const playlistName = interaction.options.getString('name', true)

  // This is used for autocomplete interactions when the user selects the "No playlists"
  // response as input
  if (playlistName === '-') {
    return interaction.reply({
      content: 'This name isn\'t allowed.',
      ephemeral: true
    })
  }

  const record = await playlists.findAll({
    where: { userId: interaction.user.id },
  })

  const currentPlaylists: Array<PlaylistRecord> = record.map(rc => rc.dataValues)

  if (currentPlaylists.length >= MAX_PLAYLISTS) {
    return interaction.reply({
      content: `You can't have more than **${MAX_PLAYLISTS}** playlists saved.`,
      ephemeral: true
    })
  }

  if (currentPlaylists.find(p => p.name === playlistName)) {
    return interaction.reply({
      content: `A playlist with this name, **(${playlistName})** already exists! Please choose a different name.`,
      ephemeral: true
    })
  }

  await playlists.create({
    userId: interaction.user.id,
    name: playlistName,
    tracks: []
  })

  interaction.reply({
    content: `Playlist **${playlistName}** created! To add something to the playlist use the \`/playlist import\` or \`/playlist manage\` commands!`,
    ephemeral: true
  })
}

async function importSongs(interaction: ChatInputCommandInteraction, client: ExtClient) {
  const playlistUrl = interaction.options.getString('url', true)
  const playlistName = interaction.options.getString('name', true)

  const record = await playlists.findAll({
    where: { userId: interaction.user.id },
  })

  const currentPlaylists: Array<PlaylistRecord> = record.map(rc => rc.dataValues)

  if (currentPlaylists.length >= MAX_PLAYLISTS) {
    return interaction.reply({
      content: `You can't have more than **${MAX_PLAYLISTS}** playlists saved.`,
      ephemeral: true
    })
  }

  if (currentPlaylists.find(p => p.name === playlistName)) {
    return interaction.reply({
      content: `A playlist with this name, **(${playlistName})** already exists! Please choose a different name.`,
      ephemeral: true
    })
  }

  await interaction.deferReply({ ephemeral: true })

  if (!URL_REGEX.test(playlistUrl)) {
    return interaction.editReply({
      content: 'This doesn\'t seem to be a valid URL!'
    })
  }

  const results = await client.poru.resolve({ query: playlistUrl })
  let tracks = results.tracks

  if (tracks.length > MAX_PLAYLIST_SONGS) {
    const tooManySongsButtons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('trim')
          .setLabel(`Trim to ${MAX_PLAYLIST_SONGS} songs`)
          .setEmoji('✂')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('discard')
          .setLabel('Discard')
          .setEmoji('❌')
          .setStyle(ButtonStyle.Secondary)
      )

    const response = await interaction.followUp({
      content: `The maximum amount of tracks in one playlist is **${MAX_PLAYLIST_SONGS}**. Do you want to trim the playlist?`,
      components: [tooManySongsButtons],
      ephemeral: true
    })

    const button = await response.awaitMessageComponent({ componentType: ComponentType.Button })
    await button.deferUpdate()

    if (button.customId === 'trim') {
      tracks = tracks.slice(0, MAX_PLAYLIST_SONGS)

      response.edit({
        content: `Playlist trimmed to **${MAX_PLAYLIST_SONGS} songs**!`,
        components: []
      })
    } else {
      return response.edit({
        content: 'Playlist discarded!',
        components: []
      })
    }
  }

  let playlistDuration = 0

  for (const track of tracks) {
    playlistDuration += track.info.length
  }

  const confirmationEmbed = new EmbedBuilder()
    .setAuthor({
      name: `Confirm data?`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setDescription(
      `Playlist name -> **${playlistName}**\n`
      + `Songs -> **${tracks.length}**\n`
      + `Duration -> **${formatSeconds(playlistDuration / 1000)}**\n`
      + `Origin -> <[**[Link]**](${playlistUrl})> - **${results.tracks[0].info.sourceName}**`)
    .setColor('#2b2d31')

  const confirmationButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('discard')
        .setLabel('Discard')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Secondary)
    )

  const confirmationResponse = await interaction.editReply({
    content: '',
    embeds: [confirmationEmbed],
    components: [confirmationButtons]
  })

  const confirmButton = await confirmationResponse.awaitMessageComponent({ componentType: ComponentType.Button })
  await confirmButton.deferUpdate()

  if (confirmButton.customId === 'confirm') {
    interaction.editReply({
      content: `Playlist **${playlistName}** (**${tracks.length}** songs) imported!`,
      components: [],
      embeds: []
    })

    await playlists.create({
      userId: interaction.user.id,
      name: playlistName,
      tracks: tracks.map(track => track.track)
    })
  } else {
    interaction.editReply({
      content: `Playlist discarded.`,
      components: [],
      embeds: []
    })
  }
}

async function loadPlaylist(interaction: ChatInputCommandInteraction, client: ExtClient) {
  const playlistName = interaction.options.getString('playlist', true)
  const member = await interaction.guild!.members.fetch(interaction.user.id)

  const record = await playlists.findOne({
    where: {
      userId: interaction.user.id,
      name: playlistName
    }
  })

  if (!record) {
    return interaction.reply({
      content: `No playlist with name **${playlistName}** found. Create one using the \`/playlist create\` or \`/playlist import\` commands!`,
      ephemeral: true
    })
  }

  if (!member.voice.channel) {
    return interaction.reply({
      content: 'You must be in a voice channel to use this command.',
      ephemeral: true
    })
  }

  let player = client.poru.players.get(interaction.guildId!) as ExtPlayer | undefined

  if (!player) {
    player = client.poru.createConnection({
      voiceChannel: member.voice.channel!.id,
      textChannel: interaction.channel!.id,
      guildId: interaction.guild!.id,
      deaf: true,
      mute: false
    }) as ExtPlayer
  }

  player.controller ||= new PlayerController(player)
  player.messageManger ||= new MessageManager(player)
  player.queueManager ||= new QueueManager(player)

  // Why the fuck is this Promise<unknown> if it returns a fucking array of tracks??????
  // Fuck this shit
  const tracks = await player.poru.decodeTracks(record.getDataValue('tracks'), player.node) as Array<Track>

  // Add all tracks to the queue
  tracks.forEach(t => {
    const track = new Track(t)

    track.info.requester = {
      username: interaction.user.username,
      avatar: interaction.user.displayAvatarURL(),
      id: interaction.user.id
    }

    player.queue.add(track)
  })

  if (!player.isPlaying) player.play()

  player.guildId ||= interaction.guild!.id
  player.sessionId ||= crypto.randomBytes(6).toString('hex')
  player.settings ||= await combineConfig(interaction.guild!.id)

  interaction.reply({
    content: `Playlist **${playlistName}** loaded!`,
    ephemeral: true
  })
}

async function deletePlaylist(interaction: ChatInputCommandInteraction) {
  const playlistName = interaction.options.getString('playlist', true)

  const record = await playlists.findOne({
    where: {
      userId: interaction.user.id,
      name: playlistName
    }
  })

  if (!record) {
    return interaction.reply({
      content: `No playlist with name **${playlistName}** found.`,
      ephemeral: true
    })
  }

  await record.destroy()

  interaction.reply({
    content: `Playlist **${playlistName}** deleted!`,
    ephemeral: true
  })
}

async function managePlaylist(interaction: ChatInputCommandInteraction, client: ExtClient) {
  const managementButtons = [
    new ButtonBuilder()
      .setCustomId('add')
      .setLabel('Add')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('remove')
      .setLabel('Remove')
      .setEmoji('✖')
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId('replace')
      .setLabel('Replace')
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('move')
      .setLabel('Move')
      .setEmoji('📑')
      .setStyle(ButtonStyle.Secondary)
  ]

  const otherButtons = [
    new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('-Page')
      .setEmoji('◀')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('save')
      .setLabel('Save')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('discard')
      .setLabel('Discard')
      .setEmoji('⛔')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('+Page')
      .setEmoji('▶')
      .setStyle(ButtonStyle.Secondary)
  ]

  const managementRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(managementButtons)

  const otherRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(otherButtons)

  const record = await playlists.findOne({
    where: {
      userId: interaction.user.id,
      name: interaction.options.getString('playlist', true)
    }
  })

  let tracks: Array<string> = record?.getDataValue('tracks')
  let embeds = await formatPlaylistEntires(client, tracks, interaction)
  let page = 0

  const response = await interaction.reply({
    embeds: [embeds[page]],
    components: [managementRow, otherRow]
  })

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 240000,
    filter: (btn) => btn.user.id === interaction.user.id
  })

  const toggleButtons = (disabled: boolean) => {
    return [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(managementButtons.map(btn => btn.setDisabled(disabled))),

      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(otherButtons.map(btn => {
          if (btn.data.label === '+Page' || btn.data.label === '-Page') {
            return btn.setDisabled(false)
          } else if (btn.data.label === 'Move') {
            return btn.setDisabled(true)
          } else {
            return btn.setDisabled(disabled)
          }
        }))
    ]
  }

  collector.on('collect', async (btn) => {
    collector.resetTimer()
    await btn.deferUpdate()
    let toDelete: Array<string> = []

    // Dont disable buttons for navigation bar
    if (!['previous', 'next'].includes(btn.customId)) {
      await response.edit({
        components: toggleButtons(true)
      })
    }

    if (btn.customId === 'previous') {
      page = page > 0 ? --page : embeds.length - 1;
    } else if (btn.customId === 'next') {
      page = page + 1 < embeds.length ? ++page : 0;
    }

    switch (btn.customId) {
      case 'add': {
        const res = await btn.followUp({
          content: 'Please send the URL of the song you\'d like to add followed by the position at which the song should be placed.'
            + '\nExample: `[url], 5` -> Adds song by url at position 5'
        })

        toDelete.push(res.id)

        const message = await btn.channel?.awaitMessages({
          max: 1,
          filter: (msg) => msg.author.id === interaction.user.id,
          time: 60000
        })

        const collectedMessage = message?.at(0)

        if (!collectedMessage) {
          res.edit({
            content: 'You haven\'t provided a song to add in time.'
          })
          break
        }

        toDelete.push(collectedMessage.id)

        const parts = collectedMessage.content.split(', ')

        if (parts.length !== 2) {
          res.edit({
            content: 'This doesn\'t look right. Did you follow the schema? (`[url], position`)'
          })
          break
        }

        const url = parts[0]?.trim()
        const position = parseInt(parts[1]?.trim() ?? tracks.length + 1)

        if (!URL_REGEX.test(url)) {
          res.edit({
            content: 'This doesn\'t seem to be a correct url.'
          })
          break
        }

        if (isNaN(position)) {
          res.edit({
            content: 'Position doesn\'t seem to be a valid number.'
          })
          break
        }

        if (position <= 0) {
          res.edit({
            content: 'The position can\'t be smaller than **1**!'
          })
          break
        }

        const resolvedUrl = await client.poru.resolve({ query: url })
        const trackInfo = resolvedUrl.tracks[0]

        tracks.splice(position - 1, 0, trackInfo.track)

        res.edit({
          content: `Track **${trackInfo.info.title}** added at position **#${position}**!`
        })
        break
      }

      case 'remove': {
        const res = await btn.followUp({
          content: 'Please send the position of the song you\'d like to remove from the playlist.'
            + '\nExample: `1` -> This would remove song #1 from the playlist'
        })

        toDelete.push(res.id)

        const message = await btn.channel?.awaitMessages({
          max: 1,
          filter: (msg) => msg.author.id === interaction.user.id,
          time: 60000
        })

        const collectedMessage = message?.at(0)

        if (!collectedMessage) {
          res.edit({
            content: 'You haven\'t provided a song to remove in time.'
          })
          break
        }

        // Add the user message to delete list
        toDelete.push(collectedMessage.id)

        let position = parseInt(collectedMessage.content)

        // Sanitize position
        if (isNaN(position)) {
          res.edit({
            content: 'Position doesn\'t seem to be a valid number.'
          })
          break
        }

        if (position <= 0) {
          res.edit({
            content: 'The position can\'t be smaller than **1**!'
          })
          break
        }

        if (position > tracks.length) position = tracks.length + 1
        
        const removedTrack = tracks.splice(position - 1, 1)[0]

        const trackNameRequest = await client.poru.decodeTrack(removedTrack, client.poru.getNode()[0]) as Track
        const trackInfo = trackNameRequest.info

        res.edit({
          content: `Song **${trackInfo.title}** (at position **#${position}**) removed!`
        })
        break
      }

      case 'replace': {
        const res = await btn.followUp({
          content: 'Please send the URL of the song you\'d like to replace with followed by the position at which the song should be placed.'
            + '\nExample: `[url], 5` -> Replaces song at position 5 with song by url'
        })

        toDelete.push(res.id)

        const message = await btn.channel?.awaitMessages({
          max: 1,
          filter: (msg) => msg.author.id === interaction.user.id,
          time: 60000
        })

        const collectedMessage = message?.at(0)

        if (!collectedMessage) {
          res.edit({
            content: 'You haven\'t provided a track to replace with in time.'
          })
          break
        }

        toDelete.push(collectedMessage.id)

        const parts = collectedMessage.content.split(', ')

        if (parts.length !== 2) {
          res.edit({
            content: 'This doesn\'t look right. Did you follow the schema? (`[url], position`)'
          })
          break
        }

        const url = parts[0].trim()
        const position = parseInt(parts[1].trim())

        if (!URL_REGEX.test(url)) {
          res.edit({
            content: 'This doesn\'t seem to be a correct url.'
          })
          break
        }

        if (isNaN(position)) {
          res.edit({
            content: 'Position doesn\'t seem to be a valid number.'
          })
          break
        }

        if (position <= 0) {
          res.edit({
            content: 'The position can\'t be smaller than **1**!'
          })
          break
        }

        const resolveUrlResponse = await client.poru.resolve({ query: url })
        const resolvedTrack = resolveUrlResponse.tracks[0]

        const replacedSong = tracks[position - 1]
        const replacedTrackResponse = await client.poru.decodeTrack(replacedSong, client.poru.getNode()[0]) as Track
        const replacedTrackInfo = replacedTrackResponse.info 

        tracks[position - 1] = resolveUrlResponse.tracks[0].track

        res.edit({
          content: `Track **${replacedTrackInfo.title}** (at position **#${position}**) replaced with track **${resolvedTrack.info.title}**!`
        })
        break
      }

      case 'move': {
        const res = await btn.followUp({
          content: 'Please send the positions of the songs to move and where to move it.'
          + '\nExample: `1, 3` -> This would move the 1st song into the 3rd position.'
        })

        toDelete.push(res.id)

        const message = await btn.channel?.awaitMessages({
          max: 1,
          filter: (msg) => msg.author.id === interaction.user.id,
          time: 60000
        })

        const collectedMessage = message?.at(0)

        if (!collectedMessage) {
          res.edit({
            content: 'You haven\'t provided a track to replace with in time.'
          })
          break
        }

        toDelete.push(collectedMessage.id)

        const parts = collectedMessage.content.split(', ')

        if (parts.length !== 2) {
          res.edit({
            content: 'This doesn\'t look right. Did you follow the schema? (`song, position`)'
          })
          break
        }

        const toMove = parseInt(parts[0].trim())
        const movePosition = parseInt(parts[1].trim())

        if (isNaN(toMove) || isNaN(movePosition)) {
          res.edit({
            content: 'One of the values is not a correct number!'
          })
          break
        }

        if (toMove <= 0) {
          res.edit({
            content: 'The song to move position can\'t be smaller than **1**!'
          })
          break
        }

        // fuck variable naming
        const temp = tracks.at(toMove)

        if (!temp) {
          res.edit({
            content: `No song found at this position (#${toMove})!`
          })
          break
        }

        tracks.splice(movePosition - 1, 0, temp)

        const resolveTrack = await client.poru.decodeTrack(temp, client.poru.getNode()[0]) as Track
        const trackInfo = resolveTrack.info

        res.edit({
          content: `Track **${trackInfo.title}** moved to position **#${movePosition}**!`
        })
        break
      }

      case 'save': collector.stop('saved-by-user'); return;
      case 'discard': collector.stop('discarded-by-user'); return
    }

    embeds = await formatPlaylistEntires(client, tracks, interaction)

    if (!['previous', 'next'].includes(btn.customId)) {
      await response.edit({
        embeds: [embeds[page]],
        components: toggleButtons(false)
      })
    } else {
      await response.edit({
        embeds: [embeds[page]],
      })
    }

    if (toDelete.length) {
      await setTimeout(10000)

      Promise.all(toDelete.map(async id => {
        const message = await interaction.channel?.messages.fetch(id)
          .catch(() => {})

        message?.delete()
          .catch(() => { })
      }))
    }
  })

  collector.on('end', async () => {
    const reason = collector.endReason

    if (reason === 'time' || reason === 'saved-by-user') {
      const [record] = await playlists.findOrCreate({
        where: {
          userId: interaction.user.id,
          name: interaction.options.getString('playlist', true),
        },
        defaults: {
          userId: interaction.user.id,
          name: interaction.options.getString('playlist', true),
          tracks: []
        }
      })

      await record.update({
        tracks: tracks
      })

      response.edit({
        content: `Playlist **${interaction.options.getString('playlist', true)}** has been saved!`,
        components: [],
        embeds: []
      })
    } else if (reason === 'discarded-by-user') {
      response.edit({
        content: `Playlist changes have been discarded.`,
        components: [],
        embeds: []
      })
    }
  })
}