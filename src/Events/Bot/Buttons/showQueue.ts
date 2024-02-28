import { Button } from '../../../Types/Button'

export const showQueue: Button = async ({ interaction, player }) => {
  await interaction.deferReply({ ephemeral: true })

  if (!player.queue.length) {
    return interaction.editReply({
      content: 'The queue is empty.'
    })
  }
  
  const embeds = player.queueManager.createQueueEmbed()

  if (!embeds?.length) {
    return await interaction.editReply({
      content: 'Failed to create a queue message.'
    })
  }

  if (embeds.length === 1) {
    return await interaction.editReply({
      embeds: [...embeds]
    })
  }

  const description = embeds[0].data.description += '### :warning: For full list of songs, use the `/queue` command!'

  await interaction.editReply({
    embeds: [embeds[0].setDescription(description)]
  })
}
