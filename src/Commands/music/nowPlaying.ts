import { ChannelType, Message, SlashCommandBuilder } from "discord.js";
import { log } from "../../Helpers/Logger";
import Command from "../../types/Command";

const nowPlaying: Command = {
  permissions: null,
  musicOptions: {
    requiresVc: true,
    requiresPlayer: true
  },

  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Re-sends the now playing message"),

  callback: async ({ interaction, client, player }) => {
    const channel = interaction.channel

    // Typeguard
    if (!interaction.guild || !client.user || !channel) return

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: 'You have to use this command in a text channel.',
        ephemeral: true
      })
    }

    const permissions = channel.permissionsFor(client.user?.id)

    if (permissions === null) {
      return interaction.reply({
        content: 'Something went wrong while checking bot permissions.',
        ephemeral: true
      })
    }

    if (!permissions.has('SendMessages')) {
      interaction.reply({
        content: 'I can\'t send messages in this channel.',
        ephemeral: true
      })
    }

    interaction.deferReply({ ephemeral: true })

    player.message?.delete()
      .catch(() => { })

    interaction.deleteReply()
      .catch(() => { })

    const nowPlayingEmbed = await player.messageManger.createPlayerEmbed();
    const buttons = player.messageManger.createPlayerButtons();

    let res: Message<true> | undefined; // idk the type for it lol

    try {
      res = await channel.send({
        embeds: [nowPlayingEmbed],
        components: [buttons],
      });
    } catch (error) {
      log.error(`[nowplaying.ts]: Failed to send message: ${error}`);
    }

    if (!res) return;

    player.message = res;
    player.textChannel = interaction.channelId
  },
}

export default nowPlaying