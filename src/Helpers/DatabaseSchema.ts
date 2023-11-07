import { DataTypes, Sequelize } from "sequelize";
import { config } from "../config";

// I'm too lazy to set anything up here
const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
  define: {
    timestamps: false,
  },
});

export const botConfigOptions = sequelize.define('botConfigOptions', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  errorLogs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updateLogs: {
    type: DataTypes.STRING,
    allowNull: true,
  }
})

export const starboardEntries = sequelize.define("starboardEntries", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  botMessageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  starredMessageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export const starboardConfig = sequelize.define("starboardConfig", {
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
  },
});

export const starboardEmojis = sequelize.define("starboardEmojis", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const starboardBlacklistedChannels = sequelize.define(
  "starboardBlacklistChannels",
  {
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }
);

const data = {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
}

const keys = Object.keys(config.player);
const values = Object.values(config.player);

for (let i = 0; i < Object.keys(config.player).length; i++) {
  const key = keys[i]
  const valueType = (typeof values[i]).toUpperCase()

  data[key] = {
    allowNull: true,
    type: DataTypes[valueType],
  }
}

export const playerOverrides = sequelize.define("playerOverrides", data);

export const queueHistory = sequelize.define("queueHistory", {
  UUID: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  // Group is surrounded by brackets and split by |
  // Example: { some data } | { some other data }
  entries: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

sequelize.sync({ alter: true })