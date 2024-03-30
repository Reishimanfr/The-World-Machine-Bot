import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, type GuildMember } from 'discord.js'
import { embedColor } from '../Helpers/Util'
import { Command } from '../Types/Command'

const avatar: Command = {
  permissions: {
    user: ['SendMessages', 'AttachFiles'],
    bot: ['SendMessages', 'AttachFiles']
  },

  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(user => user
      .setName('user')
      .setDescription('User to fetch')
      .setRequired(true)
    )
    .addBooleanOption(ephemeral => ephemeral
      .setName('secret')
      .setDescription('Should you be the only one seeing the command\'s reply?')
    ),

  helpData: {
    description: 'Gets the avatar of a selected user.',
    examples: [
      `> **Get the avatar of a server member**
      \`\`\`/avatar
      user: @rei.shi\`\`\``,

      `> **Get the avatar of a server member and make the reply hidden**
      \`\`\`/avatar
      user: @rei.shi
      secret: true\`\`\``
    ]
  },

  callback: async ({ interaction }) => {
    const member = interaction.options.getMember('user') as GuildMember
    const secret = interaction.options.getBoolean('secret') ?? false

    const searchImageButton = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(`https://lens.google.com/uploadbyurl?url=${member.displayAvatarURL({ size: 2048, extension: 'png' })}`)
          .setLabel('Reverse search image')
      )

    const embed = new EmbedBuilder()
      .setImage(member.displayAvatarURL({ size: 2048, extension: 'png' }))
      .setColor(embedColor)

    await interaction.reply({ embeds: [embed], components: [searchImageButton], ephemeral: secret })
  }
}

export default avatar
