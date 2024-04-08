import { DataTypes } from 'sequelize'
import sequelize from './Connection'

export interface ConfessionsI {
  guildId: string
  channelId: string
  emoji: string
  amount: number
}

export const Confessions = sequelize.define('confessions', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '🧅'
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  }
})