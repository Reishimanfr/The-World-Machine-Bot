import fs from 'fs';
import Command from '../types/CommandI';
import path from 'path';

const PATH = path.join(__dirname, '../commands');

// Import each file under the /commands dir and add
// to the commandList var
const commandList: Command[] = fs
  .readdirSync(PATH)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => {
    const module = require(`${PATH}/${file}`);
    return module.default;
  });

export default commandList;
