import { type ApplicationCommandOptionChoiceData, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'
import { PlaylistManager, PlaylistResponse } from '../../Classes/PlaylistManager'
import type { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'

const playlist_load: Command = {
  data: new SlashCommandBuilder()
    .setName('playlist-load')
    .setDescription('Loads one of your playlists.')
    .addStringOption(playlist => playlist
      .setName('playlist')
      .setDescription('The name of the playlist you want to load')
      .setRequired(true)
      .setAutocomplete(true)
    ),

  permissions: {
    user: ['Connect', 'Speak'],
    bot: ['Connect', 'Speak', 'SendMessages']
  },

  helpData: {
    description: 'Loads one of your playlists.',
    examples: ['```/playlist-load```']
  },

  callback: async ({ interaction, client }) => {
    if (!interaction.channel) return
    const playlistManager = new PlaylistManager()

    await interaction.deferReply({ ephemeral: true })

    const member = await interaction.guild.members.fetch(interaction.user.id)

    if (!member.voice.channel) {
      return interaction.editReply({
        content: 'You must be in a voice channel to use this.'
      })
    }

    if (!member.voice.channel.joinable) {
      return interaction.editReply({
        content: 'I cannot join your voice channel.'
      })
    }

    const selectPlaylist = interaction.options.getString('playlist', true)

    const [playlistResponse, playlist, playlistError] = await playlistManager.getPlaylistFromName(selectPlaylist, interaction.user.id)

    if (playlistResponse === PlaylistResponse.ERROR || !playlist) {
      interaction.editReply(`Failed to load your playlist: \`\`\`${playlistError}\`\`\``)
      return
    }

    let player = client.poru.players.get(interaction.guildId) as ExtPlayer | undefined

    if (!player) {
      player = client.poru.createConnection({
        guildId: interaction.guild.id,
        voiceChannel: member.voice.channel.id,
        textChannel: interaction.channel.id,
        deaf: true,
        mute: false
      }) as ExtPlayer

      player.setVolume(75)
      player.guildId ||= interaction.guild.id
    }

    const [response, error] = await playlistManager.load(playlist, player, interaction.user)

    if (player.isConnected && !player.isPlaying) player.play()

    if (response === PlaylistResponse.ERROR) {
      return interaction.editReply({
        content: `Failed to load your playlist: \`\`\`${error}\`\`\``
      })
    }

    interaction.editReply({
      content: `Playlist **${playlist.name}** loaded.`,
    })
  },

  autocomplete: async (interaction) => {
    const [allPlaylists, error] = await new PlaylistManager()
      .getAllPlaylists(interaction.user.id)

    if (!allPlaylists?.length) {
      return interaction.respond([
        {
          name: '❌ You don\'t have any playlists.',
          value: 'none'
        }
      ])
    }

    if (error) {
      logger.error(`Failed to load playlists: ${error.stack}`)
      return interaction.respond([
        {
          name: '❌ Something went wrong.',
          value: 'none'
        }
      ])
    }

    const options: ApplicationCommandOptionChoiceData<string | number>[] = []

    for (const playlist of allPlaylists) {
      options?.push({
        name: playlist.name,
        value: playlist.name
      })
    }

    await interaction.respond(options)
  }
}

export default playlist_load