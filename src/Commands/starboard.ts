import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from "discord.js";
import amountCon from "../Helpers/starboard/amountCon";
import blChannelCon from "../Helpers/starboard/blChannelCon";
import channelCon from "../Helpers/starboard/channelCon";
import emojiCon from "../Helpers/starboard/emojiCon";
import { starboardConfig } from "../Models";
import Command from "../types/Command";

const funcMap = {
  emojiCon,
  channelCon,
  amountCon,
  blChannelCon,
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


export default <Command>{
  permissions: ["EmbedLinks", "SendMessages", "ViewChannel"],
  data: new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("Configure the starboard to your liking")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Make the commands visible only to admins

  helpPage: new EmbedBuilder()
    .setDescription(`Configure the starboard feature.
Running this command will show you a menu of possible configuration options for the starboard like how many reactions are required or what emojis are accepted.
## Note
Everything noteworthy about the starboard feature was described in the starboard feature page.`)
    .setImage('https://cdn.discordapp.com/attachments/1169390259411369994/1175086512958873600/Discord_bx7OlzKNHT.png'),

  callback: async ({ interaction }) => {
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
}