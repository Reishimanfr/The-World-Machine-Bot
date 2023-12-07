import {
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder
} from 'discord.js';
import { embedColor } from '../Helpers/Util';
import Command from '../types/Command';

// Almost every bot you could imagine has one so I couldn't be worse than them right?
// :3 :3 :3 :3 :3
const avatar: Command = {
  permissions: null,
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Get a user's avatar")
    .addUserOption(user => user
      .setName('user')
      .setDescription('User to fetch')
      .setRequired(true)
    )
    .addBooleanOption(ephemeral => ephemeral
      .setName('secret')
      .setDescription("Should you be the only one seeing the command's reply?"),
    ),

  helpPage: new EmbedBuilder()
    .setDescription('Gets the avatar of a selected user.')
    .addFields(
      {
        name: 'Options',
        value: `* \`User\` -> The selected user whose avatar you want\n* \`Secret\` -> Toggles if only you should see the reply`,
      },
      {
        name: 'Returns',
        value: 'The avatar of a selected user in `PNG` or `GIF` format (depending on if the user has a animated profile picture).',
      }
    )
    .setImage('https://cdn.discordapp.com/attachments/1169390259411369994/1174770707578761276/image.png'),

  callback: async ({ interaction }) => {
    const member = interaction.options.getMember('user') as GuildMember;
    const secret = interaction.options.getBoolean('secret') ?? false;

    const embed = new EmbedBuilder()
      .setImage(member.displayAvatarURL({ size: 2048, extension: 'png' }))
      .setColor(embedColor);

    await interaction.reply({ embeds: [embed], ephemeral: secret });
  },
};

export default avatar;
