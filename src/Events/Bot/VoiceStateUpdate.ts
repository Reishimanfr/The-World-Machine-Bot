import { Events, VoiceState } from 'discord.js'
import { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { client  } from '../../index'
import { Event } from '../../Types/Event'

const UpdateVoiceState: Event = {
  name: Events.VoiceStateUpdate,
  once: false,
  execute: async (oldState: VoiceState, newState: VoiceState) => {
    const guildId = oldState?.guild?.id ?? newState?.guild?.id
    const player = client .poru.players.get(guildId) as ExtPlayer

    if (!player) return

    const newChannel = newState.guild.members.me?.voice.channel

    // Bot disconnect
    if (!newChannel) return player.destroy()
    
    const membersWithoutBots = newChannel.members
      .filter(m => !m.user.bot)

    // Everyone left voice
    if (membersWithoutBots.size === 0) {
      player.controller.setupPlayerTimeout()
    } else { // This means someone joined the voice channel
      player.controller.cancelPlayerTimeout() 
    }
  }
}

export default UpdateVoiceState
