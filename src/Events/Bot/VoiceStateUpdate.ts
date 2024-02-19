import { Events, type VoiceState } from 'discord.js'
import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import { client  } from '../../index'
import type Event from '../../types/Event'
import PlayerDestroy from '../Poru/PlayerDestroy'

const UpdateVoiceState: Event = {
  name: Events.VoiceStateUpdate,
  once: false,
  execute: async (oldState: VoiceState, newState: VoiceState) => {
    const guildId = oldState?.guild?.id ?? newState?.guild?.id
    const player = client .poru.players.get(guildId) as ExtPlayer

    if (!player) return

    const newChannel = newState.guild.members.me?.voice.channel

    // Bot disconnect event
    if (!newChannel) {
      return PlayerDestroy.execute(player, 'Bot was disconnected from voice channel.')
    }

    const membersWithoutBots = newChannel.members
      .filter(m => !m.user.bot)

    // Everyone left voice
    if (membersWithoutBots.size === 0) {
      return PlayerDestroy.execute(player, 'Everyone left the voice channel.')
    }
  }
}

export default UpdateVoiceState
