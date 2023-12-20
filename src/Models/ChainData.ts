import { DataTypes } from "sequelize";
import sequelize from "./Connection";

export const chainData = sequelize.define('chainData', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  chainData: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
  }
})
