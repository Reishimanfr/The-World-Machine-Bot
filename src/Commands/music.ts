import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { ExtPlayer } from "../Helpers/ExtendedClasses";
import util from "../Helpers/Util";
import PlayerEmbedManager from "../functions/MusicEmbedManager";
import Command from "../types/Command";
import Subcommand from "../types/Subcommand";
import { subcommandData, subcommandHandler } from "./music/!SubcommandHandler";
// import { config } from "../config";
import { combineConfig } from "./config/playerSettings";

const command = new SlashCommandBuilder()
  .setName("music")
  .setDescription("All commands related to the music portion of the bot")

for (const part of Object.values(subcommandData)) {
  command.addSubcommand(part);
}

const music: Command = {
  permissions: ["SendMessages", "Speak", "UseExternalEmojis", "Connect"],
  data: command,

  // implement help embed

  callback: async (interaction: ChatInputCommandInteraction, client) => {
    const player: ExtPlayer | null = client.poru.get(interaction.guildId!) as ExtPlayer ?? null;
    const member = await util.fetchMember(interaction.guild!.id, interaction.user.id);

    const handler: Subcommand = subcommandHandler[interaction.options.getSubcommand()];
    const options = handler.musicOptions;
    const overrides = await combineConfig(interaction.guild!.id)

    if (!player && options.requiresPlayer) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ Play something before using this command. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (options.requiresVc && !member.voice.channel) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setDescription(`[ You must be in a voice channel to use this. ]`)
          .setColor(util.embedColor)
        ],
        ephemeral: true
      })
    }

    if (
      player?.isConnected
      && member.voice.channel?.id !== interaction.guild?.members.me?.voice.channel?.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ You must be in the same voice channel to use this. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (options.requiresDjRole &&
      overrides.requireDjRole &&
      overrides.djRoleId.length &&
      !member.roles.cache.find(role => role.id == overrides.djRoleId)
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`[ This command requires you to have the <@&${overrides.djRoleId}> role. ]`)
            .setColor(util.embedColor)
        ],
        ephemeral: true
      })
    }

    if (
      !player?.isConnected
      && !member?.voice.channel?.joinable
      && options.requiresVc
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ I can't join this channel. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (options.requiresPlaying && !player?.isPlaying) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Nothing is playing right now. ]')
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    const builder = new PlayerEmbedManager(player);
    await handler.callback(...[interaction, player, client, builder]);
  },
};

export default music;
