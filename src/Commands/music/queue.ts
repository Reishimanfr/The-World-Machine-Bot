import { SlashCommandBuilder } from "discord.js";
import Command from "../../types/Command";

const queue: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows the queue"),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: false,
    requiresDjRole: false
  },

  callback: async ({ interaction }) => {
    return interaction.reply({
      content: 'not implemented',
      ephemeral: true
    })

    // const queue: Track[] = player.queue;

    // if (!queue.length) {
    //   return interaction.reply({
    //     embeds: [
    //       new EmbedBuilder()
    //         .setDescription("[ The queue is empty. ]")
    //         .setColor(embedColor),
    //     ],
    //     ephemeral: true,
    //   });
    // }

    // if (embeds.length == 1) {
    //   return interaction.reply({
    //     embeds: [...embeds],
    //   });
    // }

    // const buttons: ButtonBuilder[] = [
    //   new ButtonBuilder()
    //     .setCustomId("back")
    //     .setEmoji("⏪")
    //     .setStyle(ButtonStyle.Primary),

    //   new ButtonBuilder()
    //     .setCustomId("forward")
    //     .setEmoji("⏩")
    //     .setStyle(ButtonStyle.Primary),
    // ];

    // const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
    //   buttons
    // );

    // let page = 0;

    // const res = await interaction.reply({
    //   embeds: [
    //     embeds[page].setFooter({
    //       text: `Page 1/${embeds.length}`,
    //     }),
    //   ],
    //   components: [components],
    // });

    // const collector = res.createMessageComponentCollector({
    //   componentType: ComponentType.Button,
    //   time: 60000,
    // });

    // collector.on("collect", async (button) => {
    //   await button.deferUpdate();
    //   collector.resetTimer();

    //   if (button.customId == "back") {
    //     page = page > 0 ? --page : embeds.length - 1;
    //   } else if (button.customId == "forward") {
    //     page = page + 1 < embeds.length ? ++page : 0;
    //   }

    //   interaction.editReply({
    //     embeds: [
    //       embeds[page].setFooter({
    //         text: `Page ${page + 1}/${embeds.length} `,
    //       }),
    //     ],
    //   });
    // });

    // collector.on("end", async (_) => {
    //   const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    //     buttons[0].setDisabled(true),
    //     buttons[1].setDisabled(true)
    //   );

    //   try {
    //     await interaction.editReply({ components: [newRow] });
    //   } catch (error) {
    //     logger.error(
    //       `Failed to remove buttons from player audit log message: ${error}`
    //     );
    //   }
    // });
  },
};

export default queue;
