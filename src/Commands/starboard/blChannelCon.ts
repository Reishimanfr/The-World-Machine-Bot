import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import util from '../../misc/Util';
import { confirmButtons, finalConButtons } from './stUtil';
import { starboardBlacklistedChannels } from '../../types/database_definition';

export default async function blChannelCon(interaction: CommandInteraction) {
  const blacklistedChannels = await starboardBlacklistedChannels.findAll({
    where: { guildId: interaction.guildId },
  });

  const embeds = [
    new EmbedBuilder()
      .setDescription(
        blacklistedChannels.length > 0
          ? `[ The current blacklisted channels are: ${blacklistedChannels
              .map((c) => `<#${c.getDataValue('channelId')}>`)
              .join(', ')}]`
          : `[ Blacklisted channels haven't been setup yet. ]`,
      )
      .setColor(util.twmPurpleHex),

    new EmbedBuilder()
      .setDescription(`[ Sure! The channel list will stay the same. ]`)
      .setColor(util.twmPurpleHex),

    new EmbedBuilder()
      .setDescription(`[ Select channels to be blacklisted in the menu below. ]`)
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
    .setPlaceholder('Select channels to be blacklisted!')
    .setMaxValues(interaction.guild?.channels.cache.size!);

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
  const channels = chCollect.values;

  const finalCon = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `[ The new channel blacklist will be ${channels
            .map((c) => `<#${c}>`)
            .join(', ')}. Confirm? ]`,
        )
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
        .setDescription(
          `[ Done! The new channel blacklist has been set to ${channels
            .map((c) => `<#${c}>`)
            .join(', ')}. ]`,
        )
        .setColor(util.twmPurpleHex),
    ],
    components: [],
  });

  let data: { guildId: string; channelId: string }[] = [];

  for (const c of channels) {
    data.push({
      guildId: interaction.guild!.id,
      channelId: c,
    });
  }

  await starboardBlacklistedChannels.destroy({ where: { guildId: interaction.guildId } });
  await starboardBlacklistedChannels.bulkCreate(data);
}
