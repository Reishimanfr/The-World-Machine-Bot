import type { Events } from 'discord.js'

export interface Event {
  name: Events | string
  once: boolean
  // biome-ignore lint/suspicious/noExplicitAny: We should use any here because these events refer to both discord.js and poru events, not just discord.js events
  execute: (...args: any[]) => any
}
