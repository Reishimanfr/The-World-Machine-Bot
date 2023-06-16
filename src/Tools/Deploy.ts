require('dotenv').config()
import { Client, REST, Routes } from "discord.js"
import { CommandList } from "../Commands/!!CommandsExport"
import { logger } from "./logger"

async function main() {
    const client = new Client({ intents: [] })
    await client.login(process.env.BOT_TOKEN)
    
    // Deploy slash commands
    const commandsJSON = CommandList.map(com => com.data.toJSON())
    
    logger.info(`Registering (/) commands...`)
    
    await new REST()
        .setToken(process.env.BOT_TOKEN)
        .put(Routes.applicationCommands(client.user.id), { body: commandsJSON })
        .then(_ => logger.info(`Success!`))
        .catch(error => logger.error(error.stack))

    process.exit()
}

main()