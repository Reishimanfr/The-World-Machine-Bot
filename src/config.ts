import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { NodeGroup, PoruOptions } from "poru";
import * as pino from "pino"

export interface BotConfigI {
  botToken?: string
  devBotToken?: string
  apiKeys: {
    steam?: string
    tenor?: string
  }
  logLevel: string
  enableDatabase: boolean
  player: {
    queueEndDisconnect: boolean
    resendMessageOnEnd: boolean
    voteSkipToggle: boolean
    dynamicNowPlaying: boolean
    voteSkipThreshold: number
    voteSkipMembers: number
    requireDjRole: boolean
    djRoleId: string
  }
  hostPlayerOptions: {
    announcePlayerActions: boolean
    autocomplete: true
    enablePlayerTimeout: boolean
    playerTimeout: number
  }
}

if (!fs.existsSync("config.yml")) {
  console.error("Unable to find the config.yml file. Please copy the default configuration file from the github page and place it in the root directory.");
  process.exit(1);
}

const configYAML = fs.readFileSync(path.join(__dirname, "../config.yml"));
const configFile = yaml.load(configYAML);

const config: BotConfigI = {
  botToken: configFile.botToken,
  devBotToken: configFile.devBotToken,
  apiKeys: {
    steam: configFile.apiKeys.steam ?? '',
    tenor: configFile.apiKeys.tenor ?? '',
  },
  logLevel: configFile.logLevel ?? "info",
  enableDatabase: configFile.enableDatabase ?? true,
  /** Settings related to the bot's music player */
  player: {
    /** Toggles if the bot should leave the voice channel after the queue ends */
    queueEndDisconnect: configFile.player.leaveAfterQueueEnd ?? false,
    /** Toggles if the bot should resend the current track's embed if it's not the first message in the channel */
    resendMessageOnEnd: configFile.player.resendEmbedAfterSongEnd ?? false,
    /** Toggles if skipping should invoke a voting to skip or not */
    voteSkipToggle: configFile.player.enableSkipvote ?? true,
    /** Should the now playing message update itself every 15 seconds? */
    dynamicNowPlaying: configFile.player.dynamicNowPlayingMessage ?? true,
    /** Sets the threshold of users required to vote yes to skip the current track (in percents) */
    voteSkipThreshold: configFile.player.skipvoteThreshold ?? 50,
    /** Sets the minimum amount of members in a voice channel to start a skipvote */
    voteSkipMembers: configFile.player.skipvoteMemberRequirement ?? 3,
    /** Toggles if most music commands require the user to have a DJ role */
    requireDjRole: configFile.player.requireDjRole ?? false,
    /** Sets the DJ role (a member must have this role to use most music commands) */
    djRoleId: ''
  },
  /** Only the bot's host can change these. */
  hostPlayerOptions: {
    /** Toggles if the bot should send messages on actions like pausing or adding a track */
    announcePlayerActions: configFile.player.announcePlayerActions ?? false,
    /** Toggles /play command autocomplete */
    autocomplete: configFile.player.autocomplete ?? true,
    /** Should the bot disconnect from the voice channel after being inactive for {playerTimeout} minutes? */
    enablePlayerTimeout: configFile.player.enablePlayerTimeout ?? true,
    /** Time after which the bot will be automatically disconnected from the voice channel (in minutes). 0 - disable */
    playerTimeout: configFile.player.playerTimeout ?? 5,
  }
};

export const logger = pino.default({
  transport: {
    target: 'pino-pretty'
  },
  level: config.logLevel
})

export type BotConfig = typeof config
export type PlayerSettings = typeof config.player

const token = config.botToken ?? config.devBotToken

if (!token) {
  logger.fatal(`Provide a bot token in the config.yml file located in the root of the folder!`);
  process.exit(1);
}

if (!config.apiKeys.steam) {
  logger.warn("You haven't provided a steam API key. The /tf2 command will NOT work!");
}

if (!config.apiKeys.tenor) {
  logger.warn("You haven't provided a tenor API key. The starboard won't be able to embed tenor gifs!");
}

const poruOptions: PoruOptions = {
  library: "discord.js",
  defaultPlatform: "ytsearch",
  autoResume: true,
  reconnectTimeout: 1000,
  reconnectTries: 5,
}; 

logger.debug(`Poru options: ${JSON.stringify(poruOptions, null, 2)}`)

const poruNodes: NodeGroup[] = [
  {
    host: "localhost",
    name: "localnode",
    password: "MyPassword",
    port: 2333
  }
];

export { config, poruNodes, poruOptions };
