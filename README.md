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
 <summary>Example config.yml file:</summary>

```yaml
# This is an example configuration file for the bot. You can download it and fill out it's contents

# Token for the bot to login with
botToken: ''

# Sets which type of database the bot should use. If you have a postgres database setup, it's recommended
# to use it as it's faster than sqlite. If you don't want to set up a postgres database you can just set this
# to "sqlite" and call it a day. The performance difference won't matter much for smaller bots.
# Allowed values: "postgres" | "sqlite"
database: postgres

# Available options: trace, debug, info, warn, error, fatal
# Trace is the most verbose, and fatal is the least.
# Recommended level is info, unless you want to report a bug,
# then you most likely want to use the debug level instead. 
logLevel: info

# This changes if the bot should attempt to start the lavalink server automatically
# after receiving the ClientReady event.
autostartLavalink: false

# This changes if any stdout or stderr output should be piped to the console
# Note: This only works if autostartLavalink is set to true
# Note 2: Stdout will be piped on the "debug" level
# Note 3: Stderr will always be piped on the "error" level
pipeLavalinkStdout: true

# This sets the URL of the webhook that will send any uncaught errors to a channel
# To disable set this to an empty string or null
errorWebhookUrl: null

apiKeys:
  # This key is used for the /tf2 command to get data from a user's profile
  steam: null

  # This is used in the starboard script to display tenor gifs correctly
  tenor: null

# Settings to control the bot's player behavior
player:
  # Should the bot leave the voice channel after the queue ends?
  leaveAfterQueueEnd: false

  # Time after which the bot will be automatically disconnected from the voice channel
  # (in minutes)
  playerTimeout: 10

  # Enables search suggestions in the /music play command when typing stuff in the field
  # You must run the command deployment script after enabling/disabling this!
  # Deployment script: npm run deploy
  autocomplete: true

  # Re-sends the now-playing embed after a song ends
  resendEmbedAfterSongEnd: true

  # Enables vote to skip song
  enableSkipvote: true

  # Sets the percentage of voice chat users required to vote "Yes" for the song to be skipped
  # Values between 0 - 100 (percents). This will be ignored if enableSkipvote is set to false
  skipvoteThreshold: 50

  # Sets how many people should be in vc for skip votes to be enabled
  # -1 -> Always initiate skip vote
  skipvoteMemberRequirement: 3

```
</details>

## ❓ Support

Please message me on Discord (@rei.shi) or [the support server](https://discord.gg/QGeraSWsan) and ask any question you want regarding the bot. Also, be sure to check the wiki for the most common topics!

## 📦 Dependencies

Required:

- A [Lavalink](https://github.com/lavalink-devs/Lavalink) server
- [Node.js](https://nodejs.org/en)
- A [discord bot token](https://discord.com/developers/applications)
- A [postgres](https://www.postgresql.org/) database (Soon to be optional

Optional:

- [Tenor API token](https://tenor.com/developer/dashboard) (for the starboard to be able to embed tenor gifs)
- [Spotify client & client secret](https://developer.spotify.com/documentation/web-api): [How to add Spotify support](https://github.com/Reishimanfr/TWM-bot/wiki/%F0%9F%9F%A9-Adding-spotify-support) (Host only)
- [Steam API key](https://steamcommunity.com/dev) (for the tf2 command to work)

## ✨ Some project stats
![Alt](https://repobeats.axiom.co/api/embed/1a10163858d87c76196a1510e496f5c5cfb6990e.svg "Repobeats analytics image")
