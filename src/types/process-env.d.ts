declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string
      LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
      TENOR_API_KEY: string
      STEAM_API_KEY: string

      DATABASE_DIALECT: 'sqlite' | 'postgres'
      DATABASE_HOST: string
      DATABASE_PORT: string
      DATABASE_NAME: string
      DATABASE_USERNAME: string
      DATABASE_PASSWORD: string

      AUTOSTART_LAVALINK: string
      PIPE_LAVALINK_STDOUT: string

      LAVALINK_HOST: string
      LAVALINK_PORT: string
      LAVALINK_PASSWORD: string

      PLAYER_TIMEOUT: string
    }
  }
}

export {}