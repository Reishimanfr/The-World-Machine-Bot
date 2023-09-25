import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import Command from '../types/CommandI';
import { ExtPlayer } from '../misc/twmClient';
import PlayerEmbedManager from '../bot_data/playerEmbedManager';
import subcomamndHandler from './music/!SubcommandHandler';
import util from '../misc/Util';

//! add queue command
//! add a insert command (replace but adds the song instead of repaling)
const music: Command = {
  permissions: ['SendMessages', 'Speak', 'UseExternalEmojis', 'Connect'],
  musicCommand: true,
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('All commands related to the music portion of the bot')
    .addSubcommand((play) =>
      play
        .setName('play')
        .setDescription('Play music in a voice channel.')
        .addStringOption((song) =>
          song
            .setName('song')
            .setDescription('Song search query or link')
            .setRequired(true)
        )
    )
    .addSubcommand((pause) =>
      pause.setName('pause').setDescription('Pause the currently playing track.')
    )
    .addSubcommand((nowplaying) =>
      nowplaying
        .setName('nowplaying')
        .setDescription(
          'Show the currently playing song (along with control buttons)'
        )
    )
    .addSubcommand((seek) =>
      seek
        .setName('seek')
        .setDescription('Seek to a point in the currently playing song')
        .addStringOption((timestamp) =>
          timestamp
            .setName('time')
            .setDescription(
              'Adjust time: +/- seconds or HH:MM:SS format. Use + for forward, - for backward.'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((remove) =>
      remove
        .setName('remove')
        .setDescription('Remove a song (or multiple songs) from the queue')
        .addStringOption((input) =>
          input
            .setName('songs')
            .setDescription(
              'Songs to be removed. Formats: (position) | (position1, position2...) | (position1 - position2)'
            )
            .setRequired(true)
        )
    )
    .addSubcommand((replace) =>
      replace
        .setName('replace')
        .setDescription('Replace a song at a specified position in the queue')
        .addStringOption((song) =>
          song
            .setName('url-or-search')
            .setDescription('Search query or URL to the song.')
            .setRequired(true)
        )
        .addNumberOption((pos) =>
          pos
            .setName('position')
            .setDescription('Position in the queue to be replaced')
            .setRequired(true)
        )
    )
    .addSubcommand((audit) =>
      audit
        .setName('audit')
        .setDescription('See recent player events (like someone skipping a song).')
    )
    .addSubcommand((skipTo) =>
      skipTo
        .setName('skipto')
        .setDescription('Skip to a specified song in the queue')
        .addNumberOption((pos) =>
          pos
            .setName('position')
            .setDescription('Position in the queue to skip to.')
            .setRequired(true)
        )
    ),

  callback: async (interaction: ChatInputCommandInteraction, client) => {
    const subcommand = interaction.options.getSubcommand();
    // guildId! means we are ABSOULTELY sure this can't be null
    const player = client.poru.get(interaction.guildId!) as ExtPlayer;

    const member = await util.fetchMember(
      interaction.guild!.id,
      interaction.user.id
    );

    if (!member?.voice.channel?.joinable) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ I can't join this channel. ]")
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }

    if ((!player || !player?.isPlaying) && subcommand !== 'play') {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Nothing is playing right now. ]')
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }

    const songControl = new PlayerEmbedManager(player);

    const handler = subcomamndHandler[subcommand];
    const args = [interaction, player, client, songControl];

    await handler(...args);
  },
};

export default music;
