import { Client, Collection, REST, type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js'
import { logger } from '../Helpers/Logger'
import { type NodeGroup, Poru } from 'poru'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Event } from '../Types/Event'
import type { Command } from '../Types/Command'
import { setTimeout } from 'node:timers/promises'
import type { Button } from '../Types/Button'
require('dotenv').config()

const COMMANDS_PATH = join(__dirname, '../Commands')
const CLIENT_EVENTS_PATH = join(__dirname, '../Events/Bot')
const PORU_EVENTS_PATH = join(__dirname, '../Events/Poru')
const MUSIC_BUTTONS_PATH = join(__dirname, '../Events/Bot/Buttons')

class Bot extends Client<true> {
  private lavalinkNodesAmount = 1
  private nodes: NodeGroup[] = []
  public poru: Poru

  public clientEvents: Collection<string, Event> = new Collection()
  public poruEvents: Collection<string, Event> = new Collection()
  public commands: Collection<string, Command> = new Collection()
  public musicButtons: Collection<string, Button> = new Collection()

  private loadModFiles<T>(dir: string, recursive: boolean): T[] {
    const files = readdirSync(dir)

    return files.reduce((modFiles: T[], file) => {
      const filePath = join(dir, file)
      const isDir = statSync(filePath).isDirectory()

      if (isDir && recursive) {
        return modFiles.concat(this.loadModFiles<T>(filePath, recursive))
      }
      
      if (file.endsWith('.ts')) {
        const mod = require(filePath)?.default

        if (!mod) {
          logger.warn(`Module ${file} doesn't have a default export. Skipping...`)
        } else {
          modFiles.push(mod)
        }
      }

      return modFiles
    }, [])
  }

  public async createIcons() {
    if (!process.env.CUSTOM_EMOJIS_GUILD_ID) {
      logger.fatal(`You haven't provided a guild ID to store custom emojis in. Please create a new empty guild and pass it's ID inside of the .env file in the CUSTOM_EMOJIS_GUILD_ID property.`)
      process.exit(1)
    }

    const guilds = await this.guilds.fetch()
    const emojisGuild = await guilds.find(g => g.id === process.env.CUSTOM_EMOJIS_GUILD_ID)?.fetch()

    if (!emojisGuild) {
      logger.fatal(`Failed to fetch server with ID ${process.env.CUSTOM_EMOJIS_GUILD_ID}. Did you add the bot to the newly created guild?`)
      process.exit(1)
    }

    const botPerms = emojisGuild.members.me?.permissions

    if (!botPerms?.has('ManageEmojisAndStickers')) {
      logger.fatal(`I'm missing the manage emojis and stickers permission. Please give me the required permissions.`)
      process.exit(1)
    }

    const emojis = emojisGuild.emojis.cache
    const assets = readdirSync(join(__dirname, '../Assets'))
      .filter(f => f.endsWith('.png'))

    if (emojis.size === assets.length) return logger.debug("Emojis guild already exists.")

    if (emojis.size > 0) {
      logger.fatal(`Guild ${emojisGuild.name} (${emojisGuild.id}) already has emojis in it. Please remove all emojis or create a new empty server.`)
      process.exit(1)
    }

    logger.warn(`Adding ${assets.length} emojis to ${emojisGuild.name} (${emojisGuild.id}) in 10 seconds...`)
    await setTimeout(10000)

    const emojisData = {}

    for (const file of assets) {
      const fullPath = join(__dirname, `../Assets/${file}`)

      await setTimeout(200) // To spam the api less
      const name = file.split('.')[0] // Remove extension

      await emojisGuild.emojis.create({
        attachment: fullPath,
        name: name,
        reason: 'Emoji used by TWM to display various elements in commands. This is REQUIRED and should NOT be messed with.',
      })
      .then(emoji => {
        logger.debug(`Created emoji -> ${emoji.name} (${emoji.toString()})`)
        emojisData[name] = emoji.toString()
      })
      .catch(error => {
        logger.error(`Failed to create emoji from file ${file} falling back to default icon: ${error.stack}`)
        emojisData[name] = '⚠' // I never tested this :3
      })
    }

    writeFileSync(join(__dirname, '../../icons.json'), JSON.stringify(emojisData, null, 2), 'utf-8')

    logger.info("Icon file saved.")
    logger.info("You can use the bot as normal now!")
  }

  public async initialize(token: string) {
    await this.login(token)

    for (let i = 0; i < this.lavalinkNodesAmount; i++) {
      this.nodes.push({
        name: `local-${i}`,
        host: process.env.LAVALINK_HOST,
        password: process.env.LAVALINK_PASSWORD,
        port: Number(process.env.LAVALINK_PORT)
      })
    }
    
    this.poru = new Poru(this, this.nodes, {
      library: 'discord.js',
      defaultPlatform: 'ytmsearch',
      autoResume: true,
      reconnectTimeout: 10000,
      reconnectTries: 5
    })

    const clientModFiles = this.loadModFiles<Event>(CLIENT_EVENTS_PATH, false)
    const poruModFiles = this.loadModFiles<Event>(PORU_EVENTS_PATH, false)
    const commandModFiles = this.loadModFiles<Command>(COMMANDS_PATH, true)
    const musicButtonModFiles = this.loadModFiles<Button>(MUSIC_BUTTONS_PATH, false)

    for (const mod of clientModFiles) {
      mod.once
        ? this.once(mod.name, (...args) => mod.execute(...args))
        : this.on(mod.name, (...args) => mod.execute(...args))
    }

    for (const mod of poruModFiles) {
      mod.once
        // biome-ignore lint/suspicious/noExplicitAny: Nope! Args here have to be any because of how my handlers work
        ? this.poru.once(mod.name as any, (...args) => mod.execute(...args))
        // biome-ignore lint/suspicious/noExplicitAny: Nope! Args here have to be any because of how my handlers work
        : this.poru.on(mod.name as any, (...args) => mod.execute(...args))
    }

    for (const mod of commandModFiles) {
      this.commands.set(mod.data.name, mod)
    }

    for (const mod of musicButtonModFiles) {
      this.musicButtons.set(mod.name, mod)
    }

    this.createIcons()

    // There are no booleans in .env files
    if (process.env.REGISTER_COMMANDS_ON_START === 'true') {
      await this.registerCommands(token)
    }
  }

  public async registerCommands(token: string) {
    logger.info('Registering (/) commands...')

    const commandModFiles = this.loadModFiles<Command>(COMMANDS_PATH, true)
    const jsonData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = commandModFiles.map(m => m.data.setDMPermission(false).toJSON())

    await new REST()
      .setToken(token)
      .put(Routes.applicationCommands(this.user.id), { body: jsonData })
      .then(_ => logger.info('(/) commands registered successfully!'))
      .catch(error => logger.error(`Failed to register (/) commands: ${error.stack}`))
  }
}

export { Bot }