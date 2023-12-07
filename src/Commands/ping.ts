import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import Command from '../types/Command';

const ping: Command = {
  permissions: null,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check the bot's ping and if it's online or not"),

  helpPage: new EmbedBuilder()
    .setDescription('Sends the bot\'s gateway ping\nThis command is mainly used for testing if the bot is online or not.')
    .setImage("https://cdn.discordapp.com/attachments/1169390259411369994/1175083424692850829/image.png"),

  callback: async ({ interaction, client }) => {
    interaction.reply(`🏓 Pong! My current ping is ${client.ws.ping}ms`);
  },
};

export default ping;
