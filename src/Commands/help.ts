import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'
import commandList from '../Data/CommandExport'
import { embedColor } from '../Helpers/Util'
import type Command from '../types/Command'

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
      .setAuthor({
        name: `Main page • ${interaction.guild?.name}`,
        iconURL: interaction.guild?.iconURL() ?? undefined
      })
      .setDescription('-> **[Command list](https://github.com/Reishimanfr/TWM-bot/wiki/Commands)**\n' +
        '-> You can get help on a command by selecting it from the menu below!' +
        '-> If you still need help you can check the bot\'s **[wiki page](https://github.com/Reishimanfr/TWM-bot/wiki)** or DM me `(@rei.shi)`!')

    const commandOptions: StringSelectMenuOptionBuilder[] = []

    for (const command of commandList) {
      if (command.helpData) {
        commandOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`/${command.data.name}`)
            .setDescription(command.helpData.description)
            .setValue(command.data.name)
        )
      }
    }

    const commandsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setPlaceholder('Select a command.')
          .addOptions(commandOptions)
      )

    const response = await interaction.reply({
      embeds: [mainEmbed],
      components: [commandsMenu],
      ephemeral: true
    })

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect
    })

    collector.on('collect', async (option) => {
      await option.deferUpdate()
      collector.resetTimer()

      const selectedCommand = commandList.find(cmd => cmd.data.name === option.values[0])
      const helpData = selectedCommand?.helpData

      if (!helpData) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription('[ This command doesn\'t have any help data! ]')
              .setColor(embedColor)
          ]
        })
        return
      }

      let description = `### Description:\n${helpData.description}\n### Examples:\n${helpData.examples.join('\n')}`

      if (helpData.options) {
        description += '\n### Options:'

        helpData.options.map(opt => {
          description += `\n\`${opt.name}, ${opt.required ? 'Required' : 'Optional'}\` -> ${opt.description}`
          return description
        })
      }

      const helpEmbed = new EmbedBuilder()
        .setAuthor({
          name: `/${selectedCommand.data.name} command • ${interaction.guild?.name}`,
          iconURL: interaction.guild?.iconURL() ?? undefined
        })
        .setDescription(description)
        .setImage(helpData.image ?? null)

      await interaction.editReply({ embeds: [helpEmbed] })
    })
  }
}

export default help
