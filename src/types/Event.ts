import { type Events } from 'discord.js'

interface Event {
  name: Events | string
  once: boolean
  execute: (...args: any) => any
}

export default Event
