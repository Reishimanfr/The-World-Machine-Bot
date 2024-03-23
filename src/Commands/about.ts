import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { Command } from '../Types/Command'
import axios from 'axios'
import FormatTime from '../Funcs/FormatTime'

function formatBlock(string: string): `\`\`\`${string}\`\`\`` {
  return `\`\`\`${string}\`\`\``
}

const about: Command<false> = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Shows some information about the bot and it\'s creator'),

  permissions: {
    user: ['SendMessages'],
    bot: ['SendMessages', 'EmbedLinks']
  },

  callback: async ({ interaction, client }) => {
    const fetchUser = await axios.get('https://discord.com/api/users/844684172421496882', {
      headers: { 'Authorization': `Bot ${client.token}` }
    })

    const servingUsers = client.guilds.cache
      .map(g => g.memberCount)
      .reduce((prev, cur) => prev + cur)

    const musicCommands = client.commands.filter(c => c.musicOptions).size
    const user = fetchUser.data

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Some info about the bot and it\'s creator'
      })
      .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)
      .setDescription(`Hello! I'm **${user.username}**. Thanks for using my bot!\nI'm a small, aspiring programmer from poland that aims to provide the fastest and easiest to use applications that I can possibly deliver!\nIf you want to see any other projects I've made check out my **[GitHub profile](https://github.com/reishimanfr)**\nIf you'd like to sponsor my work for just 1$ check my **[buy me a coffee page](https://buymeacoffee.com/reishimanfr)**!\n### Some stats related to the bot below:`)
      .setFields([
        {
          name: '🌐 Servers',
          value: `${formatBlock(String(client.guilds.cache.size) + '/100')}`,
          inline: true
        },
        {
          name: '👤 Serving',
          value: `${formatBlock(servingUsers + ' users')}`,
          inline: true
        },
        {
          name: '⚡ Currently active players',
          value: `${formatBlock(String(client.poru.players.size))}`
        },
        {
          name: '📋 Available (/) commands',
          value: `${formatBlock(String(client.commands.size))}`,
          inline: true
        },
        {
          name: '🎶 Music commands',
          value: `${formatBlock(String(musicCommands))}`,
          inline: true
        },
        {
          name: '⌚ Uptime',
          value: `${formatBlock(FormatTime(Math.floor(client.uptime / 1000)))}`
        }
      ])
      .setColor(user.banner_color)

    interaction.reply({
      embeds: [embed]
    })
  }
}

export default about