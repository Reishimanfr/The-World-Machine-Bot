import { PlayerSettings as PlayerSettingsDb } from '../Models'
import { PlayerSettings, config as defaultConfig } from '../config'

/**
 * This function combines the default config with the overrides a user may have added.
 * Example: if a setting has been overridden the property for it's key will be the overridden
 * one, if it wasn't it will be set to the default value.
 */
export async function combineConfig(guildId: string): Promise<PlayerSettings> {
  const [record] = await PlayerSettingsDb.findOrCreate({
    where: { guildId: guildId }
  })

  if (!record) return defaultConfig.player

  const data = record.dataValues
  // We don't need these properties
  delete data.id
  delete data.guildId

  for (const [key, value] of Object.entries(data)) {
    data[key] = value ?? defaultConfig.player
  }

  return data
}