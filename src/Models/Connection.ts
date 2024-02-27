import { Sequelize } from "sequelize";
import options from "../../postgres.json"
import { config, logger } from "../config";

let sequelize: Sequelize

if (config.databaseType === 'postgres') {
  sequelize = new Sequelize({
    ...options,
    logging: false,
    dialect: 'postgres'
  })
} else {
  sequelize = new Sequelize({
    ...options,
    logging: false,
    dialect: 'sqlite',
    storage: './database.sqlite'
  })
}

async function authenticate() {
  try {
    await sequelize.authenticate();
    logger.info('Connection to database established.')
  } catch (error) {
    logger.error(`Unable to connect to database: ${error.stack}`);
  }
}

authenticate();

(async () => {
  await sequelize.sync({ alter: true  })
})();

export default sequelize