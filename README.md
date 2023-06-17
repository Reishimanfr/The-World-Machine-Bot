# Doorbot - A discord bot by Rei
Doorbot is a general purpose bot made for discord with typescript

## How to self-host
1. Download the bot's code
> Just click on the "Download ZIP" button
2. Install dependencies with your package manager
> Example using pnpm: `pnpm install`
3. Transpile the code typescript code into javascript
> Run the `transpile` script, example using pnpm: `pnpm run transpile`
4. Fill out the .env file
> This file will contain your bot token and some other stuff
5. Run the bot
> The path to the transpiled `index.js` file is `./dist/index.js`. As a example you can run it with node using `node ./dist/index.js`.
