import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { starboardBlacklistedChannels } from "../../Data/DatabaseSchema";
import { embedColor } from "../../Helpers/Util";
import { menu } from "../../commands/starboard";
import { confirmButtons, finalConButtons } from "./_buttons";

export default async function blChannelCon(interaction: CommandInteraction) {
  const blacklistedChannels = await starboardBlacklistedChannels.findAll({
    where: { guildId: interaction.guildId },
  });

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
    .setChannelTypes(ChannelType.GuildText)
    .setCustomId("chSelect")
    .setPlaceholder("Select channels to be blacklisted!")
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

  let data: { guildId: string; channelId: string }[] = [];

  for (const c of channels) {
    data.push({
      guildId: interaction.guild!.id,
      channelId: c,
    });
  }

  await starboardBlacklistedChannels.destroy({
    where: { guildId: interaction.guildId },
  });
  await starboardBlacklistedChannels.bulkCreate(data);
}
