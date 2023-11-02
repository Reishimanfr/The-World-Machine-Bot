import { EmbedBuilder, Events, Guild, NonThreadGuildBasedChannel } from "discord.js";
import Event from "../../types/Event";
import util from "../../Helpers/Util";

// This event is fired when the bot gets added to a server
const GuildCreate: Event = {
  name: Events.GuildCreate,
  once: false,
  execute: async (guild: Guild) => {
    const channels = await guild.channels.fetch();
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'The world machine | A discord bot made with 💖 by Rei!', iconURL: 'https://static.wikia.nocookie.net/omniversal-battlefield/images/2/2a/The_SUn.jpg/revision/latest?cb=20190624052404' })
      .setDescription(`
A open source, multi-purpose bot with music playing features. To get help use the \`/help\` command!
Some of the features you can use are:
* \`/starboard\` -> A advanced starboard feature with a lot of customization.
* \`/music\` -> A very advanced music player with a lot of QoL features hosted on a \`lavalink\` server for best music quality!
* \`/say\` -> Generate a oneshot textbox in discord!
## Support
If you need help with one of the aspects of the bot feel free to [join the support server](https://discord.gg/xBARxUqyVc) or message me on discord \`(@rei.shi)\`
Alternatively you can check out the [bot's wiki repository](https://github.com/Reishimanfr/TWM-bot) to check for commonly asked questions and instructions on how to setup certain features!
## Self-hosting
If you'd like to self-host the bot check out the [bot's wiki repository](https://github.com/Reishimanfr/TWM-bot) for instructions on how to do this step by step!`)
      .setColor(util.embedColor)

    for (let i = 0; i < channels.size; i++) {
      const channel:
        | NonThreadGuildBasedChannel
        | null
        | undefined
        = channels.at(i)

      if (channel
        && channel.isTextBased()
        && channel.permissionsFor(guild.members.me!.id)?.has("SendMessages")
      ) {
        channel.send({ embeds: [embed] })
        break;
      }
    }
  }
}

export default GuildCreate;