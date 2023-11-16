import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { starboardConfig } from "../Helpers/DatabaseSchema";
import Command from "../types/Command";
import amountCon from "./starboard/amountCon";
import blChannelCon from "./starboard/blChannelCon";
import channelCon from "./starboard/channelCon";
import emojiCon from "./starboard/emojiCon";

const funcMap = {
  emojiCon: emojiCon,
  channelCon: channelCon,
  amountCon: amountCon,
  blChannelCon: blChannelCon,
};

export const menu = new ActionRowBuilder<StringSelectMenuBuilder>()
  .addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("conSelect")
      .setPlaceholder("Select a option to configure!")
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("⭐ Emojis")
          .setDescription("Configure which emojis are accepted for the starboard.")
          .setValue("emojiCon"),

        new StringSelectMenuOptionBuilder()
          .setLabel("🧵 Channel")
          .setDescription("Set where the starboard channel should be.")
          .setValue("channelCon"),

        new StringSelectMenuOptionBuilder()
          .setLabel("🔢 Amount")
          .setDescription("Configure how many reaction are required to send a message.")
          .setValue("amountCon"),

        new StringSelectMenuOptionBuilder()
          .setLabel("❌ Blacklisted channels")
          .setDescription("Configure which channels should be ignored.")
          .setValue("blChannelCon")
      )
  )


const starboard: Command = {
  permissions: ["EmbedLinks", "SendMessages", "ViewChannel"],
  data: new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("Configure the starboard to your liking")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Make the commands vibisle only to admins

  callback: async (interaction: ChatInputCommandInteraction) => {
    const res = await interaction.reply({
      components: [menu],
      ephemeral: true,
    });

    const collector = res.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    collector.on('collect', async (collected) => {
      await collected.deferUpdate()
      collector.resetTimer()

      const option = collected.values[0]
      const [record] = await starboardConfig.findOrCreate({
        where: { guildId: interaction.guildId },
        defaults: { guildId: interaction.guildId, boardId: null, amount: 4 },
      });

      const args = [interaction, record];
      const handler = funcMap[option];

      await handler(...args);
    })
  },
};

export default starboard;
