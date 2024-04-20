declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string
      LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
      TENOR_API_KEY: string

      CUSTOM_EMOJIS_GUILD_ID: string
      REGISTER_COMMANDS_ON_START: boolean
      LEAVE_INACTIVE_GUILDS: boolean

      DATABASE_DIALECT: 'sqlite' | 'postgres'
      DATABASE_HOST: string
      DATABASE_PORT: string
      DATABASE_NAME: string
      DATABASE_USERNAME: string
      DATABASE_PASSWORD: string

      LAVALINK_HOST: string
      LAVALINK_PORT: string
      LAVALINK_PASSWORD: string

      PLAYER_TIMEOUT: string
    }
  }
}

export {}