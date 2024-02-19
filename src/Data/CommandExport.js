"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PATH = path_1.default.join(__dirname, '../Commands');
// Recursively find command files in a directory and its subdirectories
const findCommands = (dir) => {
    const files = fs_1.default.readdirSync(dir);
    return files.reduce((commandList, file) => {
        const filePath = path_1.default.join(dir, file);
        const isDirectory = fs_1.default.statSync(filePath).isDirectory();
        if (isDirectory) {
            // Recursively find commands in subdirectories
            return commandList.concat(findCommands(filePath));
        }
        else if (file.endsWith('.ts')) {
            // Import the command module
            const module = require(filePath);
            commandList.push(module.default);
        }
        return commandList;
    }, []);
};
// Use the recursive function to find commands
const commandList = findCommands(PATH);
exports.default = commandList;
