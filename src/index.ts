require('dotenv').config()
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js'
import { InteractionCreate} from './Interfaces/Interaction'
import { onMessage } from './Interfaces/Message'
import { Ready } from './Interfaces/Ready'
import { starboardLogic } from './Interfaces/Reaction'
import sequelize from './Interfaces/Models'
import { logger } from "./Tools/logger";

export const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Reaction, Partials.Message, Partials.Channel],
});


(async () => {
    try {
        await sequelize.sync()
        logger.info(`Database synchronized successfully.`)
    } catch (error) {
        logger.error(`Error synchronizing database: ${error.stack}`)
    }
})

// THE FUCKING UUH FUNNY
client.once(Events.ClientReady, async () => await Ready(client))
client.on(Events.InteractionCreate, async (interaction) => { await InteractionCreate(interaction, client) })
client.on(Events.MessageCreate, async (message) => onMessage(message))

// Reaction shit
client.on(Events.MessageReactionAdd, (i, user) => starboardLogic(i, user, client))
client.on(Events.MessageReactionRemove, (i, user) => starboardLogic(i, user, client))

client.login(process.env.BOT_TOKEN)