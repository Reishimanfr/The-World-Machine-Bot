import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'
import { clipString } from '../../Funcs/ClipString'
import { client } from '../..'

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
        name: 'The world machine | Made with ❤ by Rei!',
        iconURL: 'https://static.wikia.nocookie.net/omniversal-battlefield/images/2/2a/The_SUn.jpg/revision/latest?cb=20190624052404'
      })
      .setDescription(`Select a command to get help with from the menu below.
      The 🎵 emoji indicates music commands and the 💠 emoji indicates admin-only commands.
### ❓ Where to get help
      If you need help with the bot feel free to **[ask for help in the support server](https://discord.gg/xBARxUqyVc)** or dm me directly \`(@rei.shi)\`
### ✨ Support my work
      If you'd like to support me you can **[give my bot a star on github](https://github.com/Reishimanfr/The-World-Machine-Bot)** or even **[donate me a small amount of money](https://buymeacoffee.com/reishimanfr)**!
### 🚀 Wanna host your own instance?
      Check out the **[GitHub repository](https://github.com/Reishimanfr/The-World-Machine-Bot)** for steps on how to host your own instance of The World Machine.
      `.trim())

    const musicCommandsMenuOptions: StringSelectMenuOptionBuilder[] = []
    const otherCommandsMenuOptions: StringSelectMenuOptionBuilder[] = []

    for (const [_, mod] of client.commands.entries()) {
      if (!mod.helpData) continue // Ignore commands without help data

      if (mod.musicOptions) {
        musicCommandsMenuOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`${mod.data.name}`)
            .setDescription(clipString({ string: mod.data.description, maxLength: 95, sliceEnd: '...' }))
            .setEmoji('🎵')
            .setValue(mod.data.name)
        )
      } else {
        otherCommandsMenuOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(`${mod.data.name}`)
            .setDescription(clipString({ string: mod.data.description, maxLength: 95, sliceEnd: '...' }))
            .setEmoji(Number(mod.data.default_member_permissions) === 32 ? '💠' : '🔶')
            .setValue(mod.data.name)
        )
      }
    }

    const musicCommandsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setPlaceholder('🎵 Select a music command')
          .addOptions(musicCommandsMenuOptions)
          .setCustomId('music-help-menu')
      )

    const otherCommandsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setPlaceholder('🔶 Select a command')
          .addOptions(otherCommandsMenuOptions)
          .setCustomId('other-help-menu')
      )

    const response = await interaction.reply({
      embeds: [mainEmbed],
      components: [musicCommandsMenu, otherCommandsMenu],
      ephemeral: true
    })

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      idle: 180000 // 3 minutes
    })

    collector.on('collect', async (opt) => {
      await opt.deferUpdate()

      const cmd = client.commands.get(opt.values[0])
      const data = cmd?.helpData

      if (!data) return // Typeguard

      const helpEmbed = new EmbedBuilder()
        .setAuthor({
          name: `/${cmd.data.name} command • ${interaction.guild?.name}`,
          iconURL: interaction.guild?.iconURL() ?? undefined
        })
        .addFields(
          {
            name: 'Description',
            value: data.description
          }
        )

      if (data.examples) {
        helpEmbed.addFields({
          name: 'Examples',
          value: data.examples.join('\n')
        })
      }

      if (cmd.musicOptions) {
        const { requiresDjRole, requiresPlaying, requiresVc } = cmd.musicOptions

        helpEmbed.addFields({
          name: 'Music requirements',
          value: `Requires DJ role: \`${requiresDjRole ? '✅' : '❌'}\`
          Requires music to be playing: \`${requiresPlaying ? '✅' : '❌'}\`
          Requires user to be in VC: \`${requiresVc ? '✅' : '❌'}\``.trim()
        })
      }

      if (data.tags) {
        helpEmbed.addFields({
          name: 'Tags',
          value: data.tags.join(', ')
        })
      }

      await interaction.editReply({
        embeds: [helpEmbed]
      })
    })
  }
}

export default help
