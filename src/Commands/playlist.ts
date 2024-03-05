import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, StringSelectMenuOptionBuilder, Message } from 'discord.js'
import { Command } from '../Types/Command'
import { PlaylistManager, PlaylistResponse } from '../Helpers/PlaylistManager'
import { playlists } from '../Models'

const buttons = [
  new ButtonBuilder()
    .setCustomId('previous')
    .setLabel('Previous')
    .setStyle(ButtonStyle.Secondary),

  new ButtonBuilder()
    .setCustomId('next')
    .setLabel('Next')
    .setStyle(ButtonStyle.Secondary)
] as const

const managementMenuOptions = [
  new StringSelectMenuOptionBuilder()
    .setLabel('Add a song')
    .setValue('add')
    .setEmoji('➕'),

  new StringSelectMenuOptionBuilder()
    .setLabel('Remove a song')
    .setValue('remove')
    .setEmoji('➖'),

  new StringSelectMenuOptionBuilder()
    .setLabel('Replace a song')
    .setValue('replace')
    .setEmoji('✏️'),

  new StringSelectMenuOptionBuilder()
    .setLabel('Save changes')
    .setValue('save')
    .setEmoji('💾'),

  new StringSelectMenuOptionBuilder()
    .setLabel('Clear playlist')
    .setValue('clear')
    .setEmoji('🗑️'),

  new StringSelectMenuOptionBuilder()
    .setLabel('Shuffle playlist')
    .setValue('shuffle')
    .setEmoji('🔀'),

  new StringSelectMenuOptionBuilder()
    .setLabel('Export playlist')
    .setValue('export')
    .setEmoji('📤'),
] as const

const optionsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
  .addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('playlist')
      .setPlaceholder('Select an option')
      .setOptions([
        { label: 'Create', value: 'create', description: 'Create a new empty playlist', emoji: '🆕' },
        { label: 'Import from URL', value: 'import_url', description: 'Import a playlist from a URL', emoji: '🔗' },
        { label: 'Manage', value: 'manage', description: 'Manage existing playlists', emoji: '🎧' },
        { label: 'Delete', value: 'delete', description: 'Delete a playlist', emoji: '❌' },
        { label: 'List', value: 'list', description: 'List all playlists', emoji: '📖' },
        { label: 'Update', value: 'update', description: 'Update a playlist\'s name', emoji: '✏️' },
        { label: 'Duplicate', value: 'duplicate', description: 'Duplicate a existing playlist', emoji: '🔁' },
        { label: 'Clear', value: 'clear', description: 'Wipe a playlist clean', emoji: '🧹' },
        { label: 'Export', value: 'export', description: 'Export a playlist to a .json file', emoji: '📤' },
        { label: 'Import', value: 'import', description: 'Import a playlist from a .json file', emoji: '📥' },
      ])
  )

const managementRow = new ActionRowBuilder<StringSelectMenuBuilder>()
  .addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('management')
      .setOptions(...managementMenuOptions)
      .setPlaceholder('Select an option')
  )

const pageButtons = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(...buttons)

export async function awaitPlaylistSelection(interaction: ChatInputCommandInteraction, playlistManager: PlaylistManager): Promise<string | null> {
  const [menu, menuError] = await playlistManager.generateMenu(interaction.user.id)

  if (!menu) {
    await interaction.editReply({
      content: `Failed to load your playlists: \`\`\`${menuError}\`\`\``,
      components: [optionsMenu]
    })
    return null
  }

  const response = await interaction.editReply({
    content: 'Select a playlist',
    components: [menu],
  })

  const playlistSelection = await response.awaitMessageComponent({
    componentType: ComponentType.StringSelect,
    time: 60000
  })

  if (!playlistSelection) {
    await interaction.editReply({
      content: 'You took to long to select a playlist. The command has been cancelled.',
      components: []
    })
    return null
  }

  return playlistSelection.values[0]
}

