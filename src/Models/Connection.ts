import { Sequelize } from 'sequelize'
import { logger } from '../Helpers/Logger'

const sequelize = new Sequelize({
  dialect: process.env.DATABASE_DIALECT,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  storage: __dirname + '../../../data/database.sqlite',
  logging: false
})

async function authenticate() {
  try {
    await sequelize.authenticate()
    logger.info('Connection to database established.')
  } catch (error) {
    logger.error(`Unable to connect to database: ${error.stack}`)
  }
}

authenticate();

(async () => {
  await sequelize.sync({ alter: true })
})()

export default sequelize