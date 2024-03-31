import { DataTypes } from 'sequelize'
import sequelize from './Connection'

export type PlayerSettingsI = {
  queueEndDisconnect: boolean
  resendMessageOnEnd: boolean
  voteSkipToggle: boolean
  dynamicNowPlaying: boolean
  voteSkipThreshold: number
  voteSkipMembers: number
  requireDjRole: boolean
  djRoleId: string | null
}

export const defaultConfig: PlayerSettingsI = {
  queueEndDisconnect: false,
  resendMessageOnEnd: false,
  voteSkipToggle: true,
  dynamicNowPlaying: true,
  voteSkipThreshold: 50,
  voteSkipMembers: 3,
  requireDjRole: true,
  djRoleId: null,
} as const

export const PlayerSettings = sequelize.define('playerSettings', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  queueEndDisconnect: {
    type: DataTypes.BOOLEAN,
    defaultValue: defaultConfig.queueEndDisconnect
  },
  voteSkipToggle: {
    type: DataTypes.BOOLEAN,
    defaultValue: defaultConfig.voteSkipToggle
  },
  resendMessageOnEnd: {
    type: DataTypes.BOOLEAN,
    defaultValue: defaultConfig.resendMessageOnEnd
  },
  dynamicNowPlaying: {
    type: DataTypes.BOOLEAN,
    defaultValue: defaultConfig.dynamicNowPlaying
  },
  requireDjRole: {
    type: DataTypes.BOOLEAN,
    defaultValue: defaultConfig.requireDjRole
  },
  djRoleId: {
    type: DataTypes.STRING,
    defaultValue: defaultConfig.djRoleId
  },
  voteSkipMembers: {
    type: DataTypes.INTEGER,
    defaultValue: defaultConfig.voteSkipMembers
  },
  voteSkipThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: defaultConfig.voteSkipThreshold
  }
})
