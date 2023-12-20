import { DataTypes } from "sequelize"
import { config } from "../config"
import sequelize from "./Connection"

export const PlayerSettings = sequelize.define("playerSettings", {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  queueEndDisconnect: {
    type: DataTypes.BOOLEAN,
    defaultValue: config.player.queueEndDisconnect,
  },
  voteSkipToggle: {
    type: DataTypes.BOOLEAN,
    defaultValue: config.player.voteSkipToggle
  },
  resendMessageOnEnd: {
    type: DataTypes.BOOLEAN,
    defaultValue: config.player.resendMessageOnEnd
  },
  dynamicNowPlaying: {
    type: DataTypes.BOOLEAN,
    defaultValue: config.player.dynamicNowPlaying
  },
  requireDjRole: {
    type: DataTypes.BOOLEAN,
    defaultValue: config.player.requireDjRole
  },
  djRoleId: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  voteSkipMembers: {
    type: DataTypes.INTEGER,
    defaultValue: config.player.voteSkipMembers
  },
  voteSkipThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: config.player.voteSkipThreshold
  }
})
