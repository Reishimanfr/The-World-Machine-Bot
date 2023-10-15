import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { starboardConfig } from '../Helpers/DatabaseSchema';
import Command from '../types/Command';
import amountCon from './subcommands/starboard/amountCon';
import blChannelCon from './subcommands/starboard/blChannelCon';
import channelCon from './subcommands/starboard/channelCon';
import emojiCon from './subcommands/starboard/emojiCon';

const funcMap = {
  emojiCon: emojiCon,
  channelCon: channelCon,
  amountCon: amountCon,
  blChannelCon: blChannelCon,
};

const starboard: Command = {
  permissions: ['EmbedLinks', 'SendMessages', 'ViewChannel'],
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Configure the starboard to your liking')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Make the commands vibisle only to admins

  callback: async (interaction: ChatInputCommandInteraction) => {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('conSelect')
      .setPlaceholder('Select a option to configure!')
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('⭐ Emojis')
          .setDescription('Configure which emojis are accepted by the starboard')
          .setValue('emojiCon'),

        new StringSelectMenuOptionBuilder()
          .setLabel('🧵 Channel')
          .setDescription('Set in which channel the starboard should be located')
          .setValue('channelCon'),

        new StringSelectMenuOptionBuilder()
          .setLabel('🔢 Amount')
          .setDescription('Configure how many accepted reaction are required')
          .setValue('amountCon'),

        new StringSelectMenuOptionBuilder()
          .setLabel('❌ Blacklisted channels')
          .setDescription('Configure which channels should be ignored by the bot')
          .setValue('blChannelCon'),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const res = await interaction.reply({
      components: [row],
      ephemeral: true,
    });

    const collected = await res.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    await collected.deferUpdate();
    const option = collected.values[0];

    const [record] = await starboardConfig.findOrCreate({
      where: { guildId: interaction.guildId },
      defaults: { guildId: interaction.guildId, boardId: null, amount: 4 },
    });

    const args = [interaction, record];
    const handler = funcMap[option];

    await handler(...args);
  },
};

export default starboard;
