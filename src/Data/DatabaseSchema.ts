import { DataTypes, Sequelize } from "sequelize";
import { log } from "../Helpers/Logger";
import { config } from "../config";

// I'm too lazy to set anything up here
const sequelize = new Sequelize({
  host: "localhost",
  port: 5432,
  username: 'postgres',
  password: 'Basia2010',
  dialect: "postgres",
  database: "main",
  logging: false,
  define: {
    timestamps: false,
  },
});

async function testConnection() {
  try {
    await sequelize.authenticate()
    log.info('Connection to the database has been established successfully.')
  } catch (error) {
    log.error('Usable to connect to the database:', error)
  }
}

testConnection()

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

export const starboardBlacklistedChannels = sequelize.define("starboardBlacklistChannels",
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
  let valueType = (typeof values[i]).toUpperCase()

  if (valueType === 'NUMBER') {
    valueType = 'INTEGER'
  }

  data[key] = {
    allowNull: true,
    type: DataTypes[valueType],
  }
}

export const playerOverrides = sequelize.define("playerOverrides", data)

export const queueHistory = sequelize.define("queueHistory", {
  UUID: {
    type: DataTypes.STRING,
  },
  // Group is surrounded by brackets and split by |
  // Example: { some data } | { some other data }
  entries: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export const botStats = sequelize.define('botStats', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  sessionCount: {
    type: DataTypes.INTEGER,
  },
  vcTime: {
    type: DataTypes.BIGINT
  },
  commandsRan: {
    type: DataTypes.INTEGER
  },
  longestPlaylist: {
    type: DataTypes.INTEGER
  }
})

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
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false,
  }
})

sequelize.sync({ alter: true })