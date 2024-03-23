import { ActivityType, GatewayIntentBits, Partials } from 'discord.js'
import { validateConfig } from './Funcs/ConfigValidator'
import { Bot } from './Classes/Bot'
require('dotenv').config()

export const client = new Bot({
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

client.initialize()
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
