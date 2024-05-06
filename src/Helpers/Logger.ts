import chalk from "chalk"
import moment from 'moment'
require('dotenv').config()

const logLevel = process.env.LOG_LEVEL

//                     0        1       2       3        4        5
const levelNames = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
const level = levelNames.indexOf(logLevel) 

class logger {
  private shutUpAboutStaticClassesBiomeThanks() { }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static trace(...items: any) {
    if (level > 0) return
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.magenta('TRACE:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static debug(...items: any) {
    if (level > 1) return
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.blue('DEBUG:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static info(...items: any) {
    if (level > 2) return
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.greenBright('INFO:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static warn(...items: any) {
    if (level > 3) return
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.yellowBright('WARN:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static error(...items: any) {
    if (level > 4) return
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.redBright('ERROR:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static fatal(items: any) {
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.bgRedBright('FATAL:')} ${items}`)
  }
}

export { logger }