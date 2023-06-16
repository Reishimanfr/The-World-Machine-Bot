import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js"
import Command from "../Interfaces/Command"
import fs from 'fs'

const paths = {
    commandData: `${__dirname}/../Assets/helpCommandDocData.json`,
    scriptData: `${__dirname}/../Assets/helpCommandScriptData.json`
}

export const help: Command = {
    permissions: [],
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help pages for commands and scripts'),

    run: async (interaction) => {

        // Get all commands data
        const comData = JSON.parse(fs.readFileSync(paths.commandData, 'utf-8'))
        const commands = Object.keys(comData)

        // Get all scritps data
        const scrData = JSON.parse(fs.readFileSync(paths.scriptData, 'utf-8'))
        const scripts = Object.keys(scrData)

        const res = new EmbedBuilder()
            .setAuthor({ name: `Helping ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                {
                    name: 'ℹ️ Basic command help',
                    value: 'To get basic help with a command just select it from the `1st` menu below!\nTo get help with a script, select it from the `2nd` menu!'
                },
                {
                    name: '⚙️ Commands',
                    value: `\`${commands.join('\` \`')}\``
                },
                {
                    name: '📜 Scripts',
                    value: `\`${scripts.join('\` \`')}\``
                },
                {
                    name: '❓ Still need help?',
                    value: 'You can add me on discord **(Rėi#0090)**, I\'m more than happy to help!'
                }
            )

        let selectRowCommandOptions = []
        let selectRowScriptOptions = []

        commands.forEach(com => {
            selectRowCommandOptions.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${com}`)
                    .setValue(`${com}-com`)
                    .setEmoji(`${comData[com].emoji ?? '🔘'}`)
                    .setDescription(`${comData[com].explanation}`)
            )
        })
        
        scripts.forEach(scr => {
            selectRowScriptOptions.push(
                new StringSelectMenuOptionBuilder() 
                    .setLabel(`${scr}`)
                    .setValue(`${scr}-scr`)
                    .setEmoji(`${scrData[scr].emoji ?? '🔘'}`)
                    .setDescription(`${scrData[scr].description}`)
            )
        })

        const selectRowCommand = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('command-select')
                        .setPlaceholder('Select a command!')
                        .addOptions(...selectRowCommandOptions)
                )

        const selectRowScript = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                        .setCustomId('script-select')
                        .setPlaceholder('Select a script!')
                        .addOptions(...selectRowScriptOptions)
                    )

        const message = await interaction.reply({ embeds: [res], components: [selectRowCommand, selectRowScript], ephemeral: true })
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect })

        collector.on('collect', async c => {
            await c.deferUpdate()

            if (c.customId == 'command-select')
            {
                const com = c.values[0].replace('-com', '')
                const data = comData[com]
                const comParam = data?.parameters ?? null

                let fields = [
                    {
                        name: "📄 Description",
                        value: `\`\`\`${data.explanation}\`\`\``
                    },
                    {
                        name: "❓ Usage",
                        value: `\`\`\`${data.usage}\`\`\``
                    },
                ]

                if (comParam) {
                    let paramString = ''

                    for (let p of Object.keys(comParam)) {
                        paramString += `\`\`\`${p}: ${comParam[p]}\`\`\``
                    }

                    fields.push(
                        {
                            name: "Parameters",
                            value: `${paramString}`
                        }
                    )
                }

                const commandHelpEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Helping with ${com}`, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(fields)

                interaction.editReply({ embeds: [commandHelpEmbed], components: [selectRowCommand, selectRowScript] })
            } else {
                const scr = c.values[0].replace('-scr', '')
                const data = scrData[scr]

                let subcomString = ''

                let fields = [
                    {
                        name: 'Explanation',
                        value: `${data.explanation}`
                    },
                    {
                        name: 'Setup',
                        value: `${data.setup}`
                    },
                ]

                if (data.subcommands) {
                    for (let i = 0; i < data.subcommands.length; i++) {
                        let curData = data.subcommands[i]
                        subcomString += `\`\`\`${curData.name}: ${curData.explanation}\`\`\``
                    }

                    fields.push(
                        {
                            name: 'Subcommands',
                            value: `${subcomString}`
                        }
                    )
                }

                const scriptEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Helping with ${scr}`, iconURL: interaction.user.displayAvatarURL() })
                    .addFields(fields)

                interaction.editReply({ embeds: [scriptEmbed], components: [selectRowCommand, selectRowScript]})
            }
        })
    },
}