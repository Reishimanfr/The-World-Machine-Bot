import { Sequelize } from "sequelize";
import postgres from "../../postgres.json";
import { logger } from "../Helpers/Logger";

const sequelize = new Sequelize({
  ...postgres as any,
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
  await sequelize.sync({ alter: true })
})();

export default sequelize