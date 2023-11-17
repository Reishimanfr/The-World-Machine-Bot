import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import Command from "../types/Command";
import util from "../Helpers/Util";
import commandList from "../Helpers/CommandExport";

const help: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows help menus for selected features/commands.'),

  callback: async (interaction) => {
    const mainEmbed = new EmbedBuilder()
      .setAuthor({ name: `Main page • ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL()! })
      .setDescription(`Welcome to the help menu.
To get help with a command select something from the \`1st\` menu that says \`Select a command.\`
To get help with a feature (like the starboard or music player) use the 2nd menu labeled \`Select a feature.\`
If you still need help with something don't hesitate to DM me \`(@rei.shi)\` or to [check out the bot's wiki page](https://github.com/Reishimanfr/TWM-bot/wiki) on github`)
      .setColor(util.embedColor);

    let commandOptions: StringSelectMenuOptionBuilder[] = [];

    for (let i = 0; i < commandList.length; i++) {
      const part = commandList[i]

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
        })
          .setColor(util.embedColor)

        interaction.editReply({
          embeds: [command!.helpPage!]
        })
      }
    })
  }
}

export default help