import { ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType } from "discord.js"

const quickComponent = {
  button: (
    label: string,
    customId: string,
    emoji?: string,
    style = ButtonStyle.Primary,
  ) => {
    const button = new ButtonBuilder()
      .setCustomId(customId)
      .setStyle(style)
      .setLabel(label)

    if (emoji) {
      button.setEmoji(emoji)
    }

    return button
  },

  menu: {
    channel: (
      types: ChannelType[],
      customId: string,
      placeholder: string,
      min?: number,
      max?: number,
    ) => {
      const menu = new ChannelSelectMenuBuilder()
        .addChannelTypes(types)
        .setCustomId(customId)
        .setPlaceholder(placeholder.length ? placeholder : 'Make a selection')

      min && menu.setMinValues(min)
      max && menu.setMaxValues(max)

      return menu
    }
  }
}

export default quickComponent