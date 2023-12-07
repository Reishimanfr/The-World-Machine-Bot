import { ChatInputCommandInteraction, ComponentType, EmbedBuilder } from "discord.js";
import { embedColor } from "../../Helpers/Util";
import { roleSelectMenu } from "./_buttons";
import { playerOptionsData } from "./_playerOptionDescriptions";

export default async function handlePlayerSettings(interaction: ChatInputCommandInteraction, option: string) {
  const type: string = playerOptionsData[option].type

  if (type.startsWith('number')) {
    const subType = type?.split(' ')[1]
    const subSplit = subType?.split('-')
    let range1 = 0;
    let range2 = 0;

    if (subSplit?.length > 0) {
      range1 = parseInt(subSplit[0])
      range2 = parseInt(subSplit[1])
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ Please provide a new number value ${range1 !== 0 ? `in range **${range1}-${range2}**` : ''} for the **${option}** option. ]`)
          .setColor(embedColor)
      ],
      components: []
    })

    const newValueCollector = await interaction.channel?.awaitMessages({
      filter: (msg) => { return msg.author.id === interaction.user.id },
      max: 1,
      time: 60000
    })

    const newValue = newValueCollector?.at(0)?.content

    if (!newValue?.length) {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`[ This interaction has timed out or the new value was empty. ]`)
            .setColor(embedColor)
        ]
      })
      return
    }

    if (range1 != 0) {
      const numericValue = parseInt(newValue)

      if (isNaN(numericValue)) {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`[ The new value must be a number! ]`)
              .setColor(embedColor)
          ]
        })
        return
      }

      if (range1 > numericValue || range2 < numericValue) {
        interaction.editReply({
          embeds: [new EmbedBuilder()
            .setDescription(`[ The new value must be in range **${range1}-${range2}**! ]`)
            .setColor(embedColor)
          ]
        })
        return
      }
    }

    interaction.editReply({
      embeds: [new EmbedBuilder()
        .setDescription(`[ New value for **${option}** set to **${newValue}**! ]`)
        .setColor(embedColor)
      ]
    })

    return newValue
  } else if (type == 'role') {
    const response = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Select a new DJ role. ]')
          .setColor(embedColor)
      ],
      components: [roleSelectMenu]
    })

    const awaitRole = await response.awaitMessageComponent({
      componentType: ComponentType.RoleSelect,
      time: 60000,
    })

    if (!awaitRole.values[0]) return;

    await awaitRole.deferUpdate()
    const role = awaitRole.values[0]

    return role
  }
}