import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { Model } from "sequelize";
import { menu } from "../../Commands/starboard";
import { embedColor } from "../../Helpers/Util";
import { starboardConfig } from "../../Models";
import { confirmButtons } from "./_buttons";

export default async function channelCon(
  interaction: CommandInteraction,
  record: Model<any, any>
) {
  const oldChannel = record.getDataValue("boardId");

  const embeds = [
    new EmbedBuilder()
      .setDescription(`[ The current channel ${oldChannel ? `is set to <#${oldChannel}>` : "hasn't been set up yet"}. ]`)
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription(`[ Sure! The channel will stay the same. ]`)
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription(`[ Select a new channel in the menu below. ]`)
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
    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setCustomId("chSelect")
    .setPlaceholder("Select a channel!");

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
  const channel = chCollect.values[0];

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `[ Done! The new channel has been set to <#${channel}>. ]`
        )
        .setColor(embedColor),
    ],
    components: [menu],
  });

  await starboardConfig.update(
    {
      boardId: channel,
    },
    { where: { guildId: interaction.guildId } }
  );
}
