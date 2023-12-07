import fs from 'fs';
import path from 'path';
import Command from '../types/Command';

const PATH = path.join(__dirname, '../commands');

// Recursively find command files in a directory and its subdirectories
const findCommands = (dir: string): Command[] => {
  const files = fs.readdirSync(dir);

  return files.reduce((commandList: Command[], file) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();

    if (isDirectory) {
      // Recursively find commands in subdirectories
      return commandList.concat(findCommands(filePath));
    } else if (file.endsWith('.ts')) {
      // Import the command module
      const module = require(filePath);
      commandList.push(module.default);
    }

    return commandList;
  }, []);
};

// Use the recursive function to find commands
const commandList: Command[] = findCommands(PATH);

export default commandList;