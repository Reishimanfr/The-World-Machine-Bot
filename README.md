# Doorbot - A discord bot by Rei
Doorbot is a general purpose bot made for discord with typescript

## How to self-host
1. Download the bot's code
> You can either download a pre-compiled package from the `releases` tab or compile the code yourself
2. Install dependencies with your package manager
> Example using pnpm: `pnpm install`
3. Register slash commands
> Run the `deploy` script, example using pnpm: `pnpm run deploy`. You only have to run this script when updating the bot.
4. Transpile the code typescript code into javascript
> Run the `transpile` script, example using pnpm: `pnpm run transpile`
5. Fill out the .env file
> This file will contain your bot token and some other stuff
6. Run the bot
> The path to the transpiled `index.js` file is `./dist/index.js`. As a example you can run it with node using `node ./dist/index.js`.

## Copiling the code yourself
Compiling the code is as easy as running the `transpile` script.
A `dist` folder will be created after the script is finished.
To run the transpiled code using node run: `node ./dist/index.js`
**To compile the code you have to have the `tsc` package installed!**
