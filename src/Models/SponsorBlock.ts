import { DataTypes } from 'sequelize'
import sequelize from './Connection'

export const SponsorBlockDb = sequelize.define('sponsorBlock', {
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filler: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
  interaction: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
  intro: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
  music_offtopic: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
  outro: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
  preview: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
  selfpromo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
  sponsor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false
  },
})