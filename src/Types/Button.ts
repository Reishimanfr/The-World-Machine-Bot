import type { ButtonInteraction } from 'discord.js'
import type { ExtPlayer } from '../Helpers/ExtendedPlayer'
import type { Bot } from '../Classes/Bot'

export interface Button {
  name: string,
  musicOptions: {
    /** Must be in a voice channel to be used */
    requiresVc?: boolean
    /** Must be playing music to use */
    requiresPlaying?: boolean
    /** Must have the DJ role to use */
    requiresDjRole?: boolean
  }
  run: (args: {
    interaction: ButtonInteraction<'cached'>,
    player: ExtPlayer,
    client: Bot
  }) => Promise<unknown>
}