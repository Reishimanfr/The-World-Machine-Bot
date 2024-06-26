import { Events, type VoiceState } from 'discord.js'
import type { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { client } from '../../index'
import type { Event } from '../../Types/Event'

const UpdateVoiceState: Event = {
  name: Events.VoiceStateUpdate,
  once: false,
  execute: (oldState: VoiceState, newState: VoiceState) => {
    const guildId = oldState?.guild?.id ?? newState?.guild?.id
    const player = client.poru.players.get(guildId) as ExtPlayer | undefined

    if (!player) return

    const newChannel = newState.guild.members.me?.voice.channel
    const isBotMuted = newState.guild.members.me?.voice.serverMute

    if (player.isPaused !== isBotMuted) {
      player.pause(isBotMuted ?? false)
      player.messageManger.updatePlayerMessage()
    }

    // Bot disconnect
    if (!newChannel) return player.destroy()

    const membersWithoutBots = newChannel.members.filter(m => !m.user.bot)

    // Everyone left voice
    if (membersWithoutBots.size === 0) {
      player.pause(true)
      player.messageManger.updatePlayerMessage()
      player.controller.setupPlayerTimeout(60000) // 1 minute for someone to join
    } else {
      player.controller.cancelPlayerTimeout()
    }
  }
}

export default UpdateVoiceState
