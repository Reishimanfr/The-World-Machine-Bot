import { SlashCommandSubcommandBuilder } from "discord.js";
import { config as botConfig } from "../../config";
import clear from "./main/clear";
import disconnect from "./main/disconnect";
import loop from "./main/loop";
import pause from "./main/pause";
import play from "./main/play";
import remove from "./main/remove";
import seek from "./main/seek";
import skip from "./main/skip";
import skipto from "./main/skipto";
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
    .addNumberOption(num => num
      .setName("value")
      .setDescription("Scale of the bass boost filter (in percents)")
      .setRequired(true)
    ),

  timescale: new SlashCommandSubcommandBuilder()
    .setName("timescale")
    .setDescription("Set the timescale filter.")
    .addNumberOption(scale => scale
      .setName("speed")
      .setDescription("The speed at which the song should play")
      .setRequired(true)
    )
    .addNumberOption(pitch => pitch
      .setName("pitch")
      .setDescription("The pitch at which the song should play")
    ),

  disconnect: new SlashCommandSubcommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnect the bot from the channel and clears the queue."),

  loop: new SlashCommandSubcommandBuilder()
    .setName("loop")
    .setDescription("Toggle looping for the currently playing track."),

  nowplaying: new SlashCommandSubcommandBuilder()
    .setName("nowplaying")
    .setDescription("Re-send the now playing embed."),

  pause: new SlashCommandSubcommandBuilder()
    .setName("pause")
    .setDescription("Toggle playback of the player."),

  play: new SlashCommandSubcommandBuilder()
    .setName("play")
    .setDescription("Plays or adds a song to the queue.")
    .addStringOption(input => input
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
    .addStringOption(uuid => uuid
      .setName("uuid")
      .setDescription("UUID of the player's session.")
      .setRequired(true)
    ),

  remove: new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Remove a song (or multiple songs) from the queue.")
    .addStringOption(input => input
      .setName("songs")
      .setDescription("Songs to be removed. Check help for bulk removing.")
      .setRequired(true)
    ),

  save: new SlashCommandSubcommandBuilder()
    .setName("save")
    .setDescription("Save the currently playing track."),

  seek: new SlashCommandSubcommandBuilder()
    .setName("seek")
    .setDescription("Seek to a point in the playing song.")
    .addStringOption(timestamp => timestamp
      .setName("time")
      .setDescription("Seek to a specified timestamp (HH:MM:SS format) or by X seconds. (See /help)")
      .setRequired(true)
    ),
  skipto: new SlashCommandSubcommandBuilder()
    .setName("skipto")
    .setDescription("Skip to a specified song in the queue.")
    .addNumberOption(pos => pos
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
