import { SlashCommandSubcommandBuilder } from "discord.js";
import { config as botConfig } from "../../config";
import clear from "./control/clear";
import disconnect from "./control/disconnect";
import loop from "./control/loop";
import pause from "./control/pause";
import play from "./control/play";
import remove from "./control/remove";
import seek from "./control/seek";
import skip from "./control/skip";
import skipto from "./control/skipto";
import bassboost from "./filters/bassboost";
import timescale from "./filters/timescale";
import audit from "./misc/audit";
import nowplaying from "./misc/nowPlaying";
import queue from "./misc/queue";
import queueHistory from "./misc/queueHistory";
import save from "./misc/save";

export const subcommandData = {
  audit: new SlashCommandSubcommandBuilder()
    .setName("audit")
    .setDescription("See recent player events."),

  clear: new SlashCommandSubcommandBuilder()
    .setName("clear")
    .setDescription("Clear the entire queue."),

  bassboost: new SlashCommandSubcommandBuilder()
    .setName("bassboost")
    .setDescription("Set a bassboost filter")
    .addNumberOption((num) =>
      num
        .setName("value")
        .setDescription("Scale of the bass boost filter (in percents)")
        .setRequired(true)
    ),

  timescale: new SlashCommandSubcommandBuilder()
    .setName("timescale")
    .setDescription("Set the timescale filter.")
    .addNumberOption((scale) =>
      scale
        .setName("speed")
        .setDescription("The speed at which the song should play")
        .setRequired(true)
    )
    .addNumberOption((pitch) =>
      pitch
        .setName("pitch")
        .setDescription("The pitch at which the song should play")
    ),

  disconnect: new SlashCommandSubcommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnect the bot from the channel."),

  loop: new SlashCommandSubcommandBuilder()
    .setName("loop")
    .setDescription(
      "Toggle looping for the currently playing track."
    ),

  nowplaying: new SlashCommandSubcommandBuilder()
    .setName("nowplaying")
    .setDescription(
      "Re-send the player embed."
    ),

  pause: new SlashCommandSubcommandBuilder()
    .setName("pause")
    .setDescription("Toggle playback the player."),

  play: new SlashCommandSubcommandBuilder()
    .setName("play")
    .setDescription("Plays or adds a song to the queue.")
    .addStringOption((input) =>
      input
        .setName("url-or-search")
        .setDescription("Search query or URL to the song/playlist.")
        .setRequired(true)
        .setAutocomplete(botConfig.hostPlayerOptions.autocomplete)
    ),

  queue: new SlashCommandSubcommandBuilder()
    .setName("queue")
    .setDescription("Show the queue."),

  queueHistory: new SlashCommandSubcommandBuilder()
    .setName("queue-history")
    .setDescription("See the queue history of a session.")
    .addStringOption((uuid) =>
      uuid
        .setName("uuid")
        .setDescription("UUID of the player's session")
        .setRequired(true)
    ),

  remove: new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Remove a song (or multiple songs) from the queue")
    .addStringOption((input) =>
      input
        .setName("songs")
        .setDescription(
          "Songs to be removed. Formats: (position) | (position1, position2...) | (position1 - position2)"
        )
        .setRequired(true)
    ),

  save: new SlashCommandSubcommandBuilder()
    .setName("save")
    .setDescription("Save the currently playing track."),

  seek: new SlashCommandSubcommandBuilder()
    .setName("seek")
    .setDescription("Seek to a point in the playing song.")
    .addStringOption((timestamp) =>
      timestamp
        .setName("time")
        .setDescription("Adjust time: +/- seconds or HH:MM:SS format. Use + for forward, - for backward.")
        .setRequired(true)
    ),
  skipto: new SlashCommandSubcommandBuilder()
    .setName("skipto")
    .setDescription("Skip to a specified song in the queue.")
    .addNumberOption((pos) =>
      pos
        .setName("position")
        .setDescription("Position in the queue to skip to.")
        .setRequired(true)
    ),

  skip: new SlashCommandSubcommandBuilder()
    .setName("skip")
    .setDescription("Skips the currently playing song."),
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
  "queue-history": queueHistory,
  remove: remove,
  save: save,
  skip: skip,
  seek: seek,
  skipto: skipto,
};
