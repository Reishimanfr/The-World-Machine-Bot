import { type Events } from 'discord.js'

export interface Event {
  name: Events | string
  once: boolean
  execute: (...args: any[]) => any
}
