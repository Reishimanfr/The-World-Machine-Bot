import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js';
import type { ExtClient } from '../Helpers/ExtendedClient';
import util from '../Helpers/Util';
import Command from '../types/Command';

// Almost every bot you could imagine has one so I couldn't be worse than them right?
// :3 :3 :3 :3 :3
const avatar: Command = {
  permissions: null,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Get a user's avatar")
    .addUserOption((user) => user.setName('user').setDescription('User to fetch').setRequired(true))
    .addBooleanOption((ephemeral) =>
      ephemeral
        .setName('secret')
        .setDescription("Should you be the only one seeing the command's reply?"),
    ),

  callback: async (interaction: ChatInputCommandInteraction, client: ExtClient) => {
    const member = interaction.options.getMember('user') as GuildMember;
    const secret = interaction.options.getBoolean('secret') ?? false;

    const embed = new EmbedBuilder()
      .setImage(member.displayAvatarURL({ size: 2048, extension: 'png' }))
      .setColor(util.embedColor);

    await interaction.reply({ embeds: [embed], ephemeral: secret });
  },
};

export default avatar;
