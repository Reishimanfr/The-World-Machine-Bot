import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const confirmButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId('accept')
    .setLabel("✏️ Let's change this")
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId('deny')
    .setLabel("❌ I've changed my mind")
    .setStyle(ButtonStyle.Secondary),
);

export const finalConButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId('accept')
    .setLabel('✅ Looks good!')
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId('deny')
    .setLabel("❌ Let's go back")
    .setStyle(ButtonStyle.Secondary),
);
