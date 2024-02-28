import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'
import commandList from '../Data/CommandExport'
import { embedColor } from '../Helpers/Util'
import { Command } from '../Types/Command'
import { logger } from '../config'
import { clipString } from '../Funcs/ClipString'

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
      .setAuthor({ name: 'The world machine | Made with 💖 by Rei!', iconURL: 'https://static.wikia.nocookie.net/omniversal-battlefield/images/2/2a/The_SUn.jpg/revision/latest?cb=20190624052404' })
      .setDescription(`
A open source, multi-purpose bot with music playing features.
Commands ending with "🎵" are music commands and have special pages with additional info.
## Configuration
The bot can be configured in many different ways to your liking. To check out the available configurations see the \`/player-config\` and \`/starboard-config\` commands (Require server management permissions)
## Support
If you need help with one of the aspects of the bot feel free to **[join the support server](https://discord.gg/xBARxUqyVc)** or message me on discord directly \`(@rei.shi)\`
Alternatively you can check out the **[bot's wiki repository](https://github.com/Reishimanfr/TWM-bot)** to check for commonly asked questions and instructions on how to setup certain features.
## Updates and upcoming features
If you'd like to see what gets added to the bot be sure to check the **[update logs page](https://github.com/Reishimanfr/The-World-Machine-Bot/wiki/Update-logs)** on github
To see what features I'm working on at the moment you can check out the **[Project Board](https://github.com/users/Reishimanfr/projects/5)**
## Self-hosting
If you'd like to self-host the bot check out the **[How to self-host](https://github.com/Reishimanfr/The-World-Machine-Bot/wiki/Self%E2%80%90hosting)** page for instructions on how to do this step by step.`)
      .setColor(embedColor)

    const commandOptions: StringSelectMenuOptionBuilder[] = []

    for (const command of commandList) {
      if (command.helpData && command.helpData.description && command.data.name) {
        logger.trace(`Adding command data to /help list: ${command.data.name}, ${command.helpData?.description}`)
        const clippedDescription = clipString({ string: command.helpData.description, maxLength: 97, sliceEnd: '...'})

        commandOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`/${command.data.name}${command.musicOptions ? '🎵' : ''}`)
            .setDescription(clippedDescription)
            .setValue(command.data.name)
        )
      }
    }

    const commandsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setPlaceholder('Select a command.')
          .addOptions(commandOptions)
          .setCustomId('help-menu')
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

      if (selectedCommand.musicOptions) {
        description += `\n### Requirements:
Requires DJ role: \`${selectedCommand.musicOptions.requiresDjRole ? '✅' : '❌'}\`
Requires music to be playing: \`${selectedCommand.musicOptions.requiresPlaying ? '✅' : '❌'}\`
Requires user to be in VC: \`${selectedCommand.musicOptions.requiresVc ? '✅' : '❌'}\``
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
