import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import Command from '../Interfaces/Command';
import { reactionRoles } from '../Interfaces/Models';

export const reaction: Command = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Configure reaction roles under a message')
        .addSubcommand(subcom => subcom
            .setName('add')
            .setDescription('Add a button to a already existing message')
            .addStringOption(messageId => messageId
                .setName('message-id')
                .setDescription('Id of the message')
                .setRequired(true)
            )
            .addRoleOption(role => role
                .setName('role')
                .setDescription('Role to assign to a button')
                .setRequired(true)
            )
            .addStringOption(buttonLabel => buttonLabel
                .setName('button-label')
                .setDescription('Text that will show up on the button')
                .setRequired(true)
            )
            .addStringOption(buttonType => buttonType
                .setName('button-type')
                .setDescription('Color of the button')
                .setRequired(true)
                .addChoices(
                    { name: 'Blue', value: '1' },
                    { name: 'Gray', value: '2' },
                    { name: 'Green', value: '3' },
                    { name: 'Red', value: '4' },
                )
            )
        )
        .addSubcommand(subcom => subcom
            .setName('remove')
            .setDescription('Remove a button from a already existing message')
            .addStringOption(messageId => messageId
                .setName('message-id')
                .setDescription('Message ID')
                .setRequired(true)
            )
            .addStringOption(buttonName => buttonName
                .setName('button-label')
                .setDescription('Text on the button')
                .setRequired(true)
            )
        )
        .addSubcommand(subcom => subcom
            .setName('create')
            .setDescription('Create a reaction role message to add buttons to')
            .addStringOption(titleStr => titleStr
                .setName('title')
                .setDescription('Title of the embedded message')
                .setRequired(true)
            )
            .addStringOption(description => description
                .setName('description')
                .setDescription('Description of the embedded message')
            )
        ),

    run: async (command: ChatInputCommandInteraction, client) => {
        const { options } = command;

        const messageId = options.getString('message-id');
        const role = options.getRole('role');
        const label = options.getString('button-label');
        const buttonType = options.getString('button-type');
        const embedTitle = options.getString('title');
        const embedDescription = options.getString('description');
        const subCommand = options.getSubcommand();

        if (subCommand === 'create') {
            const embed = new EmbedBuilder()
                .setTitle(embedTitle);

            embedDescription ? embed.setDescription(embedDescription) : null;

            const message = await command.channel.send({ embeds: [embed] });

            const commandResEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Success!' })
                .setDescription(`The message's id is: \`${message.id}\`\nYou will need it to add or remove buttons from the message`)
                .setColor(Colors.Green);

            return command.reply({ ephemeral: true, embeds: [commandResEmbed] });
        }

        if (subCommand === 'add') {
            if (role.position > command.guild.members.me.roles.highest.position) {
                command.reply({ content: '❌ I can\'t do anything with this role because it\'s higher up than mine!', ephemeral: true });
                return;
            }

            const message = await command.channel.messages.fetch(messageId);

            if (!message) {
                command.reply({ content: '❌ I can\'t find a message with this ID! Make sure you\'re in the channel where the messages is supposed to be', ephemeral: true });
                return;
            }

            if (message.author.id !== client.user.id) {
                command.reply({ content: '❌ I can\'t add buttons to messages that aren\'t my own!', ephemeral: true });
                return;
            }

            const buttons = await reactionRoles.findAll({ where: { guildId: command.guildId, messageId: messageId } });

            if (buttons.length >= 5) {
                command.reply({ content: '❌ You can\'t add more than 5 buttons to one message! (Discord limitation :pensive:)', ephemeral: true });
                return;
            }

            const buttonArray = [];
            const buttonIds = buttons.map(obj => `${obj.dataValues.label}^^${obj.dataValues.roleId}^^${obj.dataValues.buttonType}^^-REACTROLE`);
            const newButton = `${label}^^${role.id}^^${buttonType}^^-REACTROLE`;

            if (buttonIds.includes(newButton)) {
                return command.reply({ ephemeral: true, content: '❌ A button with this role already exists on this message!' });
            }

            buttonIds.push(newButton);

            reactionRoles.create({
                guildId: command.guildId,
                roleId: role.id,
                messageId: messageId,
                label: label,
                buttonType: buttonType, // Used to reconstruct buttons when a new one is added
            });

            for (const button of buttonIds) {
                // Split the button id into 3 parts (2 are used here)
                // 0 => label
                // 1 => role Id
                // 2 => button type
                const keys = button.split('^^').slice(0, -1);
                const buttonLabel = keys[0];
                const buttonTypeCur = parseInt(keys[2]);

                buttonArray.push(
                    new ButtonBuilder()
                        .setCustomId(button)
                        .setLabel(buttonLabel)
                        .setStyle(buttonTypeCur)
                );
            }

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(buttonArray);

            await message.edit({ components: [row] });

            command.reply({ content: '✅ Button created!', ephemeral: true });
            return;
        }

        if (subCommand === 'remove') {

            const message = await command.channel.messages.fetch(messageId);

            if (!message) {
                return command.reply({ ephemeral: true, content: '❌ I can\'t find a message with this ID! Are you sure it\'s correct and you\'re in the channel where the message is?' });
            }

            const button = await reactionRoles.findOne({ where: { guildId: command.guildId, messageId: messageId, label: label } });

            if (!button) {
                return command.reply({ ephemeral: true, content: '❌ Can\'t find a button with this label on this message!' });
            }

            await reactionRoles.destroy({
                where: {
                    guildId: command.guildId,
                    label: label,
                    messageId: messageId,
                },
            });

            const buttons = await reactionRoles.findAll({ where: { guildId: command.guildId, messageId: messageId } });
            const buttonIds = buttons.map(obj => `${obj.dataValues.label}^^${obj.dataValues.roleId}^^${obj.dataValues.buttonType}^^-REACTROLE`);

            const buttonArray = [];

            for (const button of buttonIds) {
                // Split the button id into 3 parts (2 are used here)
                // 0 => label
                // 1 => role Id
                // 2 => button type
                const keys = button.split('^^').slice(0, -1);
                const buttonLabel = keys[0];
                const buttonTypeCur = parseInt(keys[2]);

                buttonArray.push(
                    new ButtonBuilder()
                        .setCustomId(button)
                        .setLabel(buttonLabel)
                        .setStyle(buttonTypeCur)
                );
            }

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonArray);

            await message.edit({ components: [row] });

            return command.reply({ content: '✅ Button removed!', ephemeral: true });
        }
    },
};