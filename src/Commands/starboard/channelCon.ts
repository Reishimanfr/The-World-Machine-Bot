import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import { Model } from 'sequelize';
import util from '../../misc/Util';
import { confirmButtons, finalConButtons } from './stUtil';
import { starboardConfig } from '../../types/database_definition';

export default async function channelCon(interaction: CommandInteraction, record: Model<any, any>) {
  const oldChannel = record.getDataValue('boardId');

  const embeds = [
    new EmbedBuilder()
      .setDescription(
        `[ The current channel ${
          oldChannel ? `is set to <#${oldChannel}>` : "hasn't been set up yet"
        }. ]`,
      )
      .setColor(util.twmPurpleHex),

    new EmbedBuilder()
      .setDescription(`[ Sure! The channel will stay the same. ]`)
      .setColor(util.twmPurpleHex),

    new EmbedBuilder()
      .setDescription(`[ Select a new channel in the menu below. ]`)
      .setColor(util.twmPurpleHex),
  ];

  const res = await interaction.editReply({
    embeds: [embeds[0]],
    components: [confirmButtons],
  });

  const collector = await res.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000,
  });

  await collector.deferUpdate();
  const value = collector.customId;

  if (value == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    });
  }

  const channelSelect = new ChannelSelectMenuBuilder()
    .setChannelTypes(ChannelType.GuildText)
    .setCustomId('chSelect')
    .setPlaceholder('Select a channel!');

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect);

  const chSelectRes = await interaction.editReply({
    embeds: [embeds[2]],
    components: [row],
  });

  const chCollect = await chSelectRes.awaitMessageComponent({
    componentType: ComponentType.ChannelSelect,
    time: 60000,
  });

  await chCollect.deferUpdate();
  const channel = chCollect.values[0];

  const finalCon = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ The new channel will be set to <#${channel}>. Confirm? ]`)
        .setColor(util.twmPurpleHex),
    ],
    components: [finalConButtons],
  });

  const finalCollected = await finalCon.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 6000,
  });

  await finalCollected.deferUpdate();
  const finalBtn = finalCollected.customId;

  if (finalBtn == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    });
  }

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ Done! The new channel has been set to <#${channel}>. ]`)
        .setColor(util.twmPurpleHex),
    ],
    components: [],
  });

  await starboardConfig.update(
    {
      boardId: channel,
    },
    { where: { guildId: interaction.guildId } },
  );
}
