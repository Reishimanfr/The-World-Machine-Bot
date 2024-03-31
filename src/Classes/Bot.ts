import { Client, ClientOptions, Collection } from 'discord.js'
import { logger } from '../Helpers/Logger'
import { NodeGroup, Poru } from 'poru'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Event } from '../Types/Event'
import { Command } from '../Types/Command'
import { setTimeout } from 'timers/promises'
import { Button } from '../Types/Button'

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
    const guilds = await this.guilds.fetch()

    // No need to do anything since the guild exists already.
    if (guilds.find(g => g.name === `${this.user.id}-emojis`)) return logger.debug(`Custom emojis guild already exists.`)

    logger.warn(`In 10 seconds the bot will create a empty server to store custom emojis in. If you do not want this happening press ctrl+c, go to the .env file and set CREATE_CUSTOM_EMOJI_GUILD = false`)
    logger.warn(`\n=================================\n=== WAIT FOR THIS TO FINISH BEFORE RUNNING ANY COMMANDS ===\n=================================`)
    await setTimeout(10000)

    const assetFiles = readdirSync(join(__dirname, '../Assets'))
      .filter(file => file.endsWith('.png'))

    const guild = await this.guilds.create({ name: `${this.user.id}-emojis`, channels: [{ name: 'general' }] })

    logger.debug(`Emojis guild created. Adding emojis now...`)

    let icons = {}

    for (const asset of assetFiles) {
      const name = asset.split('.')[0]

      const emoji = await guild.emojis.create({
        attachment: readFileSync(join(__dirname, `../Assets/${asset}`)),
        name: name
      })

      icons[name] = emoji.toString()
      logger.debug(`Added emoji -> ${name} (${emoji.toString()})`)
    }

    logger.debug(`All done! Saving new emoji data to icons.json now...`)

    writeFileSync(join(__dirname, '../../icons.json'), JSON.stringify(icons, null, 2), 'utf-8')

    logger.info(`Icon file saved.`)
    logger.info(`\n=================================\n=== You can use the bot now ===\n=================================`)
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