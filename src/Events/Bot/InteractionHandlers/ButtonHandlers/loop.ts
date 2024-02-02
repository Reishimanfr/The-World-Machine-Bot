import { EmbedBuilder } from 'discord.js'
import { embedColor } from '../../../../Helpers/Util'
import { type ButtonFunc } from './_Buttons'

export const loop: ButtonFunc = async ({ interaction, player }) => {
  const loopString = {
    NONE: 'Looping disabled',
    TRACK: 'Looping this track',
    QUEUE: 'Looping the queue'
  }

  player.controller.toggleLoop()
  void player.messageManger.updatePlayerMessage()

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ ${loopString[player.loop]}. ]`)
        .setColor(embedColor)
    ],
    ephemeral: true
  })
}
