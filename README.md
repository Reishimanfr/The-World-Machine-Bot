<p align="center"><img width=200 height=200 src="https://github.com/Reishimanfr/TWM-bot/assets/92938606/de4f51a7-8499-4798-ad8c-dc78f5006cd0"</img></p>
<h3 align="center"> <a href="https://discord.com/api/oauth2/authorize?client_id=1073607844265476158&permissions=3426368&scope=bot">Invite link</a> | <a href="https://discord.gg/QGeraSWsan">Support Server</a> | <a href="https://github.com/Reishimanfr/TWM-bot/wiki/Features">Feature list<a/> | <a href="">Gallery</a>

<i>A Discord music bot made with ❤️ by Rei!</i><br>

## ℹ️ General info

The world machine (or TWM for short) is a open source discord bot written in typescript using the [discord.js](https://discord.js.org/) library.<br>
My motivation behind it was that all the other music bots I used didn't really suit me, so I decided to write my own!

## ⭐ Features
- 🎵 [A very advanced music player]('fixme')
- 🌟 [A starboard script]('fixme')
- 👀 [Multiple fun-to-use commands]('fixme')

## ⚙️ Configuration
You can configure my bot in multiple ways. If you're [self-hosting]() it go check out [this wiki page]() on possible options you can configure as a host.
If you just want to configure some stuff as the user of the bot, [click here]() to check the wiki page for user configuration options!<br>
Below you can find a table with available configuration variables in the `config.yml` file:<br>

<details>
  <summary>Click here to view the <b>config.yml</b> variables</summary>
  | Variable | Function | Optional? | Notes |
|---|---|---|---|
| `botToken` | Acts as the password for the bot user | ❌ | Get one in the [Discord Developer Portal](https://discord.dev/) |
| `devBotToken` | A secondary bot token used to test new features | ✅ | You most likely don't need this. |
| `apiKeys#steam` | Used for the `/tf2` command to fetch user data | ✅ | The `/tf2` command can't work without it. |
| `apiKeys#tenor` | Used to fetch tenor gifs for the starboard | ✅ | Tenor gifs will be sent as normal text without this provided. |
</details>

<details>
  <summary>Click here to view player config options</summary>
</details>

## ❓ Support

Message me on discord (@rei.shi) or [the support server](https://discord.gg/QGeraSWsan) and ask any question you want regarding the bot. Also be sure to check the wiki for most common topics!

## 📦 Dependencies

Required:

- [Node.js](https://nodejs.org/en)
- [Lavalink](https://github.com/lavalink-devs/Lavalink)
- A discord bot token, you can get one in the [Discord Developer Portal](https://discord.com/developers/applications)

Optional:

- [Tenor API token](https://tenor.com/developer/dashboard) (for the starboard to be able to embed tenor gifs)
- [Spotify client & client secret](https://developer.spotify.com/documentation/web-api) (for playing songs from spotify using the music player)
- [Steam API key](https://steamcommunity.com/dev) (for the tf2 command to work)
