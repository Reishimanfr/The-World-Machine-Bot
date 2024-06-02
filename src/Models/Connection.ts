import { Sequelize } from 'sequelize'
import { logger } from '../Helpers/Logger'
import path from 'node:path'

if (!process.env.DOCKER) {
  require('dotenv').config()
}

const sequelize = new Sequelize({
  dialect: process.env.DATABASE_DIALECT,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false
})

async function authenticate() {
  try {
    await sequelize.authenticate()
  } catch (error) {
    logger.error(`Unable to connect to database: ${error.stack}`)
  }
}

authenticate();

(async () => {
  await sequelize.sync()
})()

export default sequelize