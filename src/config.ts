import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { NodeGroup, PoruOptions } from "poru";
import { logger } from "./Helpers/Logger";

if (!fs.existsSync("config.yml")) {
  logger.error(
    "Unable to find the config.yml file. Please copy the default configuration file from the github page and place it in the root directory."
  );
  process.exit(1);
}

const configYAML = fs.readFileSync(path.join(__dirname, "../config.yml"));
const configFile = yaml.load(configYAML);

/**
 * If anything gets added to this object it will automatically be added to the playerOverrides database.
 * Same goes for removing keys from this object.
 */
const config = {
  botToken: configFile.botToken as string ?? null,
  devBotToken: configFile.devBotToken as string ?? null,
  maintenance: configFile.maintenance as boolean ?? false,
  apiKeys: {
    steam: configFile.apiKeys.steam as string ?? '',
    tenor: configFile.apiKeys.tenor as string ?? '',
  },
  /** Settings related to the bot's music player */
  player: {
    /** Toggles if the bot should leave the voice channel after the queue ends */
    leaveAfterQueueEnd: configFile.player.leaveAfterQueueEnd as boolean ?? false,
    /** Toggles if the bot should resend the current track's embed if it's not the first message in the channel */
    resendEmbedAfterSongEnd: configFile.player.resendEmbedAfterSongEnd as boolean ?? false,
    /** Toggles if skipping should invoke a voting to skip or not */
    enableSkipvote: configFile.player.enableSkipvote as boolean ?? true,
    /** Should the now playing message update itself every 15 seconds? */
    dynamicNowPlayingMessage: configFile.player.dynamicNowPlayingMessage as boolean ?? true,
    /** Sets the threshold of users required to vote yes to skip the current track (in percents) */
    skipvoteThreshold: configFile.player.skipvoteThreshold as number ?? 50,
    /** Sets the minimum amount of members in a voice channel to start a skipvote */
    skipvoteMemberRequirement: configFile.player.skipvoteMemberRequirement as number ?? 3,
    /** Toggles if most music commands require the user to have a DJ role */
    requireDjRole: configFile.player.requireDjRole as boolean ?? false,
    /** Sets the DJ role (a member must have this role to use most music commands) */
    djRoleId: `${configFile.player.djRoleId}` as string ?? ''
  },
  /** Only the bot's host can change these. */
  hostPlayerOptions: {
    /** Toggles if the bot should send messages on actions like pausing or adding a track */
    announcePlayerActions: configFile.player.announcePlayerActions as boolean ?? false,
    /** Toggles /play command autocomplete */
    autocomplete: configFile.player.autocomplete as boolean ?? true,
    /** Should the bot disconnect from the voice channel after being inactive for {playerTimeout} minutes? */
    enablePlayerTimeout: configFile.player.enablePlayerTimeout as boolean ?? true,
    /** Time after which the bot will be automatically disconnected from the voice channel (in minutes). 0 - disable */
    playerTimeout: configFile.player.playerTimeout as number ?? 10,
  }
};

export type BotConfig = typeof config
export type PlayerSettings = typeof config.player

if (!config.botToken && !config.devBotToken) {
  logger.error(
    `Provide a bot token in the config.yml file located in the root of the folder!`
  );
  process.exit(1);
}

if (!config.apiKeys.steam) {
  logger.warn(
    "You haven't provided a steam API key. The /tf2 command will NOT work!"
  );
}

if (!config.apiKeys.tenor) {
  logger.warn(
    "You haven't provided a tenor API key. The starboard won't be able to embed tenor gifs!"
  );
}

const poruOptions: PoruOptions = {
  library: "discord.js",
  defaultPlatform: "ytsearch",
  autoResume: true,
  reconnectTimeout: 5000,
  reconnectTries: 10,
};

const poruNodes: NodeGroup[] = [
  {
    name: "local",
    host: "localhost",
    port: 2333,
    password: "MyPassword",
  },
];

export { config, poruNodes, poruOptions };
