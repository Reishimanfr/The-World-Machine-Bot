import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, type GuildMember } from 'discord.js'
import { embedColor } from '../Helpers/Util'
import type Command from '../types/Command'

const avatar: Command = {
  permissions: {
    user: ['SendMessages', 'AttachFiles'],
    bot: ['SendMessages', 'AttachFiles']
  },

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
      .setDescription("Should you be the only one seeing the command's reply?")
    ),

  helpData: {
    description: 'Gets the avatar of a selected user.',
    image: 'https://cdn.discordapp.com/attachments/1169390259411369994/1174770707578761276/image.png',
    examples: [
      '`/avatar user: @rei.shi` -> Returns the avatar of user `@rei.shi`.',
      '`/avatar user: @rei.shi secret: true` -> Returns the avatar of user `@rei.shi`, but only you can see the reply.'
    ],
    options: [
      {
        name: 'user',
        description: 'The user whose avatar you want',
        required: true
      },
      {
        name: 'secret',
        description: 'Should you be the only one seeing the command\'s reply?',
        required: false
      }
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
