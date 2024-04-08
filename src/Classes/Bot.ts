import { Client, ClientOptions, Collection, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js'
import { logger } from '../Helpers/Logger'
import { NodeGroup, Poru } from 'poru'
import { readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Event } from '../Types/Event'
import { Command } from '../Types/Command'
import { setTimeout } from 'timers/promises'
import { Button } from '../Types/Button'
require('dotenv').config()

const COMMANDS_PATH = join(__dirname, '../Commands')
const CLIENT_EVENTS_PATH = join(__dirname, '../Events/Bot')
const PORU_EVENTS_PATH = join(__dirname, '../Events/Poru')
const MUSIC_BUTTONS_PATH = join(__dirname, '../Events/Bot/Buttons')

class Bot extends Client<true> {
  private lavalinkNodesAmount = 5
  private nodes: NodeGroup[] = []
  public poru: Poru

  public clientEvents: Collection<string, Event> = new Collection()
  public poruEvents: Collection<string, Event> = new Collection()
  public commands: Collection<string, Command> = new Collection()
  public musicButtons: Collection<string, Button> = new Collection()

  constructor(options: ClientOptions) {
    super(options)
  }

  private loadModFiles<T>(dir: string, recursive: boolean): T[] {
    const files = readdirSync(dir)

    return files.reduce((modFiles: T[], file) => {
      const filePath = join(dir, file)
      const isDir = statSync(filePath).isDirectory()

      if (isDir && recursive) {
        return modFiles.concat(this.loadModFiles<T>(filePath, recursive))
      } else if (file.endsWith('.ts')) {
        const mod = require(filePath)?.default

        if (!mod) {
          logger.warn(`Module ${file} doesn't have a default export. Skipping...`)
        } else if (mod?.disabled) {
          logger.warn(`Ignoring disabled module ${file}.`)
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

    if (emojis.size === assets.length) return logger.debug(`Emojis guild already exists.`)

    if (emojis.size > 0) {
      logger.fatal(`Guild ${emojisGuild.name} (${emojisGuild.id}) already has emojis in it. Please remove all emojis or create a new empty server.`)
      process.exit(1)
    }

    logger.warn(`Adding ${assets.length} emojis to ${emojisGuild.name} (${emojisGuild.id}) in 10 seconds...`)
    await setTimeout(10000)

    let emojisData = {}

    for (const file of assets) {
      const fullPath = join(__dirname, `../Assets/${file}`)

      await setTimeout(100) // To spam the api less
      const name = file.split('.')[0] // Remove extension

      await emojisGuild.emojis.create({
        attachment: fullPath,
        name: name
      })
      .then(_ => {
        logger.debug(`Created emoji -> ${_.name} (${_.toString()})`)
        emojisData[name] = _.toString()
      })
      .catch(error => {
        logger.error(`Failed to create emoji from file ${file} falling back to default icon: ${error.stack}`)
        emojisData[name] = '⚠' // I never tested this :3
      })
    }

    writeFileSync(join(__dirname, '../../icons.json'), JSON.stringify(emojisData, null, 2), 'utf-8')

    logger.info(`Icon file saved.`)
    logger.info(`You can use the bot as normal now!`)
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
        ? this.poru.once(mod.name as any, (...args) => mod.execute(...args))
        : this.poru.on(mod.name as any, (...args) => mod.execute(...args))
    }

    for (const mod of commandModFiles) {
      this.commands.set(mod.data.name, mod)
    }

    for (const mod of musicButtonModFiles) {
      this.musicButtons.set(mod.name, mod)
    }

    this.createIcons()
  }

  public async registerCommands(token: string) {
    logger.info('Registering (/) commands...')

    await this.login(token)

    const commandModFiles = this.loadModFiles<Command>(COMMANDS_PATH, true)
    const jsonData: RESTPostAPIChatInputApplicationCommandsJSONBody[] = commandModFiles.map(m => m.data.setDMPermission(false).toJSON())

    await new REST()
      .setToken(token)
      .put(Routes.applicationCommands(this.user.id), { body: jsonData })
      .then(_ => logger.info('Success!'))
      .catch(error => logger.error(`Failed to register (/) commands: ${error.stack}`))

    process.exit()
  }
}

export { Bot }