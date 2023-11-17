import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import Command from "../types/Command";
import errorLogs from "./config/errorLogs";
import util from "../Helpers/Util";
import updateLogs from "./config/updateLogs";
import playerSettings from "./config/playerSettings";

type configType = {
  name: string,
  description: string,
  function: (interaction: ChatInputCommandInteraction) => Promise<any>,
  icon: string,
  id: string,
}

const config: Command = {
  permissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure certain aspects of the bot!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  helpPage: new EmbedBuilder()
    .setDescription(`Allows you to configure multiple aspects of the bot.
Currently you can configure these options:
* \`Error logs channel\` -> Sets where the bot should send error warnings to.
* \`Update channel\` -> Sets where the bot should send new updates (like bugfixes)

You can also configure a lot of option for the \`music player\`.
There are way too many options there to list them all here, so just go run the command and change what you want!
## Note
Options starting with ✅ or ❌ are \`toggles\` which means you just have to click on them to toggle them on or off.
Options that start with :cog: on the other hand require additional input to be configured.`)
    .setImage('https://cdn.discordapp.com/attachments/1169390259411369994/1174779866240004116/configcommand.png'),

  callback: async (interaction: ChatInputCommandInteraction) => {
    const config: configType[] = [
      {
        name: 'Error logs',
        description: 'Configures which channel should the bot send error messages to.',
        function: errorLogs,
        icon: '⚠️',
        id: 'error_logs'
      },
      {
        name: 'Update logs',
        description: 'Configures where the bot should send new update messages.',
        function: updateLogs,
        icon: '📰',
        id: 'update_logs'
      },
      {
        name: 'Music player settings',
        description: 'Configures the music player settings to your liking.',
        function: playerSettings,
        icon: '🎶',
        id: 'player_settings'
      }
    ]

    let menuParts: StringSelectMenuOptionBuilder[] = []

    for (let i = 0; i < config.length; i++) {
      const configPart = config[i]

      menuParts.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(configPart.name)
          .setDescription(configPart.description)
          .setEmoji(configPart.icon)
          .setValue(configPart.id)
      )
    }

    const optionSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(new StringSelectMenuBuilder()
        .setCustomId('optionSelect')
        .setMaxValues(1)
        .setPlaceholder('Select a option to configure!')
        .addOptions(menuParts))

    const initialResponse = await interaction.reply({
      components: [optionSelectRow],
      ephemeral: true
    })

    const initialOption = await initialResponse.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60000
    })

    await initialOption.deferUpdate()
    if (!initialOption) return

    const option = initialOption.values[0]
    const handler = config.find(part => part.id == option)?.function

    if (!handler) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setDescription('[ Something went wrong while processing this command. ]')
          .setColor(util.embedColor)
        ],
        components: []
      })
    }

    const status = await handler(interaction)

    if (status == 0) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setDescription('[ This interaction has timed out. ]')
          .setColor(util.embedColor)
        ]
      })
    }
  }
}

export default config