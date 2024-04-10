import { ActivityType, GatewayIntentBits, Partials } from 'discord.js'
import { validateConfig } from './Funcs/ConfigValidator'
import { Bot } from './Classes/Bot'
import cron from 'node-cron'
import { serverStats, ServerStatsI } from './Models'
import sequelize from './Models/Connection'
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

client.initialize(process.env.BOT_TOKEN)

// This is ran every day and leaves inactive servers due to the
// 100 guilds limit set for unverified bots.
// You can disable this through the .env file
cron.schedule('0 0 * * *', async () => {
  const guilds = await client.guilds.fetch()

  for (const [_, guild] of guilds) {
    const [record] = await serverStats.findOrCreate({
      where: { guildId: guild.id },
      defaults: { guildId: guild.id, lastActive: new Date() }
    })

    // Don't leave it's own server lmao
    if (record.getDataValue('guildId') === process.env.CUSTOM_EMOJIS_GUILD_ID) continue 

    const now = new Date()
    const data: ServerStatsI = record.dataValues

    const date = data.lastActive
    const threeMonthsLater = date.setMonth(date.getMonth() + 3)

    if (now.getTime() >= threeMonthsLater) {
      Promise.all([
        client.guilds.fetch(data.guildId).then(guild => guild.leave().catch(() => {})),
        serverStats.destroy({ where: { id: data.id } })
      ])
    }
  }
})

// Update the bot's status every minute. This will only
// fire when the new presence to be set is different to the
// current presence to not send unneeded requests.
cron.schedule('* * * * *', () => {
  const activePlayers = client.poru.players.size
  const currentActivity = client.user?.presence?.activities[0]
  let activityName = 'with YouTube\'s API'

  if (client.poru.players.size) {
    activityName = `music in ${activePlayers} server${activePlayers > 1 ? 's' : ''}`
  }

  if (currentActivity?.name === activityName) return

  client.user.setPresence({
    activities: [{ name: activityName, type: ActivityType.Playing }]
  })
})
