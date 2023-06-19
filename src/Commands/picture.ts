import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import Command from '../Interfaces/Command';
import axios from 'axios';
import { logger } from '../Misc/logger';

export const picture: Command = {
    permissions: ['EmbedLinks', 'SendMessages'],
    data: new SlashCommandBuilder()
        .setName('picture')
        .setDescription('Get a random picture of a selected pet/animal!')
        .addStringOption(animal => animal
            .setName('animal')
            .setDescription('Animal of your choosing')
            .addChoices(
                { name: 'Bird', value: 'bird' },
                { name: 'Cat', value: 'cat' },
                { name: 'Capybara', value: 'capy' },
                { name: 'Dog', value: 'dog' },
                { name: 'Fox', value: 'fox' },
                { name: 'Kangaroo', value: 'kangaroo' },
                { name: 'Koala', value: 'koala' },
                { name: 'Panda', value: 'panda' },
                { name: 'Raccoon', value: 'raccoon' },
                { name: 'Red Panda', value: 'red_panda' }

            )
            .setRequired(true)
        )
        .addBooleanOption(secret => secret
            .setName('secret')
            .setDescription('Make the message secret?')
        ),

    run: async (command: ChatInputCommandInteraction) => {
        if (!command.inCachedGuild()) return;

        async function getImage(link: string) {
            const res = await axios.get(link);
            const data = res.data;

            return data.image || data.data.url;
        }

        const choice: string = command.options.getString('animal');
        const secret: boolean = command.options.getBoolean('secret') ?? false;
        const link: string = (choice === 'capy') ? 'https://api.capy.lol/v1/capybara?json=true' : `https://some-random-api.com/animal/${choice}`;

        const embed = new EmbedBuilder()
            .setImage(await getImage(link))
            .setColor(command.member.roles.highest.color);

        const components = [
            new ButtonBuilder()
            .setCustomId('get-another')
            .setLabel('Get another!')
            .setStyle(ButtonStyle.Secondary),
        ];

        const enabledRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(components);

        const reply = await command.reply({ embeds: [embed], components: [enabledRow], ephemeral: secret });
        const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async button => {
            if (button.customId !== 'get-another') return;

            if (button.user.id !== command.user.id) {
                button.reply({ embeds: [{ description: '❌ You can\'t use this!', color: Colors.Red }], ephemeral: true });
                return;
            }

            await button.deferUpdate();
            collector.resetTimer();

            const newEmbed = new EmbedBuilder()
                .setImage(await getImage(link))
                .setColor(command.member.roles.highest.color);

            reply.edit({ embeds: [newEmbed], components: [enabledRow] });
        });

        collector.on('end', _ => {
            const disabledRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(components[0].setDisabled(true));

            reply.edit({ components: [disabledRow] })
                .catch(error => logger.error(error.stack));
        });
    },
};