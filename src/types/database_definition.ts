import { Sequelize, DataTypes } from 'sequelize';

// No reason to do anything fancy for a local database right?
// fucking kill me please
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
  define: {
    timestamps: false,
  },
});

export const starboardConfig = sequelize.define('starboardConfig', {
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

export const starboardBlacklist = sequelize.define('starboardBlacklist', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const starboardEmojis = sequelize.define('starboardEmojis', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const starboardEntries = sequelize.define('starboardEntires', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  messageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  blackListed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});
