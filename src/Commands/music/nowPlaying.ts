import { EmbedBuilder, Message, SlashCommandBuilder } from "discord.js";
import { log } from "../../Helpers/Logger";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

const nowplaying: Command = {
  permissions: [],

  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Re-sends the now playing message"),

  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: true,
    requiresDjRole: false
  },

  callback: async ({ interaction, client, message, player }) => {
    if (!interaction.inCachedGuild()) return;

    if (!interaction.channel?.permissionsFor(client.user!.id)?.has('SendMessages')) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ I can\'t send messages in this channel. ]')
            .setColor(embedColor)
        ], ephemeral: true
      })
    }

    interaction.deferReply({ ephemeral: true });

    player.message?.delete()
      .catch(() => { })

    interaction.deleteReply()
      .catch(() => { })

    const nowPlayingEmbed = await message.createPlayerEmbed();
    const buttons = message.createPlayerButtons();

    let res: Message<true> | undefined; // idk the type for it lol

    try {
      res = await interaction.channel?.send({
        embeds: [nowPlayingEmbed],
        components: [buttons],
      });
    } catch (error) {
      log.error(`[nowplaying.ts]: Failed to send message: ${error}`);
    }

    if (!res) return;

    player.message = res;
  },
};

export default nowplaying;
