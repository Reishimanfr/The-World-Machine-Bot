import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'
import { logger } from '../../Helpers/Logger'

const queue: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresPlaying: true,
    requiresVc: true
  },

  helpData: {
    description: 'Shows the current queue',
    examples: ['```/queue```']
  },

  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Shows the queue'),

  callback: async ({ interaction, player }) => {
    if (!player.queue.length) {
      return interaction.reply({
        content: 'The queue is empty.',
        ephemeral: true
      })
    }

    const embeds = player.queueManager.createQueueEmbed()

    if (!embeds?.length) {
      return await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true
      })
    }

    if (embeds.length === 1) {
      return await interaction.reply({
        embeds: [...embeds],
        ephemeral: true
      })
    }

    const buttons: ButtonBuilder[] = [
      new ButtonBuilder()
        .setCustomId('back')
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('forward')
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary)
    ]

    const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buttons
    )

    let page = 0

    if (!embeds[page]) {
      return interaction.reply({
        content: 'Something went wrong while running this command!',
        ephemeral: true
      })
    }

    const res = await interaction.reply({
      embeds: [
        embeds[page].setFooter({
          text: `Page 1/${embeds.length}`
        })
      ],
      components: [components],
      ephemeral: true
    })

    const collector = res.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    })

    collector.on('collect', async (button) => {
      await button.deferUpdate()
      collector.resetTimer()

      if (button.customId === 'back') {
        page = page > 0 ? --page : embeds.length - 1
      } else if (button.customId === 'forward') {
        page = page + 1 < embeds.length ? ++page : 0
      }

      await interaction.editReply({
        embeds: [
          embeds[page].setFooter({
            text: `Page ${page + 1}/${embeds.length} `
          })
        ]
      })
    })

    collector.on('end', async () => {
      const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttons[0].setDisabled(true),
        buttons[1].setDisabled(true)
      )

      try {
        await interaction.editReply({ components: [newRow] })
      } catch (error) {
        logger.error(`Failed to remove buttons from player audit log message: ${error}`)
      }
    })
  }
}

export default queue
