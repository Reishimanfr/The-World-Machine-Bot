import { GatewayIntentBits, Partials } from "discord.js";
import fs from "fs";
import path from "path";
import { Poru } from "poru";
import { ExtClient } from "./Helpers/ExtendedClient";
import { logger } from "./Helpers/Logger";
import { config, poruNodes, poruOptions } from "./config";

process.on("unhandledRejection", (reason, promise) => {
  logger.error("An unhandled rejection occurred in the main process:");
  console.error(reason);
  console.error(promise);
});

process.on("uncaughtException", (error) => {
  logger.error("An uncaught exception occurred in the main process:");
  console.error(error ? `${error}` : `${error}`);
});

process.on("uncaughtExceptionMonitor", (error) => {
  logger.error("An uncaught exception monitor occurred in the main process:");
  console.error(error ? `${error}` : `${error}`);
});

export const client = new ExtClient({
  failIfNotExists: true,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    // These allow you to receive interactions on old messages for example
    Partials.Reaction,
    Partials.Message,
  ],
  allowedMentions: { repliedUser: false },
});

client.poru = new Poru(client, poruNodes, poruOptions);

const poruEventPath = path.join(__dirname, "./Events/Poru");
const eventPath = path.join(__dirname, "./Events/Bot");
const filter = (file: string) => file.endsWith(".ts")

const poruEvents = fs
  .readdirSync(poruEventPath)
  .filter(filter);

const botEvents = fs
  .readdirSync(eventPath)
  .filter(filter);

for (const file of botEvents) {
  const filePath = path.join(eventPath, file);
  const event = require(filePath).default;

  console.log(event)

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

for (const file of poruEvents) {
  const filePath = path.join(poruEventPath, file);
  const event = require(filePath).default;

  if (event.once) {
    client.poru.once(event.name, (...args) => event.execute(...args));
  } else {
    client.poru.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(config.botToken ?? config.devBotToken);
