import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../Types/Command'

const ping: Command = {
  permissions: {
    user: ['SendMessages'],
    bot: ['SendMessages']
  },

  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s ping and if it\'s online or not'),

  helpData: {
    description: 'Sends the bot\'s gateway ping\nThis command is mainly used for testing if the bot is online or not.',
    examples: ['```/ping```']
  },

  callback: async ({ interaction, client }) => {
    await interaction.reply(`🏓 Pong! My delay estimate is \`${client.ws.ping}ms\`.`)
  }
}

export default ping
