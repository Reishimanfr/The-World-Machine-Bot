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
    .setDescription("See recent player events (like someone skipping a song)."),

  clear: new SlashCommandSubcommandBuilder()
    .setName("clear")
    .setDescription("Clears the entire queue."),

  bassboost: new SlashCommandSubcommandBuilder()
    .setName("bassboost")
    .setDescription("Sets a bassboost filter for the player")
    .addNumberOption((num) =>
      num
        .setName("value")
        .setDescription("Scale of the bass boost filter (in percents)")
        .setRequired(true)
    ),

  timescale: new SlashCommandSubcommandBuilder()
    .setName("timescale")
    .setDescription("Sets the timescale (speed up) filter for the player.")
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
    .setDescription("Disconnects the bot from the channel."),

  loop: new SlashCommandSubcommandBuilder()
    .setName("loop")
    .setDescription(
      "Enable or disable looping for the currently playing track."
    ),

  nowplaying: new SlashCommandSubcommandBuilder()
    .setName("nowplaying")
    .setDescription(
      "Show the currently playing song (along with control buttons)"
    ),

  pause: new SlashCommandSubcommandBuilder()
    .setName("pause")
    .setDescription("Pause the currently playing track."),

  play: new SlashCommandSubcommandBuilder()
    .setName("play")
    .setDescription(
      "Plays a song or adds it to the queue if something else is already playing."
    )
    .addStringOption((input) =>
      input
        .setName("url-or-search")
        .setDescription("Your search query or URL to the song.")
        .setRequired(true)
        .setAutocomplete(botConfig.player.autocomplete)
    ),

  queue: new SlashCommandSubcommandBuilder()
    .setName("queue")
    .setDescription("Show the current queue."),

  queueHistory: new SlashCommandSubcommandBuilder()
    .setName("queue-history")
    .setDescription(
      "See the queue history of a player that finished it's session"
    )
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
    .setDescription("Save the currently playing track to your DMs!"),

  seek: new SlashCommandSubcommandBuilder()
    .setName("seek")
    .setDescription("Seek to a point in the currently playing song")
    .addStringOption((timestamp) =>
      timestamp
        .setName("time")
        .setDescription(
          "Adjust time: +/- seconds or HH:MM:SS format. Use + for forward, - for backward."
        )
        .setRequired(true)
    ),
  skipto: new SlashCommandSubcommandBuilder()
    .setName("skipto")
    .setDescription("Skip to a specified song in the queue")
    .addNumberOption((pos) =>
      pos
        .setName("position")
        .setDescription("Position in the queue to skip to.")
        .setRequired(true)
    ),

  skip: new SlashCommandSubcommandBuilder()
    .setName("skip")
    .setDescription("Skips the currently playing song"),
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
