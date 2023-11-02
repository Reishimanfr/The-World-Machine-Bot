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

const config = {
  botToken: configFile.botToken as string ?? null,
  devBotToken: configFile.devBotToken as string ?? null,
  enableDev: configFile.enableDev as boolean ?? false,
  ownerId: configFile.ownerId as string ?? '',
  apiKeys: {
    steam: configFile.apiKeys.steam as string ?? '',
    tenor: configFile.apiKeys.tenor as string ?? '',
  },
  /** Settings related to the bot's music player */
  player: {
    /** Toggles if the bot should leave the voice channel after the queue ends */
    leaveAfterQueueEnd: configFile.player.leaveAfterQueueEnd as boolean ?? false,
    /** Time after which the bot will be automatically disconnected from the voice channel (in minutes) */
    playerTimeout: configFile.player.playerTimeout as number ?? 10,
    /** Toggles /play command autocomplete */
    autocomplete: configFile.player.autocomplete as boolean ?? true,
    /** Toggles if the bot should send messages on actions like pausing or adding a track */
    announcePlayerActions: configFile.player.announcePlayerActions as boolean ?? false,
    /** Toggles if the bot should resend the current track's embed if it's not the first message in the channel */
    resendEmbedAfterSongEnd: configFile.player.resendEmbedAfterSongEnd as boolean ?? false,
    /** Toggles if skiping should invoke a voting to skip or not */
    enableSkipvote: configFile.player.enableSkipvote as boolean ?? true,
    /** Sets the threshold of users required to vote yes to skip the current track (in percents) */
    skipvoteThreshold: configFile.player.skipvoteThreshold as number ?? 50,
    /** Sets the minimum amount of members in a voice channel to start a skipvote */
    skipvoteMemberRequirement: configFile.player.skipvoteMemberRequirement as number ?? 3,
  },
};

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
    name: "localNode",
    host: "localhost",
    port: 2333,
    password: "MyPassword",
  },
];

export { config, poruNodes, poruOptions };
