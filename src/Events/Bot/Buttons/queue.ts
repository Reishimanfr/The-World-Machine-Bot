import type { Button } from '../../../Types/Button'

const queue: Button = {
  name: 'queue',
  musicOptions: {},
  run: async ({ interaction, player}) => {
    if (!player.queue.length) {
      return interaction.reply({
        content: 'The queue is empty.',
        ephemeral: true
      })
    }
    
    const embed = player.queueManager.createQueueEmbed()[0]
    const description = `${embed.data.description}\n:warning: For full list of songs use the \`/queue\` command.`
  
    await interaction.reply({
      embeds: [embed.setDescription(description)],
      ephemeral: true
    })
  }
}

export default queue
