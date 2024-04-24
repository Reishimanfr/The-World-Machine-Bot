import type { Button } from '../../../Types/Button'

const queue: Button = {
  name: 'queue',
  musicOptions: {},
  run: async ({ interaction, player}) => {
    await interaction.deferReply({ ephemeral: true })

    if (!player.queue.length) {
      return interaction.editReply({
        content: 'The queue is empty.'
      })
    }
    
    const embed = player.queueManager.createQueueEmbed()[0]
    const description = `${embed.data.description} ### :warning: For full list of songs use the \`/queue\` command.`
  
    await interaction.editReply({
      embeds: [embed.setDescription(description)]
    })
  }
}

export default queue
