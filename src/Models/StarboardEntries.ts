import { DataTypes } from 'sequelize'
import sequelize from './Connection'

export const starboardEntries = sequelize.define('starboardEntires', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  botMessageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  starredMessageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
})
