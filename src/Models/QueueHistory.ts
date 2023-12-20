import { DataTypes } from "sequelize";
import sequelize from "./Connection";

export const queueHistory = sequelize.define("queueHistory", {
  UUID: {
    type: DataTypes.STRING,
  },
  // Group is surrounded by brackets and split by |
  // Example: { some data } | { some other data }
  entries: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});
