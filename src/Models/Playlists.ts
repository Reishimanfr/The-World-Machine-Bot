import { DataTypes } from "sequelize";
import sequelize from "./Connection";

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
    type: DataTypes.JSON,
    allowNull: false,
  }
})
