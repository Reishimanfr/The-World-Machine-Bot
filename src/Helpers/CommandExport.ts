import fs from 'fs';
import path from 'path';
import Command from '../types/Command';

const PATH = path.join(__dirname, '../commands');

// Import each file under the /commands dir and add
// to the commandList var
const commandList: Command[] = fs
  .readdirSync(PATH)
  .filter(file => file.endsWith('.ts'))
  .map(file => {
    const module = require(`${PATH}/${file}`);
    return module.default;
  });

export default commandList;
