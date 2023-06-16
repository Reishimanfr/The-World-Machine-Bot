import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, EmbedBuilder, Colors } from "discord.js"
import Command from "../Interfaces/Command"
import { reactionRoles } from "../Interfaces/Models"

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
        const { options } = command

        const messageId = options.getString('message-id')
        const role = options.getRole('role')
        const label = options.getString('button-label')
        const buttonType = options.getString('button-type')
        const embedTitle = options.getString('title')
        const embedDescription = options.getString('description')
        const subCommand = options.getSubcommand()

        if (subCommand === 'create') {
            const embed = new EmbedBuilder()
                .setTitle(embedTitle)

            embedDescription ? embed.setDescription(embedDescription) : null

            const message = await command.channel.send({ embeds: [embed] })

            const commandResEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Success!' })
                .setDescription(`The message's id is: \`${message.id}\`\nYou will need it to add or remove buttons from the message`)
                .setColor(Colors.Green)

            return command.reply({ ephemeral: true, embeds: [commandResEmbed] })
        }

        if (subCommand === 'add') {

            const replies = {
                roleTooHigh: {
                    ephemeral: true,
                    content: '❌ I can\'t do anything with this role because it\'s higher up than mine!'
                },
                msgNotFound: {
                    ephemeral: true,
                    content: '❌ I can\'t find a message with this ID! Are you sure it\'s correct and you\'re in the channel where the message is?'
                },
                msgNotEditable: {
                    ephemeral: true,
                    content: '❌ I can\'t add buttons to messages that aren\'t my own!'
                },
                tooManyButtons: {
                    ephemeral: true,
                    content: '❌ You can\'t add more than 5 buttons to one message! (Discord limitation :pensive:)'
                },
                labelExists: {
                    ephemeral: true,
                    content: '❌ A button with this label already exists on this message!'
                }
            }

            if (role.position > command.guild.members.me.roles.highest.position) return command.reply(replies['roleTooHigh'])

            const message = await command.channel.messages.fetch(messageId)

            if (!message) return command.reply(replies['msgNotFound'])

            if (message.author.id !== client.user.id) return command.reply(replies['msgNotEditable'])

            const buttons = await reactionRoles.findAll({ where: { guildId: command.guildId, messageId: messageId }})

            if (buttons.length >= 5) return command.reply(replies['tooManyButtons'])
            

            const buttonLabels = buttons.map(obj => obj.dataValues.label)

            if (buttonLabels.includes(label)) {
                return command.reply(replies['labelExists'])
            }

            const buttonArray = []
            const buttonIds = buttons.map(obj => `${obj.dataValues.label}^^${obj.dataValues.roleId}^^${obj.dataValues.buttonType}^^-REACTROLE`)
            const newButton = `${label}^^${role.id}^^${buttonType}^^-REACTROLE`

            if (buttonIds.includes(newButton)) {
                return command.reply({ ephemeral: true, content: '❌ A button with this role already exists on this message!'})
            }

            buttonIds.push(newButton)
            
            reactionRoles.create({ 
                guildId: command.guildId,
                roleId: role.id,
                messageId: messageId,
                label: label,
                buttonType: buttonType
            })

            for (const key of buttonIds) {
                const _key = key.split('^^').slice(0, -1)
                const label = _key[0]
                const buttonType = parseInt(_key[2])

                buttonArray.push(
                    new ButtonBuilder()
                        .setCustomId(key)
                        .setLabel(label)
                        .setStyle(buttonType)
                )
            }

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonArray)

            await message.edit({ components: [row] })

            return command.reply({ content: '✅ Button created!', ephemeral: true })
        }

        if (subCommand === 'remove') {

            const message = await command.channel.messages.fetch(messageId)

            if (!message) {
                return command.reply({ ephemeral: true, content: '❌ I can\'t find a message with this ID! Are you sure it\'s correct and you\'re in the channel where the message is?'})
            }

            const button = await reactionRoles.findOne({ where: { guildId: command.guildId, messageId: messageId, label: label }})

            if (!button) {
                return command.reply({ ephemeral: true, content: '❌ Can\'t find a button with this label on this message!'})
            }

            await reactionRoles.destroy({
                where: {
                    guildId: command.guildId,
                    label: label,
                    messageId: messageId
                }
            })


            let buttons = await reactionRoles.findAll({ where: { guildId: command.guildId, messageId: messageId }})
            let buttonIds = buttons.map(obj => `${obj.dataValues.label}^^${obj.dataValues.roleId}^^${obj.dataValues.buttonType}^^-REACTROLE`)

            let buttonArray = []

            for (const key of buttonIds) {
                const _key = key.split('^^').slice(0, -1)
                const label = _key[0]
                const buttonType = parseInt(_key[2])

                buttonArray.push(
                    new ButtonBuilder()
                        .setCustomId(key)
                        .setLabel(label)
                        .setStyle(buttonType)
                )
            }

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonArray)

            await message.edit({ components: [row] })

            return command.reply({ content: '✅ Button removed!', ephemeral: true })
        }
    }
}