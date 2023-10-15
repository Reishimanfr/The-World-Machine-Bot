import { SlashCommandSubcommandBuilder } from 'discord.js';
import { config as botConfig } from '../../../config';
import audit from './audit';
import bassboost from './bassboost';
import clear from './clear';
import disconnect from './disconnect';
import loop from './loop';
import nowplaying from './nowPlaying';
import pause from './pause';
import play from './play';
import queue from './queue';
import remove from './remove';
import save from './save';
import seek from './seek';
import skip from './skip';
import skipto from './skipto';
import timescale from './timescale';

export const subcommandData = {
  audit: new SlashCommandSubcommandBuilder()
    .setName('audit')
    .setDescription('See recent player events (like someone skipping a song).'),

  clear: new SlashCommandSubcommandBuilder()
    .setName('clear')
    .setDescription('Clears the entire queue.'),

  bassbost: new SlashCommandSubcommandBuilder()
    .setName('bassboost')
    .setDescription('Sets a bassboost filter for the player')
    .addNumberOption((num) =>
      num
        .setName('value')
        .setDescription('Scale of the bass boost filter (in percents)')
        .setRequired(true),
    ),

  timescale: new SlashCommandSubcommandBuilder()
    .setName('timescale')
    .setDescription('Sets the timescale (speed up) filter for the player.')
    .addNumberOption((scale) =>
      scale
        .setName('speed')
        .setDescription('The speed at which the song should play')
        .setRequired(true),
    )
    .addNumberOption((pitch) =>
      pitch.setName('pitch').setDescription('The pitch at which the song should play'),
    ),

  disconnect: new SlashCommandSubcommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnects the bot from the channel.'),

  loop: new SlashCommandSubcommandBuilder()
    .setName('loop')
    .setDescription('Enable or disable looping for the currently playing track.'),

  nowplaying: new SlashCommandSubcommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song (along with control buttons)'),

  pause: new SlashCommandSubcommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing track.'),

  play: new SlashCommandSubcommandBuilder()
    .setName('play')
    .setDescription('Plays a song or adds it to the queue if something else is already playing.')
    .addStringOption((input) =>
      input
        .setName('url-or-search')
        .setDescription('Your search query or URL to the song.')
        .setRequired(true)
        .setAutocomplete(botConfig.player.autocomplete),
    ),

  queue: new SlashCommandSubcommandBuilder()
    .setName('queue')
    .setDescription('Show the current queue.'),

  remove: new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Remove a song (or multiple songs) from the queue')
    .addStringOption((input) =>
      input
        .setName('songs')
        .setDescription(
          'Songs to be removed. Formats: (position) | (position1, position2...) | (position1 - position2)',
        )
        .setRequired(true),
    ),

  save: new SlashCommandSubcommandBuilder()
    .setName('save')
    .setDescription('Save the currently playing track to your DMs!'),

  seek: new SlashCommandSubcommandBuilder()
    .setName('seek')
    .setDescription('Seek to a point in the currently playing song')
    .addStringOption((timestamp) =>
      timestamp
        .setName('time')
        .setDescription(
          'Adjust time: +/- seconds or HH:MM:SS format. Use + for forward, - for backward.',
        )
        .setRequired(true),
    ),
  skipto: new SlashCommandSubcommandBuilder()
    .setName('skipto')
    .setDescription('Skip to a specified song in the queue')
    .addNumberOption((pos) =>
      pos.setName('position').setDescription('Position in the queue to skip to.').setRequired(true),
    ),

  skip: new SlashCommandSubcommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing song'),
};

export const subcommandHandler = {
  audit: audit,
  bassboost: bassboost,
  timescale: timescale,
  clear: clear,
  disconnect: disconnect,
  loop: loop,
  nowplaying: nowplaying,
  pause: pause,
  play: play,
  queue: queue,
  remove: remove,
  save: save,
  skip: skip,
  seek: seek,
  skipto: skipto,
};
