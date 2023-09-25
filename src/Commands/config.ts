import { SlashCommandBuilder } from 'discord.js';
import Command from '../types/CommandI';

const config: Command = {
  permissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure multiple aspects of the bot to your liking.'),

  callback: async (interaction) => {
    return interaction.reply({
      content: 'ERR: COMMAND NOT MARKED "FINISHED"',
      ephemeral: true,
    });
    // const configModules = fs
    //   .readdirSync(`${__dirname}/config`)
    //   .filter((module) => module.endsWith('.ts'));
  },
};

export default config;
