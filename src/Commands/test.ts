import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../Interfaces/Command";

export const test : Command = {
    permissions: ['SendMessages'],

    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('test command'),

    run: async (command) => {
        const embeds = {
            chooseConfigOption: {
                embeds: [
                new EmbedBuilder()
                .setAuthor({ name: 'What would you like to do?', iconURL: command.guild.iconURL() })
            ]}
        }

        command.reply(embeds['chooseConfigOption'])
    }
}