import { ActivityType, GatewayIntentBits, Partials } from "discord.js"
import fs from "fs"
import path from "path"
import { Poru } from "poru"
import { ExtClient } from "./Helpers/ExtendedClasses"
import { config, logger, poruNodes, poruOptions } from "./config"

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

try {
  client.poru = new Poru(client , poruNodes, poruOptions)
} catch (error) {
  logger.error('Failed to connect to lavalink.')
}

const poruEventPath = path.join(__dirname, "./Events/Poru")
const eventPath = path.join(__dirname, "./Events/Bot")

const poruEvents = fs
  .readdirSync(poruEventPath)
  .filter(file => file.endsWith('.ts'))

const botEvents = fs
  .readdirSync(eventPath)
  .filter(file => file.endsWith('.ts'))

for (const file of botEvents) {
  const filePath = path.join(eventPath, file);
  const event = require(filePath)?.default;

  if (!event) {
    logger.warn(`Client event ${event} doesn't have a default export. Skipping...`)
    continue
  }

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

for (const file of poruEvents) {
  const filePath = path.join(poruEventPath, file)
  const event = require(filePath)?.default

  if (!event) {
    logger.warn(`Poru event ${file} doesn't have a default export. Skipping...`)
    continue
  }

  if (event.once) {
    client.poru.once(event.name, (...args) => event.execute(...args))
  } else {
    client.poru.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(config.botToken ?? config.devBotToken)

// Update the bot's status every 1 minute
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
}, 60000)
