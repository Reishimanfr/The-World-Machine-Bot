import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { NodeGroup, PoruOptions } from 'poru';
import { logger } from './Helpers/Logger';

if (!fs.existsSync('config.yml')) {
  logger.error(
    'Unable to find the config.yml file. Please copy the default configuration file from the github page and place it in the root directory.',
  );
  process.exit(1);
}

const configYAML = fs.readFileSync(path.join(__dirname, '../config.yml'));
const configFile = yaml.load(configYAML);

const config = {
  botToken: configFile.botToken ?? null,
  devBotToken: configFile.devBotToken ?? null,
  enableDev: configFile.enableDev ?? false,
  ownerId: configFile.ownerId ?? null,
  apiKeys: {
    steam: configFile.apiKeys.steam ?? null,
    tenor: configFile.apiKeys.tenor ?? null,
  },
  player: {
    leaveAfterQueueEnd: configFile.player.leaveAfterQueueEnd ?? false,
    autocomplete: configFile.player.autocomplete ?? true,
    announcePlayerActions: configFile.player.announcePlayerActions ?? false,
    resendEmbedAfterSongEnd: configFile.player.resendEmbedAfterSongEnd ?? false,
    enableSkipvote: configFile.player.enableSkipvote ?? true,
    skipvoteThreshold: configFile.player.skipvoteThreshold ?? 50,
    skipvoteMemberRequirement: configFile.player.skipvoteMemberRequirement ?? 3,
  },
};

logger.debug(`Config file loaded:`);
logger.debug(config);

if (!config.botToken && !config.devBotToken) {
  logger.error(`Provide a bot token in the config.yml file located in the root of the folder!`);
  process.exit(1);
}

if (!config.apiKeys.steam) {
  logger.warn("You haven't provided a steam API key. The /tf2 command will NOT work!");
}

if (!config.apiKeys.tenor) {
  logger.warn(
    "You haven't provided a tenor API key. The starboard won't be able to embed tenor gifs!",
  );
}

const poruOptions: PoruOptions = {
  library: 'discord.js',
  defaultPlatform: 'ytsearch',
  autoResume: true,
  reconnectTimeout: 5000,
  reconnectTries: 10,
};

const poruNodes: NodeGroup[] = [
  {
    name: 'localNode',
    host: 'localhost',
    port: 2333,
    password: 'MyPassword',
  },
];

export { config, poruNodes, poruOptions };

