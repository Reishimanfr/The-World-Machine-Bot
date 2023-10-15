import { DataTypes, Sequelize } from 'sequelize';

// I'm too lazy to set anything up here
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

export const starboardBlacklistedChannels = sequelize.define('starboardBlacklistChannels', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const playerOverrides = sequelize.define('playerOverrides', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  leaveAfterQueueEnd: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  resendEmbedAfterSongEnd: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  enableSkipvote: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  skipvoteThreshold: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  skipvoteMemberRequirement: {
    type: DataTypes.NUMBER,
    allowNull: false
  }
})

const tables = [starboardEmojis, starboardConfig, starboardBlacklistedChannels, playerOverrides]

export default tables
