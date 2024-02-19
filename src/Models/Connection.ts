import { Sequelize } from "sequelize";
import options from "../../postgres.json"
import { logger } from "../config";

const sequelize = new Sequelize({
  ...options,
  logging: false,
  dialect: 'postgres'
});

async function authenticate() {
  try {
    await sequelize.authenticate();
    logger.info('Connection can been established successfully. The app is good to go!');
  } catch (error) {
    logger.error('Unable to connect to the database');
  }
}

authenticate();

(async () => {
  await sequelize.sync({ alter: true  })
})();

export default sequelize