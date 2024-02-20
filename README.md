<p align="center"><img width=200 height=200 src="https://github.com/Reishimanfr/TWM-bot/assets/92938606/de4f51a7-8499-4798-ad8c-dc78f5006cd0"</img></p>
<h3 align="center"> <a href="https://discord.com/api/oauth2/authorize?client_id=1073607844265476158&permissions=3426368&scope=bot">Invite link</a> | <a href="https://discord.gg/9VyyCkMSFP">Support Server</a> | <a href="https://github.com/Reishimanfr/TWM-bot/wiki/Features">Feature list<a/> | <a href="https://github.com/Reishimanfr/TWM-bot/wiki/Gallery">Gallery</a> | <a href="https://github.com/Reishimanfr/The-World-Machine-Bot/wiki/Update-logs">Update logs</a>

<i>A Discord music bot made with ❤️ by Rei!</i><br>

<a href="https://wakatime.com/badge/github/Reishimanfr/The-World-Machine-Bot"><img src="https://wakatime.com/badge/github/Reishimanfr/The-World-Machine-Bot.svg" alt="wakatime"></a>

# 
> [!CAUTION]
> This repo is still work in progress, some stuff may be outdated (don't hesitate to ask me about it!)<br>

## ℹ️ General info

The world machine (or TWM for short) is a open source discord bot written in typescript using the [discord.js](https://discord.js.org/) library.<br>
My motivation behind it was that all the other music bots I used didn't really suit me, so I decided to write my own!

## ⭐ Features
- 🎵 [A very advanced music player]('fixme')
- 🌟 [A starboard script]('fixme')
- 👀 [Multiple fun-to-use commands](https://github.com/Reishimanfr/TWM-bot/wiki/Commands)

## Want to self-host?

Check [this page](https://github.com/Reishimanfr/The-World-Machine-Bot/wiki/Self%E2%80%90hosting) for a step-by-step tutorial on how to host the bot (along with a [video tutorial!]()) 

## ⚙️ Configuration
<details>
 <summary>Example config.yml file:</summary>

```yaml
# Token for the bot to login with
botToken: 'Insert your bot token here'

apiKeys:
  # This key is used for the /tf2 command to get data from a user's profile
  steam: 'Your steam api key here'

  # This is used in the starboard script to display tenor gifs correctly
  tenor: 'Your tenor api key here'

# Settings to control the bot's player behavior
player:
  # Should the bot leave the voice channel after the queue ends?
  leaveAfterQueueEnd: false

  # Time after which the bot will be automatically disconnected from the voice channel
  # (in minutes)
  playerTimeout: 10

  # Enables search suggestions in the /music play command when typing stuff in the field
  # You must run the command deployment script after enabling/disabling this!
  # Deployment script: <npm> run deploy
  autocomplete: true

  # Instead of making all responses to commands like /music play ephemeral, make them public
  announcePlayerActions: false # TODO

  # Re-sends the now playing embed after a song ends
  resendEmbedAfterSongEnd: true

  # Enables vote to skip song
  enableSkipvote: true

  # Sets the percentage of voice chat users required to vote "Yes" for the song to be skipped
  # Values between 0 - 100 (percents). This will be ignored if enableSkipvote is set to false
  skipvoteThreshold: 50

  # Sets how many people should be in vc for skipvotes to be enabled
  # -1 -> Always initiate skipvote
  skipvoteMemberRequirement: 3
```
</details>

## ❓ Support

Message me on discord (@rei.shi) or [the support server](https://discord.gg/QGeraSWsan) and ask any question you want regarding the bot. Also be sure to check the wiki for most common topics!

## 📦 Dependencies

Required:

- A [Lavalink](https://github.com/lavalink-devs/Lavalink) server
- [Node.js](https://nodejs.org/en)
- A [discord bot token](https://discord.com/developers/applications)
- A [postgres](https://www.postgresql.org/) database (Soon to be optional

Optional:

- [Tenor API token](https://tenor.com/developer/dashboard) (for the starboard to be able to embed tenor gifs)
- [Spotify client & client secret](https://developer.spotify.com/documentation/web-api): [How to add spotify support](https://github.com/Reishimanfr/TWM-bot/wiki/%F0%9F%9F%A9-Adding-spotify-support) (Host only)
- [Steam API key](https://steamcommunity.com/dev) (for the tf2 command to work)


 [![HitCount](https://hits.dwyl.com/Reishimanfr/TWM-bot.svg?style=flat&show=unique)](http://hits.dwyl.com/Reishimanfr/TWM-bot)
