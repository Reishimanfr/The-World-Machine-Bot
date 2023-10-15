import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ExtPlayer } from '../Helpers/ExtendedClient';
import util from '../Helpers/Util';
import PlayerEmbedManager from '../functions/playerEmbedManager';
import Command from '../types/Command';
import Subcommand from '../types/Subcommand';
import { subcommandData, subcommandHandler } from './subcommands/music/!SubcommandHandler';

const command = new SlashCommandBuilder()
  .setName('music')
  .setDescription('All commands related to the music portion of the bot');

for (const part of Object.values(subcommandData)) {
  command.addSubcommand(part);
}

const music: Command = {
  permissions: ['SendMessages', 'Speak', 'UseExternalEmojis', 'Connect'],
  data: command,

  callback: async (interaction: ChatInputCommandInteraction, client) => {
    const subcommand = interaction.options.getSubcommand();
    const player = client.poru.get(interaction.guildId!) as ExtPlayer;
    const member = await util.fetchMember(interaction.guild!.id, interaction.user.id);

    const reqCommand: Subcommand = subcommandHandler[subcommand];
    const options = reqCommand.musicOptions;

    if (options.requiresPlayer && !player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ The music player isn't active. Play something to activate it. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (options.requiresPlaying && !player.isPlaying) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ The player isn't playing right now. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (options.requiresVc && !member.voice.channel?.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in a voice channel to use this. ]')
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    } else if (
      options.requiresVc &&
      player &&
      member.voice.channel?.id !== interaction.guild?.members.me?.voice.channel?.id
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in the same voice channel to use this. ]')
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    if (options.requiresVc && !member?.voice.channel?.joinable) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ I can't join this channel. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    const builder = new PlayerEmbedManager(player);

    await reqCommand.callback(...[interaction, player, client, builder]);
  },
};

export default music;
