import { type Track } from 'poru'
import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import type Event from '../../types/Event'
import { client } from '../..'
import { ChannelType } from 'discord.js'

const TrackError: Event = {
  name: 'trackError',
  once: false,
  execute: async (player: ExtPlayer, track: Track, error: Error) => {
    if (player.textChannel) {
      const guild = await client.guilds.fetch(player.guildId)
      const channel = await guild.channels.fetch(player.textChannel)

      if (channel?.type === ChannelType.GuildText && channel?.permissionsFor(client.user!.id)?.has('SendMessages')) {
        channel.send(`Failed to play track ${track.info.title}: \`\`\`${error}\`\`\``)
      }
    }
  }
}

export default TrackError
