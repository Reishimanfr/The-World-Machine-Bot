import fs from 'fs'
import path from 'path'
import { Command } from '../Types/Command'

const PATH = path.join(__dirname, '../Commands')

const findCommands = (dir: string): Command[] => {
  const files = fs.readdirSync(dir)

  return files.reduce((commandList: Command[], file) => {
    const filePath = path.join(dir, file)
    const isDirectory = fs.statSync(filePath).isDirectory()

    if (isDirectory) {
      return commandList.concat(findCommands(filePath))
    } else if (file.endsWith('.ts')) {
      const module = require(filePath)
      commandList.push(module.default)
    }

    return commandList
  }, [])
}

export default findCommands(PATH)