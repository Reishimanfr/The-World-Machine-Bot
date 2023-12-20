import { DataTypes } from "sequelize";
import sequelize from "./Connection";

export const chainSettings = sequelize.define('chainSettings', {
  guildId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  channels: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: false
  },
  captureChance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.5,
    allowNull: false
  },
  sendChance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.1,
    allowNull: false
  },
  ignoredUsers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: false
  }
})
