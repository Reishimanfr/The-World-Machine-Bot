import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder } from "discord.js";

export const changeSettingButtons = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(
    new ButtonBuilder()
      .setLabel('Let\'s change this!')
      .setEmoji('✏️')
      .setCustomId('change')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setLabel('Looks good!')
      .setEmoji('✅')
      .setCustomId('keep')
      .setStyle(ButtonStyle.Secondary),
  )

export const channelSelectMenu = new ActionRowBuilder<ChannelSelectMenuBuilder>()
  .addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId('channelSelect')
      .setMaxValues(1)
      .setPlaceholder('Select a channel!')
      .setChannelTypes(ChannelType.GuildText)
  )

export const roleSelectMenu = new ActionRowBuilder<RoleSelectMenuBuilder>()
  .addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId('roles')
      .setMaxValues(1)
  )