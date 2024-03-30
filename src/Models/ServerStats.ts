import { DataTypes } from 'sequelize'
import sequelize from './Connection'

export interface ServerStatsI {
  id: number
  guildId: string
  lastActive: Date
}

export const serverStats = sequelize.define('serverStats', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true
  }
})