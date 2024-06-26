<p align="center">
 <img alt="Image source: https://steamcommunity.com/sharedfiles/filedetails/?id=2110317453" src="https://github.com/Reishimanfr/The-World-Machine-Bot/assets/92938606/91a37580-2be6-40b1-9279-fa129620f28e"></img>
</p>
<h3 align="center">

<i>A Discord music bot made with ❤️ by Rei!</i><br>

<p align="center">
<a href="https://discord.com/oauth2/authorize?client_id=1073607844265476158"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&label=Add%20bot&labelColor=1b1c1d&logo=discord&logoColor=white&color=4c73df" alt="Invite twm to server"></a>&nbsp;
 <a href="https://discord.gg/9VyyCkMSFP"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&label=Support%20server&labelColor=1b1c1d&logo=discord&logoColor=white&color=4c73df" alt="Support server"></a>&nbsp;
<br>
    <a href="https://github.com/reishimanfr/the-world-machine-bot/releases"><img src="https://img.shields.io/github/package-json/v/reishimanfr/the-world-machine-bot/main?style=for-the-badge&label=Version&labelColor=1b1c1d&logo=github&logoColor=white&color=4c73df" alt="twm bot release version"></a>&nbsp;
  <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/reishimanfr/the-world-machine?style=for-the-badge&logo=docker&color=4c73df&labelColor=1b1c1d">

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
      # Time after which the bot will leave vc if inactive (in minutes)
      - PLAYER_TIMEOUT=10
      # This is only needed if you want the starboard feature
      # to embed tenor gifs. You can safely ignore it.
      - TENOR_API_KEY=null

      # Create a new empty guild and paste it's ID here. You
      # only have to do this once.
      - CUSTOM_EMOJIS_GUILD_ID=1234567890

      # Changes if (/) commands should be registered on bot startup.
      - REGISTER_COMMANDS_ON_START=true

      # This changes if the bot should leave servers where it's
      # been inactive for 3 months.
      - LEAVE_INACTIVE_GUILDS=true

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
      - DOCKER=true
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
nano application.yml
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
4. Rename the `.env.example` file to `.env` and fill it out
5. Start the bot
```sh
npm start
```

## ❓ Support
**[Join the support server](https://discord.gg/9VyyCkMSFP)**... or message me on discord directly! (@rei.shi)

## ✨ Some project stats
![Alt](https://repobeats.axiom.co/api/embed/1a10163858d87c76196a1510e496f5c5cfb6990e.svg "Repobeats analytics image")
