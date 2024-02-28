import { DataTypes } from 'sequelize'
import sequelize from './Connection'

export const starboardConfig = sequelize.define('starboardConfig', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  boardId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4
  },
  emojis: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '⭐'
  },
  bannedChannels: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
})
