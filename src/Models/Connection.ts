import { Sequelize } from "sequelize";
import postgres from "../../postgres.json";

const sequelize = new Sequelize({
  ...postgres
})

sequelize.sync({ alter: true })

export default sequelize