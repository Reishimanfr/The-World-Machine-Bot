import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { playerOverrides } from "../../Helpers/DatabaseSchema";
import { config as defaultConfig, PlayerSettings } from "../../config";
import { playerOptionsData } from "./_playerOptionDescriptions";
import handlePlayerSettings from "./_handlePlayerSettings";

/**
 * This function combines the default config with the overrides a user may have added.
 * Example: if a setting has been overridden the property for it's key will be the overridden
 * one, if it wasn't it will be set to the default value.
 */
export async function combineConfig(guildId: string): Promise<PlayerSettings> {
  const [record] = await playerOverrides.findOrCreate({
    where: { guildId: guildId },
    defaults: defaultConfig.player
  })

  if (!record) return defaultConfig.player

  const data = record.dataValues
  // We don't need these properties
  delete data.id
  delete data.guildId

  for (const [key, value] of Object.entries(data)) {
    data[key] = value ?? defaultConfig.player
  }

  return data
}

function buildMenu(config: PlayerSettings): ActionRowBuilder<StringSelectMenuBuilder> {
  const menu: StringSelectMenuOptionBuilder[] = [];

  for (const [key] of Object.entries(config)) {
    const currentOption = playerOptionsData[key]
    let emoji = '⚙️'

    if (currentOption.type == 'boolean') {
      emoji = config[key] ? '✅' : '❌'
    }

    const option = new StringSelectMenuOptionBuilder()
      .setLabel(currentOption.name ?? 'Missing name definition')
      .setDescription(currentOption.description ?? 'Missing description')
      .setValue(key)
      .setEmoji(emoji)

    menu.push(option)
  }

  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
      new StringSelectMenuBuilder()
        .setOptions(menu)
        .setMaxValues(1)
        .setPlaceholder('Select a option to configure!')
        .setCustomId('test')
    )
}

export default async function playerSettings(interaction: ChatInputCommandInteraction) {
  const playerConfig = await combineConfig(interaction.guild!.id)
  const optionMenu = buildMenu(playerConfig)
  // Used to append messages to the end of the base content
  const baseContent = `:white_check_mark: -> This option is enabled. Clicking will disable it.
:x: -> This options is disabled. Clicking will enable it.
:gear: -> This option requires additional info to be configured.`

  const optionSelectMenu = await interaction.editReply({
    content: baseContent,
    components: [optionMenu],
  })

  const collector = optionSelectMenu.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    idle: 30000
  })

  collector.on('collect', async (collected) => {
    await collected.deferUpdate()
    collector.resetTimer()

    const updatePlayerConfig = await combineConfig(interaction.guild!.id)
    const option = collected.values[0]
    const type = playerOptionsData[option].type
    let updated = {}
    let content = baseContent

    if (type == 'boolean') {
      updated[option] = !updatePlayerConfig[option]
      content = baseContent + `\n\n**${option}** toggled -> ${!updatePlayerConfig[option] ? '✅' : '❌'}!`
    } else {
      updated[option] = await handlePlayerSettings(interaction, option)
    }

    await playerOverrides.update(updated, { where: { guildId: interaction.guild!.id } })
    const lastUpdateCon = await combineConfig(interaction.guild!.id)

    await interaction.editReply({
      content: content,
      components: [buildMenu(lastUpdateCon)],
      embeds: []
    })
  })
}