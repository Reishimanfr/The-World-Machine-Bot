declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            DEV: string;
            TENOR_KEY: string;
        }
    }
}

export {};