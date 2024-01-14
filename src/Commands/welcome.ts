import { ChannelType, EmbedBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { fetchMember } from "../Funcs/FetchMember";
import { logger } from "../Helpers/Logger";
import { embedColor } from "../Helpers/Util";
import Command from "../types/Command";

const welcome: Command = {
  permissions: {
    user: ['SendMessages'],
    bot: ['SendMessages']
  },

  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Re-send the bot welcome message.')
    .addChannelOption(channel => channel
      .setName('channel')
      .setDescription('Where to send the welcome message.')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
    ),

  helpPage: new EmbedBuilder()
    .setDescription('Send the bot welcome message.')
    .addFields(
      {
        name: 'Options',
        value: `* \`Channel\` -> Where to send the welcome message.`
      },
      {
        name: 'Notes',
        value: 'Only members with the `Administrator` permissions may use the channel option.\nIf the option isn\'t specified the bot will reply with a ephemeral message to the user that used the command'
      }
    )
    .setImage('https://cdn.discordapp.com/attachments/1169390259411369994/1175113282730860684/image.png'),

  callback: async ({ interaction }) => {
    const channel: TextChannel | null = interaction.options.getChannel('channel')

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'The world machine | A discord bot made with 💖 by Rei!', iconURL: 'https://static.wikia.nocookie.net/omniversal-battlefield/images/2/2a/The_SUn.jpg/revision/latest?cb=20190624052404' })
      .setDescription(`
A open source, multi-purpose bot with music playing features. To get help use the \`/help\` command!
Some of the features you can use are:
* \`/starboard\` -> A advanced starboard feature with a lot of customization.
* \`/music\` -> A very advanced music player with a lot of QoL features hosted on a \`lavalink\` server for best music quality!
## Configuration
The bot can be configured in many different ways to your liking! To check out the available configuration options use the \`/config\` command!
## Support
If you need help with one of the aspects of the bot feel free to [join the support server](https://discord.gg/xBARxUqyVc) or message me on discord \`(@rei.shi)\`
Alternatively you can check out the [bot's wiki repository](https://github.com/Reishimanfr/TWM-bot) to check for commonly asked questions and instructions on how to setup certain features!
## Updates and upcoming features
If you'd like to be updated on new features that get added to the bot, you can receive channel updates via the \`/config\` command!
To see what features I'm working on at the moment you can check out the [bot's TODO board](https://trello.com/b/MHqNTASH/the-world-machine-upcoming)
## Self-hosting
If you'd like to self-host the bot check out the [bot's wiki repository](https://github.com/Reishimanfr/TWM-bot) for instructions on how to do this step by step!`)
      .setColor(embedColor)

    if (!channel) {
      interaction.reply({
        embeds: [embed],
        ephemeral: true
      })
      return
    }

    const member = await fetchMember(interaction.guild!.id, interaction.user.id)

    if (!member!.permissions.has('Administrator')) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Only server administrators can re-send the welcome message to a channel. ]')
            .setColor(embedColor)
        ], ephemeral: true
      })
      return
    }

    if (!channel.permissionsFor(interaction.client.user.id)?.has('SendMessages')) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ I can\'t send messages in this channel. ]')
            .setColor(embedColor)
        ], ephemeral: true
      })
      return
    }

    try {
      await channel.send({
        embeds: [embed]
      })

      // terrible
      interaction.deferReply().then(_ => _.delete()).catch(() => { })
    } catch (error) {
      logger.error(`Failed to re-send welcome message: ${error.stack}`)
    }
  }
}

export default welcome