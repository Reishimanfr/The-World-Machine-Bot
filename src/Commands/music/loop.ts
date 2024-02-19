import { SlashCommandBuilder } from 'discord.js'
import type Command from '../../types/Command'

const loop: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggles looping.'),

  helpData: {
    description: 'Toggles looping.\nAvailable looping options are: `none`, `track` and `queue`\nIf the `mode` option isn\'t provided the next option in order will be selected.',
    examples: [
      `> **Toggle the current looping mode in order**\n\`\`\`/loop\`\`\``,

      `> **Change the looping mode to** \`TRACK\`
      \`\`\`/loop
      mode: TRACK\`\`\``,

      `> **Disable looping**
      \`\`\`/loop 
      mode: NONE\`\`\``
    ]
  },

  callback: async ({ interaction, player }) => {
    const loopString = {
      NONE: 'Looping disabled',
      TRACK: 'Looping this track',
      QUEUE: 'Looping the queue'
    }

    player.controller.toggleLoop()
    void player.messageManger.updatePlayerMessage()

    await interaction.reply({
      content: loopString[player.loop],
      ephemeral: true
    })
  }
}

export default loop
