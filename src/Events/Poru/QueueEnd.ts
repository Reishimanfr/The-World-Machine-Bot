import type { EmbedBuilder } from 'discord.js'
import type { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { inactiveGifUrl } from '../../Helpers/Util'
import type { Event } from '../../Types/Event'

const QueueEnd: Event = {
  name: 'queueEnd',
  once: false,
  execute: async (player: ExtPlayer) => {
    if (player.settings.queueEndDisconnect) return player.destroy()

    player.controller.setupPlayerTimeout()
    player.pauseEditing = true

    const message = await player.message?.fetch()
      .catch(() => null) // We can't do anything about a potential error here...

    if (!message) return

    // We don't need the other embeds here
    const embed: EmbedBuilder = await player.messageManger.createPlayerEmbed()[0]
    const buttons = player.messageManger.createPlayerButtons(true)

    const descriptionSplit = embed[0].data.description?.split('\n')

    embed.setDescription(`${descriptionSplit?.[0] ?? ''}`)
    embed.setAuthor({
      name: 'Idling...⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      iconURL: inactiveGifUrl
    })

    await message.edit({
      embeds: [embed],
      components: [buttons]
    })
      .catch(() => {}) // ... neither can we do anything here
  }
}

export default QueueEnd
