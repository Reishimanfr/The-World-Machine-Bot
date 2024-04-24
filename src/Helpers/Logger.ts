import chalk from "chalk"
import moment from 'moment'

class logger {
  private shutUpAboutStaticClassesBiomeThanks() { }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static trace(...items: any) {
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.magenta('TRACE:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static debug(...items: any) {
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.blue('DEBUG:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static info(...items: any) {
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.greenBright('INFO:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static warn(...items: any) {
    const base = chalk.gray(`[${moment().format('hh:mm:ss.SSS')}]`)
    console.log(`${base} ${chalk.yellowBright('WARN:')} ${items}`)
  }

  // biome-ignore lint/suspicious/noExplicitAny: Leave me alone please
  static error(...items: any) {
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