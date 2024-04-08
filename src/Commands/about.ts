import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { Command } from '../Types/Command'
import axios from 'axios'
import { TimeFormatter } from '../Classes/TimeFormatter'
import { NodeStats } from 'poru'

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
    const formatter = new TimeFormatter()
    const fetchUser = await axios.get('https://discord.com/api/users/844684172421496882', {
      headers: { 'Authorization': `Bot ${client.token}` }
    })

    const servingUsers = client.guilds.cache
      .map(g => g.memberCount)
      .reduce((prev, cur) => prev + cur)

    const user = fetchUser.data

    const node = client.poru.leastUsedNodes[0]
    const lavalinkStats = await client.poru.getLavalinkStatus(node.name) as NodeStats

    const nodeNames: string[] = []
    client.poru.nodes.forEach(n => nodeNames.push(n.name))

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Some info about the bot and it\'s creator' })
      .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)
      .setDescription(`Hello! I'm **${user.username}**. Thanks for using my bot!\nI'm a small, aspiring programmer from poland that aims to provide the fastest and easiest to use applications that I can possibly deliver!\nIf you want to see any other projects I've made check out my **[GitHub profile](https://github.com/reishimanfr)**\nIf you'd like to sponsor my work for just 1$ check my **[buy me a coffee page](https://buymeacoffee.com/reishimanfr)**!\n### ✨ Some stats related to the bot below:`)
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
          name: 'Currently active nodes',
          value: `${formatBlock(nodeNames.join(', '))}`
        },
        {
          name: 'CPU usage (lavalink)',
          value: `${formatBlock((lavalinkStats.cpu.lavalinkLoad).toFixed(0))}`,
          inline: true
        },
        {
          name: 'RAM usage (lavalink)',
          value: `${formatBlock((lavalinkStats.memory.used / (1024 ** 2)).toFixed(2) + 'MB')}`,
          inline: true
        },
        {
          name: '⌚ Uptime',
          value: `${formatBlock(formatter.uptime(Math.floor(client.uptime / 1000)))}`
        }
      ])
      .setColor(user.banner_color)

    interaction.reply({
      embeds: [embed]
    })
  }
}

export default about