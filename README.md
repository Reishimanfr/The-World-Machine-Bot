<p align="center"><img width=200 height=200 src="https://github.com/Reishimanfr/TWM-bot/assets/92938606/de4f51a7-8499-4798-ad8c-dc78f5006cd0"</img></p>
<h3 align="center"> <a href="https://discord.com/api/oauth2/authorize?client_id=1073607844265476158&permissions=3426368&scope=bot">Invite link</a> | <a href="https://discord.gg/9VyyCkMSFP">Support Server</a> | <a href="https://github.com/Reishimanfr/TWM-bot/wiki/Features">Feature list<a/> | <a href="https://github.com/Reishimanfr/TWM-bot/wiki/Gallery">Gallery</a> | <a href="https://github.com/Reishimanfr/The-World-Machine-Bot/wiki/Update-logs">Update logs</a>

<i>A Discord music bot made with ❤️ by Rei!</i><br>

<a href="https://wakatime.com/badge/github/Reishimanfr/The-World-Machine-Bot"><img src="https://wakatime.com/badge/github/Reishimanfr/The-World-Machine-Bot.svg" alt="wakatime"></a>

# 
> [!CAUTION]
> This repo is still a work in progress, some stuff may be outdated (don't hesitate to ask me about it!)<br>

## ℹ️ General info

The world machine (or TWM for short) is an open-source discord bot written in typescript using the [discord.js](https://discord.js.org/) library.<br>
My motivation was that all the other music bots I used didn't suit me, so I wrote my own!

## ⭐ Features
- YouTube, Spotify, and Soundcloud playback support
- [Sponsorblock](https://sponsor.ajay.app/) integration
- Lots of QoL features to make the experience as nice as possible
- Amazing support from the bot's developer
- Very customizable starboard
- Docker support to easily host your instance in seconds
- A lot of other fun-to-use commands

## Want to self-host your own instance?

Check [this page](https://github.com/Reishimanfr/The-World-Machine-Bot/wiki/Self%E2%80%90hosting) for a step-by-step tutorial on how to host the bot (along with a [video tutorial!]()) 

## ⚙️ Configuration
<details>
 <summary>Example .env file:</summary>

```env
# Token for the bot to login with
BOT_TOKEN=


# == MISC ==
# Available options: trace, debug, info, warn, error, fatal
LOG_LEVEL=info


# == API keys ==
# This is used in the starboard script to display tenorgif correctly
TENOR_API_KEY=null

# This key is used for the /tf2 command to get data from a user's profile
STEAM_API_KEY=null

# == MUSIC PLAYER CONFIG ==
# Provide in minutes
PLAYER_TIMEOUT=10


# == DATABASE ==
# Available options: postgres, sqlite
DATABASE_DIALECT=sqlite
DATABASE_HOST=localhost
DATABASE_PORT=5432
# Ignored if DATABASE_DIALECT is postgres
DATABASE_NAME=twm
DATABASE_USERNAME=something
DATABASE_PASSWORD=password


# == Lavalink related stuff ==
# This changes if the bot should attempt to start the lavalink server automatically
# after receiving the ClientReady event.
AUTOSTART_LAVALINK=false

# This changes if any stdout or stderr output should be piped to the console
# Note: This only works if autostartLavalink is set to true
# Note 2: Stdout will be piped on the "debug" level
# Note 3: Stderr will always be piped on the "error" level
PIPE_LAVALINK_STDOUT=true

LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```
</details>

## ❓ Support

Please message me on Discord (@rei.shi) or [the support server](https://discord.gg/QGeraSWsan) and ask any question you want regarding the bot. Also, be sure to check the wiki for the most common topics!

## Migrating from v1?
Check [this comprehensive guide](https://takiten.notion.site/How-to-migrate-from-v1-to-v2-a4f6e03c8a0e4f7d990a777be6b85475?pvs=4) on how to migrate from twm v1 to v2

## 📦 Dependencies

Required:

- A [Lavalink](https://github.com/lavalink-devs/Lavalink) server
- [Node.js](https://nodejs.org/en)
- A [discord bot token](https://discord.com/developers/applications)


Optional:
- [Tenor API token](https://tenor.com/developer/dashboard) (for the starboard to be able to embed tenor gifs)
- [Spotify client & client secret](https://developer.spotify.com/documentation/web-api): [How to add Spotify support](https://github.com/Reishimanfr/TWM-bot/wiki/%F0%9F%9F%A9-Adding-spotify-support) (Host only)
- [Steam API key](https://steamcommunity.com/dev) (for the tf2 command to work)
- A [postgres](https://www.postgresql.org/) database

## ✨ Some project stats
![Alt](https://repobeats.axiom.co/api/embed/1a10163858d87c76196a1510e496f5c5cfb6990e.svg "Repobeats analytics image")
