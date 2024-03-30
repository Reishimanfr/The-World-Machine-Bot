import { DataTypes } from 'sequelize'
import sequelize from './Connection'

// i'll use this someday
interface PlaylistI {
  id: number
  userId: string
  name: string
  tracks: string
}

export const playlists = sequelize.define('playlists', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tracks: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
})
