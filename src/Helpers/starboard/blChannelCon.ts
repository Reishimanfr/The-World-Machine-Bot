import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { menu } from "../../Commands/starboard";
import { embedColor } from "../../Helpers/Util";
import { starboardConfig } from "../../Models";
import { confirmButtons, finalConButtons } from "./_buttons";

export default async function blChannelCon(interaction: CommandInteraction) {
  const record = await starboardConfig.findOne({ where: { guildId: interaction.guildId } })
  const blacklistedChannels = record?.getDataValue('bannedChannels').split(' ')

  const embeds = [
    new EmbedBuilder()
      .setDescription(
        blacklistedChannels.length > 0
          ? `[ The current blacklisted channels are: ${blacklistedChannels
            .map((c) => `<#${c.getDataValue("channelId")}>`)
            .join(", ")}]`
          : `[ Blacklisted channels haven't been setup yet. ]`
      )
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription(`[ Sure! The channel list will stay the same. ]`)
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription(
        `[ Select channels to be blacklisted in the menu below. ]`
      )
      .setColor(embedColor),
  ];

  const res = await interaction.editReply({
    embeds: [embeds[0]],
    components: [menu, confirmButtons],
  });

  const collector = await res.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000,
  });

  await collector.deferUpdate();
  const value = collector.customId;

  if (value == "deny") {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    });
  }

  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId("chSelect")
    .setPlaceholder("Select channels to be blacklisted")
    .setMaxValues(interaction.guild?.channels.cache.size!);

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    channelSelect
  );

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
            .join(", ")}. Confirm? ]`
        )
        .setColor(embedColor),
    ],
    components: [finalConButtons],
  });

  const finalCollected = await finalCon.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 6000,
  });

  await finalCollected.deferUpdate();
  const finalBtn = finalCollected.customId;

  if (finalBtn == "deny") {
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
            .join(", ")}. ]`
        )
        .setColor(embedColor),
    ],
    components: [menu],
  });

  await starboardConfig.update({
    bannedChannels: channels.join(' ')
  }, { where: { guildId: interaction.guildId } })
}
