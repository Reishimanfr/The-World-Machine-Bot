import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import fs from "fs";
import path from "path";
import { Poru } from "poru";
import { ExtClient } from "./Helpers/ExtendedClasses";
import { config, logger, poruNodes, poruOptions } from "./config";

export const client  = new ExtClient({
  failIfNotExists: true,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    // These allow you to receive interactions on old messages for example
    Partials.Reaction,
    Partials.Message,
  ],
  allowedMentions: { repliedUser: false },
});

process.on('uncaughtException', (error) => {
  console.error(error)
})

process.on('uncaughtExceptionMonitor', (listener) => {
  console.error(listener)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(reason, promise)
})

logger.trace(`Client class initiated`)

try {
  client.poru = new Poru(client , poruNodes, poruOptions);
  logger.debug(`Poru player assigned to client class successfully.`)
} catch (error) {
  logger.error('Failed to connect to lavalink.')
}

const poruEventPath = path.join(__dirname, "./Events/Poru");
const eventPath = path.join(__dirname, "./Events/Bot");
const filter = (file: string) => file.endsWith(".ts")

const poruEvents = fs
  .readdirSync(poruEventPath)
  .filter(filter);

const botEvents = fs
  .readdirSync(eventPath)
  .filter(filter);

for (const file of botEvents) {
  const filePath = path.join(eventPath, file);
  const event = require(filePath).default;

  logger.debug(`Loading client event [${event.name}] @ [${filePath}]`)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

for (const file of poruEvents) {
  const filePath = path.join(poruEventPath, file);
  const event = require(filePath).default;

  logger.debug(`Loading poru event [${event.name}] @ [${filePath}]`)

  if (event.once) {
    client.poru.once(event.name, (...args) => event.execute(...args));
  } else {
    client.poru.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(config.botToken ?? config.devBotToken)

const formatMemoryUsage = (data: number) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

// Update the bot's status every 1 minute
// Also log the process memory usage so we don't create 2 setIntervals that run
// at the same interval
setInterval(() => {
  const activePlayers = client.poru.players.size
  let activityName = 'with youtube\'s API'

  if (activePlayers >= 1) {
    activityName = `music in ${activePlayers} server${activePlayers > 1 ? 's' : ''}`
  }

  client.user?.setPresence({ 
    activities: [
      {
        name: activityName,
        type: ActivityType.Playing
      }
    ]
  })

  const memData = process.memoryUsage()
  const memoryUsage = {
    rss: `${formatMemoryUsage(memData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(memData.heapTotal)} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(memData.heapUsed)} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memData.external)} -> V8 external memory`,
  }

  logger.debug('Memory usage report:')
  logger.debug(memoryUsage)
}, 60000)
