import { type ButtonFunc } from './_Buttons'

export const showQueue: ButtonFunc = async ({ interaction, player, queue }) => {
  await interaction.deferReply({ ephemeral: true })

  if (!player.queue.length) {
    return interaction.editReply({
      content: 'The queue is empty.'
    })
  }
  
  const embeds = queue.createQueueEmbed()

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
