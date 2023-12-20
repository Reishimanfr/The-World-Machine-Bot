import { DataTypes } from "sequelize";
import sequelize from "./Connection";

export const botStats = sequelize.define('botStats', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  sessionCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  vcTime: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  commandsRan: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  longestPlaylist: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
})
