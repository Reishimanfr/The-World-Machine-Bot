import { Client, ClientOptions, Collection } from 'discord.js'
import { logger } from '../Helpers/Logger'
import { NodeGroup, Poru } from 'poru'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
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
        } else {
          modFiles.push(mod)
        }
      }

      return modFiles
    }, [])
  }

  public async createIcons() {
    console.log(process.env.CUSTOM_EMOJIS_GUILD_ID)
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
      logger.fatal(`I'm missing the manager emojis and stickers permission`)
      process.exit(1)
    }

    const emojis = emojisGuild.emojis.cache
    const assets = readdirSync(join(__dirname, '../Assets'))
      .filter(f => f.endsWith('.png'))

    if (emojis.size === assets.length) return logger.debug(`Emojis guild already exists.`)

    if (emojis.size > 0) {
      logger.warn(`In 15 seconds the bot will start deleting all emojis from server ${emojisGuild.name} (${emojisGuild.id}). If you do not want this to happen press ctrl+c and change the CUSTOM_EMOJIS_GUILD_ID property in the .env file.`)
      await setTimeout(15000)
  
      logger.warn(`Deleting all emojis from ${emojisGuild.name} (${emojisGuild.id})`)
  
      for (const [_, emoji] of emojis) {
        await setTimeout(250) // To send less spam requests
        await emoji.delete()
          .then(_ => logger.debug(`Deleted emoji -> ${emoji.name} (${emoji.toString()})`))
          .catch(error => logger.error(`Failed to delete emoji -> ${emoji.name} (${emoji.toString()}): ${error.stack}`)) 
      }
    }

    logger.warn(`Adding ${assets.length} emojis to ${emojisGuild.name} (${emojisGuild.id}) now...`)

    let emojisData = {}

    for (const file of assets) {
      const fullPath = join(__dirname, `../Assets/${file}`)

      await emojisGuild.emojis.create({
        attachment: fullPath,
        name: file.split('.')[0] // Remove extension
      })
      .then(_ => {
        logger.debug(`Created emoji -> ${_.name} (${_.toString()})`)
        emojisData[file.split('.')[0]] = _.toString()
      })
      .catch(error => {
        logger.error(`Failed to create emoji from file ${file}: ${error.stack}`)
        emojisData[file.split('.')[0]] = '⚠' // I never tested this :3
      })
    }

    writeFileSync(join(__dirname, '../../icons.json'), JSON.stringify(emojisData, null, 2), 'utf-8')

    logger.debug(`All done! Saving new emoji data to icons.json now...`)
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
}

export { Bot }