<p align="center">
 <img width=200 height=200 src="https://github.com/Reishimanfr/TWM-bot/assets/92938606/de4f51a7-8499-4798-ad8c-dc78f5006cd0"</img>
</p>
<h3 align="center">
 <a href="https://discord.com/api/oauth2/authorize?client_id=1073607844265476158&permissions=3426368&scope=bot">Invite link</a> |
 <a href="https://discord.gg/9VyyCkMSFP">Support Server</a> |
 <a href="https://github.com/Reishimanfr/TWM-bot/wiki/Features">Feature list<a/> |
  <a href="https://github.com/Reishimanfr/TWM-bot/wiki/Gallery">Gallery</a> |
  <a href="https://github.com/Reishimanfr/The-World-Machine-Bot/wiki/Update-logs">Update logs</a>
 
<i>A Discord music bot made with ❤️ by Rei!</i><be>

<p align="center">
 <a href="https://nodejs.org/en/download/">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white">
 </a>
 <a href="https://discord.js.org/#/">
  <img src="https://img.shields.io/badge/Discord.js-7289DA?style=for-the-badge&logo=discord&logoColor=white">
 </a>
 <a href="https://www.docker.com/">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
 </a>
</p>

## ⭐ Features
- YouTube, Spotify, and Soundcloud playback support
- [Sponsorblock](https://sponsor.ajay.app/) integration
- Lots of QoL features to make the experience smooth
- Amazing support from the bot's developer
- Docker support for easy hosting

## 🚀 Installation using Docker (recommended)
> [!IMPORTANT]
> This assumes you have Docker and Docker Compose installed and working correctly.

1. Copy the **docker-compose.yml** file:
```yaml
version: '3.7'

services:
  lavalink:
    container_name: twm_lavalink
    image: ghcr.io/lavalink-devs/lavalink:4
    restart: on-failure
    environment:
      - SERVER_PORT=2333
      - SERVER_ADDRESS=0.0.0.0
      - LAVALINK_SERVER_PASSWORD=youshallnotpass
    volumes:
      - ./lavalink/application.yml:/opt/Lavalink/application.yml
      - ./lavalink/plugins:/opt/Lavalink/plugins/
    healthcheck:
      test: 'curl -H "Authorization: youshallnotpass" -s http://localhost:2333/version'
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 10s
    
  postgres:
    container_name: twm_postgres
    image: postgres:latest
    restart: on-failure
    environment:
      POSTGRES_DB: twm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: twmIsAwesome
    volumes:
      - ./postgres-data:/var/lib/postgresql/data

  discord-bot:
    container_name: twm
    image: reishimanfr/the-world-machine:latest
    environment:
      # Your discord bot token. Never show it to anyone
      - BOT_TOKEN=
      # Time after which the bot will leave vc if it's inactive
      # for that time. (Provided in minutes)
      - PLAYER_TIMEOUT=10
      # This is only needed if you want the starboard feature
      # to embed tenor gifs. You can safely ignore it.
      - TENOR_API_KEY=null

      # Don't change these unless you know what you're doing
      - LOG_LEVEL=info      
      # Lavalink stuff
      - LAVALINK_HOST=lavalink
      - LAVALINK_PORT=2333
      - LAVALINK_PASSWORD=youshallnotpass
      # Postgres stuff
      - DATABASE_DIALECT=postgres
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=twm
      - DATABASE_USERNAME=postgres
      - DATABASE_PASSWORD=twmIsAwesome
    volumes:
      - ./:/usr/src/app
    restart: on-failure
    depends_on:
      - lavalink
      - postgres
```
2. Edit the environment variables like the bot token
3. `cd` into the folder where you placed the compose file
```sh
cd path/to/the/folder
```
4. Build the container
```sh
docker-compose up -d
```
###### The `-d` flag means "detached" which will run the container in the background.

To update, run this command:
```sh
docker-compose up --force-recreate -d
```

If you want to provide your application.yml file for lavalink:
1. Create a new directory in the root folder called `lavalink`
```sh
mkdir lavalink
```
2. Create a file called `applcation.yml` and fill it out according to your needs.
```sh
touch application.yml
vim application.yml
```

## 🚀 Installation using the source code
1. Clone the source code<br>
```sh
git clone https://github.com/Reishimanfr/The-World-Machine-Bot
```
2. Go into the newly created directory
```sh
cd The-World-Machine-Bot
```
3. Install dependencies
```sh
npm i --omit=dev
```
4. Setup environment variables:
```env
# Token for the bot to login with
BOT_TOKEN=

# Available options: trace, debug, info, warn, error, fatal
LOG_LEVEL=info

# This is used in the starboard script to display tenorgif correctly
TENOR_API_KEY=null

# Time after which the bot will leave the voice channel if idling
PLAYER_TIMEOUT=10

# Available options: postgres, sqlite
DATABASE_DIALECT=sqlite # It's recommended to use a postgres database
DATABASE_HOST=localhost
DATABASE_PORT=5432

# You only have to change these if you set the DATABASE_DIALECT to postgres
DATABASE_NAME=twm
DATABASE_USERNAME=something
DATABASE_PASSWORD=password

LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```
4. Start the bot
```sh
npm start
```

## ❓ Support
**[Join the support server](https://discord.gg/QGeraSWsan)**... or message me on discord directly! (@rei.shi)

## ✨ Some project stats
![Alt](https://repobeats.axiom.co/api/embed/1a10163858d87c76196a1510e496f5c5cfb6990e.svg "Repobeats analytics image")
