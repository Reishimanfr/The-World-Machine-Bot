import { ActivityType, GatewayIntentBits, Partials } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { Poru } from 'poru'
import { logger } from './Helpers/Logger'
import { ExtClient } from './Helpers/ExtendedClient'
import { validateConfig } from './Funcs/ConfigValidator'
require('dotenv').config()

export const client = new ExtClient({
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
    Partials.Reaction,
    Partials.Message,
  ],
  allowedMentions: { repliedUser: false },
})

validateConfig()

process.on('uncaughtException', (error) => {
  console.error(error)
})

process.on('uncaughtExceptionMonitor', (listener) => {
  console.error(listener)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error(reason, promise)
})


client.poru = new Poru(
  client,
  [{
    host: process.env.LAVALINK_HOST,
    password: process.env.LAVALINK_PASSWORD,
    port: Number(process.env.LAVALINK_PORT),
    name: 'local'
  }],
  {
    library: 'discord.js',
    defaultPlatform: 'ytsearch',
    autoResume: true,
    reconnectTimeout: 10000,
    reconnectTries: 5,
  })

const poruEventPath = path.join(__dirname, './Events/Poru')
const eventPath = path.join(__dirname, './Events/Bot')

const poruEvents = fs
  .readdirSync(poruEventPath)
  .filter(file => file.endsWith('.ts'))

const botEvents = fs
  .readdirSync(eventPath)
  .filter(file => file.endsWith('.ts'))

for (const file of botEvents) {
  const filePath = path.join(eventPath, file)
  const event = require(filePath)?.default

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

client.login(process.env.BOT_TOKEN)

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
