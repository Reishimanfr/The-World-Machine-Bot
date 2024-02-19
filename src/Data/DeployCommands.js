"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
const CommandExport_1 = __importDefault(require("./CommandExport"));
const config_2 = require("../config");
async function main() {
    config_2.logger.info('Registering (/) commands...');
    const client = new discord_js_1.Client({ intents: [] });
    const commandJSON = CommandExport_1.default.map((command) => {
        config_2.logger.debug(`Adding command ${command.data.name}...`);
        return command.data.setDMPermission(false).toJSON();
    });
    const token = config_1.config.botToken ?? config_1.config.devBotToken;
    if (!token)
        throw new Error('No tokens were provided. Double check the config.yml file and provide the botToken before running this script again.');
    await client.login(config_1.config.botToken ?? config_1.config.devBotToken);
    await new discord_js_1.REST()
        .setToken(token)
        .put(discord_js_1.Routes.applicationCommands(client.user.id), { body: commandJSON })
        .then((_) => config_2.logger.info('Success!'))
        .catch((error) => config_2.logger.error(error));
    process.exit();
}
main();
