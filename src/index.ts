import { serverStats, type ServerStatsI } from './Models'
import { ActivityType, GatewayIntentBits, Partials } from 'discord.js'
import { Bot } from './Classes/Bot'
import cron from 'node-cron'
import { clipString } from './Funcs/ClipString'
import { logger } from './Helpers/Logger'
import process from "node:process"
require('dotenv').config()

export const client = new Bot({
  failIfNotExists: true,
  presence: {
    status: 'online',
    activities: [{ name: 'with YouTube\'s API', type: ActivityType.Playing }]
  },
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

process.on('uncaughtException', (error) => {
  logger.error(error)
})

process.on('uncaughtExceptionMonitor', (error) => {
  logger.error(error)
})

process.on('unhandledRejection', async (reason) => {
  logger.error(reason)
})

client.initialize(process.env.BOT_TOKEN)

// This is ran every day and leaves inactive servers due to the
// 100 guilds limit set for unverified bots.
// You can disable this through the .env file
cron.schedule('0 0 * * *', async () => {
  if (process.env.LEAVE_INACTIVE_GUILDS !== 'true') return

  logger.debug('Checking if there are any guilds to leave due to inactivity...')
  const guilds = await client.guilds.fetch()

  logger.trace(`Fetched ${guilds.size} guilds`)

  for (const [_, guild] of guilds) {
    const [record] = await serverStats.findOrCreate({
      where: { guildId: guild.id },
      defaults: { guildId: guild.id, lastActive: new Date() }
    })

    // Don't leave it's own server lmao
    if (guild.id === process.env.CUSTOM_EMOJIS_GUILD_ID) {
      logger.debug(`Ignoring guild ${guild.name} (${guild.id}) because it's set as the emojis guild.`)
      continue
    }

    const now = new Date()
    const data: ServerStatsI = record.dataValues

    const date = data.lastActive
    const threeMonthsLater = date.setMonth(date.getMonth() + 3)

    logger.trace(`Checking guild ${guild.name} (${guild.id}). Last active at ${date}`)

    if (now.getTime() >= threeMonthsLater) {
      logger.warn(`Leaving guild ${guild.name} (${guild.id}) due to inactivity.`)
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
cron.schedule('*/1 * * * *', () => {
  const currentPresence = client.user.presence.activities[0]
  let activityName = 'with YouTube\'s API'
  let activityType = ActivityType.Playing

  const currentlyPlayedSongs: string[] = []

  for (const [_, player] of client.poru.players) {
    if (player.currentTrack && player.isPlaying) {
      currentlyPlayedSongs.push(`${player.currentTrack.info.title} - ${player.currentTrack.info.author}`)
    }
  }

  if (currentlyPlayedSongs.length) {
    const randomSong = currentlyPlayedSongs[Math.floor(Math.random() * currentlyPlayedSongs.length)]

    activityName = clipString({ string: randomSong, maxLength: 100, sliceEnd: '...' })
    activityType = ActivityType.Listening
  }

  if (currentPresence?.name === activityName) return

  logger.debug(`Setting new bot presence to "${activityName}"`)

  client.user.setPresence({
    activities: [{ name: activityName, type: activityType }]
  })
})
