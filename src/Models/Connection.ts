import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  host: 'localhost',
  port: 5432,

  username: 'postgres',
  password: 'Basia2010',
  database: 'twm-development-db',

  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: false
  }
})

sequelize.sync({ alter: true })

export default sequelize