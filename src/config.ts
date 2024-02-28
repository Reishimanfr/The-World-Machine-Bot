import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { NodeGroup, PoruOptions } from 'poru'
import winston from 'winston'

interface BotConfigI {
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
  databaseType: 'postgres' | 'sqlite'
}

if (!fs.existsSync('config.yml')) {
  console.error('Unable to find the config.yml file. Please copy the default configuration file from the github page and place it in the root directory.')
  process.exit(1)
}

const configYAML = fs.readFileSync(path.join(__dirname, '../config.yml'))
const configFile = yaml.load(configYAML)

const config: BotConfigI = {
  botToken: configFile.botToken,
  devBotToken: configFile.devBotToken,
  apiKeys: {
    steam: configFile.apiKeys.steam ?? '',
    tenor: configFile.apiKeys.tenor ?? '',
  },
  logLevel: configFile.logLevel ?? 'info',
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
  },
  databaseType: configFile.database ?? 'sqlite'
}

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: config.logLevel,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] [${level.toUpperCase()}] : ${message}`
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.metadata({
          fillExcept: ['message', 'level', 'timestamp', 'label'],
        })
      )
    })
  ]
})

export type BotConfig = typeof config
export type PlayerSettings = typeof config.player

const token = config.botToken ?? config.devBotToken

if (!token) {
  logger.error('Provide a bot token in the config.yml file located in the root of the folder!')
  process.exit(1)
}

if (config.databaseType === 'postgres') {
  try {
    require('pg')
    require('pg-hstore')
  } catch (error) {
    logger.error('Please install the pg and pg-hstore packages to use the postgres database. (npm install pg pg-hstore)')
    process.exit(1)
  }
} else {
  try {
    require('sqlite3')
  } catch (error) {
    logger.error('Please install the sqlite3 package to use the sqlite database. (npm install sqlite3)')
    process.exit(1)
  }
} 

if (!config.apiKeys.steam) {
  logger.warn('You haven\'t provided a steam API key. The /tf2 command will NOT work!')
}

if (!config.apiKeys.tenor) {
  logger.warn('You haven\'t provided a tenor API key. The starboard won\'t be able to embed tenor gifs!')
}

const poruOptions: PoruOptions = {
  library: 'discord.js',
  defaultPlatform: 'ytsearch',
  autoResume: true,
  reconnectTimeout: 1000,
  reconnectTries: 5,
} 

const poruNodes: NodeGroup[] = [
  {
    host: 'localhost',
    name: 'localnode',
    password: 'MyPassword',
    port: 2333
  }
]

export { config, poruNodes, poruOptions }
