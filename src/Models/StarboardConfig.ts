import { DataTypes } from 'sequelize'
import sequelize from './Connection'

export interface StarboardConfigI {
  guildId: string
  boardId: string | null
  amount: number
  emojis: string
  bannedChannels: string
}

export const starboardConfig = sequelize.define('starboardConfig', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  boardId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
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
