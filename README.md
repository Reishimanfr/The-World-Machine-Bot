# The world machine - A discord bot made with ❤️ by Rei!
The world machine is a general purpose bot with features like the starboard, a music player, and more!

## Invite link
You can invite the bot to your server using this link:
https://discord.com/api/oauth2/authorize?client_id=1073607844265476158&permissions=3426368&scope=bot

## How to self-host
1. Download the bot's code
> You can either download a pre-compiled package from the `releases` tab or compile the code yourself (or just run the typescript files as-is)
2. Install dependencies with your package manager `(npm install)`
2.1. (optional) Transpile the typescript code into javascript
> For this you can run the `npm run transpile` command
3. Register slash commands
> Run the `deploy` script, `(npm run deploy)`. You only have to run this script when a command's structure changes or a new one is added.
5. Fill out the .env file
> This file will contain your bot token and some other stuff that's required for certain things to work
6. Run the bot
> Run the "start" script, `(npm start)`

## Dependencies
Required:
* Lavalink (I suggest ver. 3.7.8) -> https://github.com/lavalink-devs/Lavalink
* A discord bot token -> https://discord.com/developers/applications

Optional:
* Tenor API token (for the starboard to be able to embed tenor gifs)
* Spotify client & client secret (for playing songs from spotify using the music player)
* Steam API key (for the tf2 command to work)

## Compiling the code yourself
Compiling the code is as easy as running the `transpile` script.
A `dist` folder will be created after the script is finished.
To run the transpiled code using node run: `node ./dist/index.js`
**To compile the code you have to have the `tsc` package installed!**
