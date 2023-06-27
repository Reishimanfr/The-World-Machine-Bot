declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            DEV: string;
            TENOR_KEY: string;
            STEAM_API_KEY: string;
        }
    }
}

export {};