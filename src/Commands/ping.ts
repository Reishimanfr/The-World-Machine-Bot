import { SlashCommandBuilder } from 'discord.js';
import Command from '../types/CommandI';

const ping: Command = {
  permissions: null,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check the bot's ping and if it's online or not"),

  callback: async (interaction, client) => {
    interaction.reply(`🏓 Pong! My current ping is ${client.ws.ping}ms`);
  },
};

export default ping;
