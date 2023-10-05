import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js';
import Command from '../types/CommandI';
import util from '../misc/Util';
import { client } from '..';

// Almost every bot you could imagine has one so I couldn't be worse than them right?
// :3 :3 :3 :3 :3
const avatar: Command = {
  permissions: null,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Get a user's avatar")
    .addUserOption((user) => user.setName('user').setDescription('User to fetch').setRequired(true))
    .addBooleanOption((ephemeral) =>
      ephemeral.setName('secret').setDescription("Should you be the only one seeing the command's reply?"),
    ),

  callback: async (interaction: ChatInputCommandInteraction) => {
    const member = interaction.options.getMember('user') as GuildMember;
    const secret = interaction.options.getBoolean('secret') ?? false;

    const embed = new EmbedBuilder()
      .setImage(member.displayAvatarURL({ size: 2048, extension: 'png' }))
      .setColor(util.twmPurpleHex);

    await interaction.reply({ embeds: [embed], ephemeral: secret });
  },
};

export default avatar;