const playlist: Command = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Create, import, manage or load your playlists.'),

  permissions: {
    user: ['Connect', 'Speak'],
    bot: ['Connect', 'Speak', 'SendMessages']
  },

  helpData: {
    description: 'Create, import, manage or load your playlists.',
    examples: ['```/playlist```']
  },

  callback: async ({ interaction }) => {
    const playlistManager = new PlaylistManager()
    const initialResponse = await interaction.reply({
      content: 'Select an option:',
      components: [optionsMenu]
    })

    const optionsCollector = initialResponse.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      idle: 60000
    })

    optionsCollector.on('collect', async (collected) => {
      await collected.deferUpdate()

      if (collected.user.id !== interaction.user.id) {
        collected.reply({
          content: 'You can\'t use this.',
          ephemeral: true
        })
      }

      switch (collected.values[0]) {
        case 'create': {
          await interaction.editReply({
            content: 'Enter a name for the new playlist:',
            components: []
          })

          const name = await interaction.channel?.awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            max: 1,
            time: 60000,
            errors: ['time']
          })

          if (!name) {
            await interaction.editReply({
              content: 'You took too long to respond. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          const playlistName = name.first()?.content

          if (!playlistName) {
            await interaction.editReply({
              content: 'You did not enter a name. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          const [response, playlist, error] = await playlistManager.create(playlistName, interaction.user.id)

          if (response === PlaylistResponse.ERROR || !playlist) {
            await interaction.editReply({
              content: `Failed to create a empty playlist: \`\`\`${error}\`\`\``,
              components: [optionsMenu]
            })
            break
          }

          if (response === PlaylistResponse.ALREADY_EXISTS) {
            await interaction.editReply({
              content: 'A playlist with that name already exists.',
              components: [optionsMenu]
            })
          }

          if (response === PlaylistResponse.TOO_MANY_PLAYLISTS) {
            await interaction.editReply({
              content: 'You already have the maximum number of playlists (25). Delete one to continue.',
              components: [optionsMenu]
            })
          }

          if (response === PlaylistResponse.SUCCESS) {
            await interaction.editReply({
              content: `Created a new playlist: **${playlist.name}**`,
              components: [optionsMenu]
            })
          }

          break
        }

        case 'import_url': {
          await interaction.editReply({
            content: 'Enter the URL of the playlist followed by the name (in a separate message):',
            components: []
          })

          const urlAndName = await interaction.channel?.awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            max: 2,
            time: 60000,
            errors: ['time']
          })

          if (!urlAndName) {
            await interaction.editReply({
              content: 'You took too long to respond. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          const playlistUrl = urlAndName.first()?.content
          const playlistName = urlAndName.at(1)?.content

          if (!playlistUrl) {
            await interaction.editReply({
              content: 'You did not enter a URL. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          if (!playlistName) {
            await interaction.editReply({
              content: 'You did not enter a name. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          const [response, playlist, error] = await playlistManager.importFromUrl(playlistName, interaction.user.id, playlistUrl)

          const replyOptions = {
            [PlaylistResponse.ERROR]: `Failed to import playlist: \`\`\`${error?.stack}\`\`\``,
            [PlaylistResponse.INVALID_PLAYLIST_URL]: 'Invalid playlist URL. The command has been cancelled.',
            [PlaylistResponse.TOO_MANY_TRACKS]: 'Playlist contains too many tracks (max 2500 allowed). The command has been cancelled.',
            [PlaylistResponse.SUCCESS]: `Playlist **${playlist?.name}** imported`
          }

          await interaction.editReply({ content: replyOptions[response], components: [optionsMenu] })
          break
        }

        case 'manage': {
          const playlistName = await awaitPlaylistSelection(interaction, playlistManager)

          if (!playlistName) break

          // "Eslint being a pain in the ass" - AI 01.03.2024
          // eslint-disable-next-line
          let [response, playlist, error] = await playlistManager.getPlaylistFromName(playlistName, interaction.user.id)

          if (response === PlaylistResponse.ERROR || !playlist) {
            await interaction.editReply(`Failed to fetch playlist: \`\`\`${error?.stack}\`\`\``)
            break
          }

          const [embedsResponse, embeds, embedError] = await playlistManager.generatePlaylistEmbed(playlist, interaction.user.displayAvatarURL())

          if (embedsResponse === PlaylistResponse.ERROR || embeds === undefined) {
            await interaction.editReply(`Failed to generate playlist embed: \`\`\`${embedError?.stack}\`\`\``)
            break
          }

          let page = 0

          const editorResponse = await interaction.editReply({
            components: [managementRow, pageButtons],
            embeds: [embeds[0]],
            content: ''
          })

          const collector = editorResponse.createMessageComponentCollector({
            idle: 60000
          })

          optionsCollector.stop('no edit') // We don't need this anymore

          collector.on('collect', async i => {
            await i.deferUpdate()

            if (i.user.id !== interaction.user.id) {
              await i.followUp({
                content: 'You can\'t use this.',
                ephemeral: true
              })
              return
            }

            let updateEmbeds = false
            const messagesToDelete: Array<Message<boolean>> = []
            const componentId = i.componentType === ComponentType.Button ? i.customId : i.values[0]

            // Typeguard
            if (!playlist) return

            switch (componentId) {
              case 'next': {
                page = (page < embeds.length - 1) ? page + 1 : 0

                await i.editReply({
                  embeds: [embeds[page]],
                })

                updateEmbeds = true
                break
              }

              case 'previous': {
                page = (page > 0) ? page - 1 : embeds.length - 1

                await i.editReply({
                  embeds: [embeds[page]],
                })

                updateEmbeds = true
                break
              }

              case 'save': {
                collector.stop()
                break
              }

              case 'add': {
                const followUp = await interaction.followUp({
                  content: 'Enter the url of the track you want to add followed by the position `(in a separate message)`. ',
                })

                messagesToDelete.push(followUp)

                const name = await interaction.channel?.awaitMessages({
                  filter: m => m.author.id === interaction.user.id,
                  max: 2,
                  time: 60000,
                  errors: ['time']
                })

                if (!name) {
                  await followUp.edit('You took too long to respond. The action has been cancelled.')
                  break
                }

                const url = name.first()?.content
                const position = name.at(1)?.content ? parseInt(name.at(1)!.content) : 0

                messagesToDelete.push(...name.map(m => m))

                // Check if valid url
                if (!url || (!url.startsWith('https://') && !url.startsWith('http://'))) {
                  await followUp.edit('You did not enter a valid URL. The action has been cancelled.')
                  break
                }

                const [response, editedPlaylist, error] = await playlistManager.addSong(playlist, url, position)

                if (response === PlaylistResponse.ERROR || !editedPlaylist) {
                  await followUp.edit(`Failed to add song: \`\`\`${error?.stack}\`\`\``)
                  break
                }

                if (response === PlaylistResponse.SUCCESS) {
                  await followUp.edit('Song added.')
                  playlist = editedPlaylist
                  updateEmbeds = true
                }

                break
              }

              case 'remove': {
                if (!playlist.tracks?.length) {
                  await interaction.followUp({
                    content: 'Nothing to remove.',
                    ephemeral: true
                  })
                  break
                }

                const followUp = await interaction.followUp({
                  content: 'Enter the position of the track you want to remove.',
                })

                messagesToDelete.push(followUp)

                const indexMsg = await interaction.channel?.awaitMessages({
                  filter: m => m.author.id === interaction.user.id,
                  max: 1,
                  time: 60000,
                })

                if (!indexMsg) {
                  await followUp.edit('You took too long to respond. The action has been cancelled.')
                  break
                }

                messagesToDelete.push(indexMsg.first()!)

                const index = parseInt(indexMsg.first()?.content ?? 'a')

                // 'a' parses to NaN if content were to be undefined
                if (isNaN(index)) {
                  await followUp.edit('You did not enter a valid index. The action has been cancelled.')
                  break
                }

                const [response, editedPlaylist, error] = await playlistManager.removeSong(playlist, index)

                if (response === PlaylistResponse.ERROR || !editedPlaylist) {
                  await followUp.edit(`Failed to remove song from playlist: \`\`\`${error?.stack}\`\`\``)
                }

                if (response === PlaylistResponse.SUCCESS) {
                  await followUp.edit(`Removed song from playlist: **${playlist.name}**`)
                  playlist = editedPlaylist
                  updateEmbeds = true
                }

                break
              }

              case 'replace': {
                if (!playlist.tracks?.length) {
                  await interaction.followUp({
                    content: 'Nothing to replace.',
                    ephemeral: true
                  })
                  break
                }

                const followUp = await interaction.followUp({
                  content: 'Enter the url of the track you want to replace with followed by the position of the track you want to replace `(in a separate message)`. ',
                })

                messagesToDelete.push(followUp)

                const name = await interaction.channel?.awaitMessages({
                  filter: m => m.author.id === interaction.user.id,
                  max: 2,
                  time: 60000,
                  errors: ['time']
                })

                if (!name) {
                  await followUp.edit('You took too long to respond. The action has been cancelled.')
                  break
                }

                messagesToDelete.push(...name.map(m => m))

                const url = name.first()?.content
                const position = name.at(1)?.content ? parseInt(name.at(1)!.content) : NaN

                // Check if valid url
                if (!url || (!url.startsWith('https://') && !url.startsWith('http://'))) {
                  await followUp.edit('You did not enter a valid URL. The action has been cancelled.')
                  break
                }

                if (isNaN(position)) {
                  await followUp.edit('You did not enter a valid index. The action has been cancelled.')
                  break
                }

                if (playlist.tracks?.at(position) === undefined) {
                  await followUp.edit('No song at that index. The action has been cancelled.')
                  break
                }

                const [response, editedPlaylist, error] = await playlistManager.replaceTrack(playlist, url, position)

                if (response === PlaylistResponse.ERROR || !editedPlaylist) {
                  await followUp.edit(`Failed to replace song: \`\`\`${error?.stack}\`\`\``)
                  break
                }

                if (response === PlaylistResponse.SUCCESS) {
                  await followUp.edit('Song replaced.')
                }

                playlist = editedPlaylist
                updateEmbeds = true

                break
              }

              case 'clear': {
                if (!playlist.tracks?.length) {
                  await i.followUp({
                    content: 'Nothing to clear.',
                    ephemeral: true
                  })
                  return
                }

                const [response, newPlaylist, error] = await playlistManager.clear(playlist.name, interaction.user.id)

                if (response === PlaylistResponse.ERROR) {
                  await i.followUp({
                    content: `Failed to clear playlist: \`\`\`${error?.stack}\`\`\``,
                    ephemeral: true
                  })
                  break
                }

                if (response === PlaylistResponse.SUCCESS) {
                  await i.followUp({
                    content: 'Playlist cleared.',
                    ephemeral: true
                  })
                }

                playlist = newPlaylist
                updateEmbeds = true

                break
              }

              case 'shuffle': {
                if (!playlist.tracks?.length) {
                  await i.followUp({
                    content: 'Nothing to shuffle.',
                    ephemeral: true
                  })
                  return
                }

                const [response, newPlaylist, error] = await playlistManager.shuffle(playlist)

                if (response === PlaylistResponse.ERROR) {
                  await i.followUp({
                    content: `Failed to shuffle playlist: \`\`\`${error?.stack}\`\`\``,
                    ephemeral: true
                  })
                }

                if (response === PlaylistResponse.SUCCESS) {
                  await i.followUp({
                    content: 'Playlist shuffled.',
                    ephemeral: true
                  })

                  playlist = newPlaylist
                  updateEmbeds = true
                }

                break
              }

              case 'export': {
                const [response, attachment, error] = await playlistManager.exportPlaylist(playlist.name, interaction.user.id)

                if (response === PlaylistResponse.ERROR || !attachment) {
                  await i.followUp({
                    content: `Failed to export playlist: \`\`\`${error?.stack}\`\`\``,
                    ephemeral: true
                  })
                  break
                }

                if (response === PlaylistResponse.SUCCESS) {
                  await i.followUp({
                    content: 'Playlist exported. Here\'s the file:',
                    files: [attachment],
                    ephemeral: true
                  })
                }

                break
              }
            }

            if (updateEmbeds) {
              if (!playlist) return // "Shouldn't happen, typescript is just bitching about it" - AI once again (02.03.2024)
              const [newEmbedResponse, embeds, embedError] = await playlistManager.generatePlaylistEmbed(playlist, interaction.user.displayAvatarURL())

              if (newEmbedResponse === PlaylistResponse.ERROR || !embeds) {
                await i.followUp({
                  content: `Failed to generate playlist embed: \`\`\`${embedError?.stack}\`\`\``,
                  ephemeral: true
                })
                return
              }

              await i.editReply({ embeds: [embeds[page]] })
            }

            setTimeout(async () => {
              for (const msg of messagesToDelete) {
                try {
                  await msg.delete()
                } catch { /* Do nothing */ }
              }
            }, 5000)
          })

          collector.on('end', () => {
            // Save playlist to db and disable menu
            if (!playlist) return

            playlist.lastUpdatedAt = new Date()
            playlists.update(playlist, { where: { name: playlist.name, userId: interaction.user.id } })

            editorResponse.edit({
              content: 'Playlist menu disabled. You can reenable it by using the `/playlist` command.\nAny changes you made will be saved now.',
              components: [],
              embeds: []
            })
          })
          break
        }

        case 'delete': {
          const playlistName = await awaitPlaylistSelection(interaction, playlistManager)

          // Handled in function
          if (!playlistName) break

          const [response, error] = await playlistManager.delete(playlistName, interaction.user.id)

          const replies = {
            [PlaylistResponse.ERROR]: `Failed to delete playlist: \`\`\`${error?.stack}\`\`\``,
            [PlaylistResponse.NOT_FOUND]: 'A playlist with that name does not exist.',
            [PlaylistResponse.SUCCESS]: 'Playlist deleted.'
          }

          await interaction.editReply({ content: replies[response], components: [optionsMenu] })

          break
        }

        case 'list': {
          const [playlists, error] = await playlistManager.list(interaction.user.id)

          if (!playlists) {
            await interaction.editReply(`Failed to list playlists: \`\`\`${error?.stack}\`\`\``)
            break
          }

          if (playlists.length === 0) {
            await interaction.editReply('You do not have any playlists.')
            break
          }

          const pageButtons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(...buttons)

          let page = 0
          const response = await interaction.editReply({
            content: 'Here are your playlists:',
            embeds: [playlists[page]],
            components: [pageButtons]
          })

          const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            idle: 30000
          })

          collector.on('collect', async i => {
            await i.deferUpdate()

            if (i.customId === 'next') {
              (page - 1 < 0) ? page = playlists.length - 1 : page--
            } else if (i.customId === 'previous') {
              (page + 1 > playlists.length) ? page = 0 : page++
            }

            await i.editReply({
              embeds: [playlists[page]],
            })
          })

          break
        }

        case 'update': {
          const playlistName = await awaitPlaylistSelection(interaction, playlistManager)

          if (!playlistName) break

          await interaction.editReply({
            content: 'Enter a new name for the playlist:',
            components: []
          })

          const name = await interaction.channel?.awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            max: 1,
            time: 60000,
            errors: ['time']
          })

          if (!name) {
            await interaction.editReply('You took too long to respond. The command has been cancelled.')
            break
          }

          const newName = name.first()?.content

          if (!newName) {
            await interaction.editReply('You did not enter a name. The command has been cancelled.')
            break
          }

          const [response, error] = await playlistManager.update(playlistName, newName, interaction.user.id)

          const replies = {
            [PlaylistResponse.ERROR]: `Failed to update playlist: \`\`\`${error?.stack}\`\`\``,
            [PlaylistResponse.SUCCESS]: `Playlist name updated to **${newName}**.`
          }

          await interaction.editReply({ content: replies[response], components: [optionsMenu] })
          break
        }

        case 'duplicate': {
          const playlistName = await awaitPlaylistSelection(interaction, playlistManager)

          if (!playlistName) break

          await interaction.editReply({
            content: 'Enter a new name for the duplicated playlist:',
            components: []
          })

          const name = await interaction.channel?.awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            max: 1,
            time: 60000,
            errors: ['time']
          })

          if (!name) {
            await interaction.editReply('You took too long to respond. The command has been cancelled.')
            break
          }

          const newName = name.first()?.content

          if (!newName) {
            await interaction.editReply('You did not enter a name. The command has been cancelled.')
            break
          }

          const [response, error] = await playlistManager.duplicate(playlistName, newName, interaction.user.id)

          const replies = {
            [PlaylistResponse.ERROR]: `Failed to duplicate playlist: \`\`\`${error?.stack}\`\`\``,
            [PlaylistResponse.ALREADY_EXISTS]: 'A playlist with that name already exists.',
            [PlaylistResponse.NOT_FOUND]: 'A playlist with that name does not exist.',
            [PlaylistResponse.SUCCESS]: `Playlist duplicated to **${newName}**.`
          }

          await interaction.editReply({ content: replies[response], components: [optionsMenu] })
          break
        }

        case 'clear': {
          const playlistName = await awaitPlaylistSelection(interaction, playlistManager)

          if (!playlistName) break

          const [response, _, error] = await playlistManager.clear(playlistName, interaction.user.id)

          const replies = {
            [PlaylistResponse.ERROR]: `Failed to clear playlist: \`\`\`${error?.stack}\`\`\``,
            [PlaylistResponse.NOT_FOUND]: 'A playlist with that name does not exist.',
            [PlaylistResponse.SUCCESS]: 'Playlist cleared.'
          }

          await interaction.editReply({ content: replies[response], components: [optionsMenu] })

          break
        }

        case 'export': {
          const playlist = await awaitPlaylistSelection(interaction, playlistManager)

          if (!playlist) break

          const [response, attachment, error] = await playlistManager.exportPlaylist(playlist, interaction.user.id)

          if (response === PlaylistResponse.ERROR || !attachment) {
            await interaction.editReply({
              content: `Failed to export playlist: \`\`\`${error?.stack}\`\`\``,
              components: [optionsMenu]
            })
            break
          }

          if (response === PlaylistResponse.NOT_FOUND) {
            await interaction.editReply({
              content: 'A playlist with that name does not exist.',
              components: [optionsMenu]
            })
          }

          if (response === PlaylistResponse.SUCCESS) {
            await interaction.editReply({
              content: 'Playlist exported. Here\'s the file:',
              files: [attachment]
            })
          }

          break
        }

        case 'import': {
          await interaction.editReply({
            content: 'Enter the name of the playlist you want to import and attach the exported JSON file:',
            components: []
          })

          const msg = await interaction.channel?.awaitMessages({
            filter: m => m.author.id === interaction.user.id,
            max: 1,
            time: 60000,
            errors: ['time']
          })

          if (!msg) {
            await interaction.editReply({
              content: 'You took too long to respond. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          const nameAndData = msg.first()

          if (!nameAndData?.content) {
            await interaction.editReply({
              content: 'You did not enter a name. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          if (!nameAndData?.attachments?.first()) {
            await interaction.editReply({
              content: 'You did not attach a file. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          if (nameAndData.attachments.first()?.contentType !== 'application/json; charset=utf-8') {
            await interaction.editReply({
              content: 'The attached file is not a JSON file. The command has been cancelled.',
              components: [optionsMenu]
            })
            break
          }

          const [response, error] = await playlistManager.importPlaylist(nameAndData.content, interaction.user.id, nameAndData.attachments.first()!)

          const replies = {
            [PlaylistResponse.ERROR]: `Failed to import playlist: \`\`\`${error?.stack}\`\`\``,
            [PlaylistResponse.ALREADY_EXISTS]: 'A playlist with that name already exists.',
            [PlaylistResponse.INVALID_DATA]: 'Invalid JSON data. The command has been cancelled.',
            [PlaylistResponse.SUCCESS]: 'Playlist imported.'
          }

          await interaction.editReply({ content: replies[response], components: [optionsMenu] })
          break
        }
      }
    })

    optionsCollector.on('end', () => {
      if (optionsCollector.endReason === 'no edit') return

      interaction.editReply({
        components: [],
        content: 'Command has timed out.'
      })
    })
  }
}

export default playlist