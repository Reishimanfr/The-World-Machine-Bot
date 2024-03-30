import { Client, ClientOptions, Collection } from 'discord.js'
import { logger } from '../Helpers/Logger'
import { NodeGroup, Poru } from 'poru'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { Event } from '../Types/Event'
import { Command } from '../Types/Command'
import { ServerStatsI, serverStats } from '../Models'
import { randomBytes } from 'crypto'

const NAMES = ['alpha-', 'delta-', 'gamma-', 'lambda-'] as const
const COMMANDS_PATH = join(__dirname, '../Commands')
const CLIENT_EVENTS_PATH = join(__dirname, '../Events/Bot')
const PORU_EVENTS_PATH = join(__dirname, '../Events/Poru')

class Bot extends Client<true> {
  private lavalinkNodesAmount = 5
  private nodes: NodeGroup[] = []
  public poru: Poru

  public clientEvents: Collection<string, Event> = new Collection()
  public poruEvents: Collection<string, Event> = new Collection()
  public commands: Collection<string, Command> = new Collection()

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

  public async initialize() {
    for (let i = 0; i < this.lavalinkNodesAmount; i++) {
      this.nodes.push({
        host: process.env.LAVALINK_HOST,
        name: NAMES[Math.floor(Math.random() * NAMES.length)] + randomBytes(2).toString('hex'),
        password: process.env.LAVALINK_PASSWORD,
        port: Number(process.env.LAVALINK_PORT),
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
  }
}

export { Bot }