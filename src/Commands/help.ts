import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import commandList from "../Data/CommandExport";
import { embedColor } from "../Helpers/Util";
import { starboardHelpPages } from "../Helpers/starboard/helpPages";
import Command from "../types/Command";

const featurePages = {
  starboard: starboardHelpPages
}

const help: Command = {
  permissions: {
    user: [],
    bot: ['SendMessages', 'AttachFiles']
  },

  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows help menus for selected features/commands.'),

  callback: async ({ interaction }) => {
    const mainEmbed = new EmbedBuilder()
      .setAuthor({ name: `Main page • ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? undefined })
      .setDescription(`Welcome to the help menu.
You can view the list of commands **[here](https://github.com/Reishimanfr/TWM-bot/wiki/Commands)**

To get help with a command select something from the \`1st\` menu that says \`Select a command.\`
To get help with a feature (like the starboard or music player) use the 2nd menu labeled \`Select a feature.\`

If you still need help with something don't hesitate to DM me \`(@rei.shi)\` or to **[check out the bot's wiki page](https://github.com/Reishimanfr/TWM-bot/wiki)** on github`)
      .setColor(embedColor);

    const commandOptions: StringSelectMenuOptionBuilder[] = [];

    for (const part of commandList) {
      if (part.helpPage) {
        commandOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`/${part.data.name}`)
            .setDescription(part.data.description)
            .setValue(part.data.name)
        )
      }
    }

    const featureOptions = [
      new StringSelectMenuOptionBuilder()
        .setLabel('🌟 Starboard')
        .setDescription('See how to configure and use the starboard.')
        .setValue('starboard')
    ]

    const commandMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setPlaceholder('Select a command.')
          .addOptions(commandOptions)
          .setCustomId('commandSelect')
      )

    const featureMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setPlaceholder('Select a feature.')
        .addOptions(featureOptions)
        .setCustomId('featureSelect')
    )

    const response = await interaction.reply({
      embeds: [mainEmbed],
      components: [commandMenu, featureMenu],
      ephemeral: true
    })

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    })

    collector.on('collect', async (option) => {
      await option.deferUpdate()
      collector.resetTimer()

      if (option.customId == 'commandSelect') {
        const command = commandList.find(emb => emb.data.name == option.values[0])

        command?.helpPage?.setAuthor({
          name: `/${command.data.name} command • ${interaction.guild?.name}`,
          iconURL: interaction.guild?.iconURL() ?? ''
        }).setColor(embedColor)

        interaction.editReply({
          embeds: [command!.helpPage!]
        })
      } else if (option.customId === 'featureSelect') {
        const embeds = featurePages['starboard']

        if (embeds.length <= 1) {
          await interaction.editReply({
            embeds: [embeds[0]]
          })
          return
        }

        const buttons = [
          new ButtonBuilder()
            .setCustomId('previous')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary),
        ]

        const pagesRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(buttons)

        let page = 0;

        const response = await interaction.editReply({
          embeds: [embeds[page]
            .setAuthor({
              name: option.component.options.at(0)?.label! + ' help menu',
              iconURL: interaction.guild?.iconURL() ?? undefined
            })
            .setFooter({ text: `Page 1/${embeds.length}` })
          ],
          components: [pagesRow]
        })

        const collector = response.createMessageComponentCollector({
          componentType: ComponentType.Button,
        })

        collector.on('collect', async (collected) => {
          await collected.deferUpdate()
          collector.resetTimer()

          collected.customId === 'next' ? page++ : page--

          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              buttons[0].setDisabled(page === 0),
              buttons[1].setDisabled(page === embeds.length - 1)
            )

          interaction.editReply({
            embeds: [embeds[page].setFooter({ text: `Page ${page + 1}/${embeds.length}` })],
            components: [row]
          })
        })
      }
    })
  }
}

export default help