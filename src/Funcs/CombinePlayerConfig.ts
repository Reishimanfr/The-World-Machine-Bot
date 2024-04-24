import { type PlayerSettingsI, PlayerSettings, defaultConfig } from '../Models'

/**s
 * This function combines the default config with the overrides a user may have added.
 * Example: if a setting has been overridden the property for it's key will be the overridden
 * one, if it wasn't it will be set to the default value.
 */
export async function combineConfig(guildId: string): Promise<PlayerSettingsI> {
  const [record] = await PlayerSettings.findOrCreate({
    where: { guildId: guildId }
  })

  if (!record) return defaultConfig

  const data = record.dataValues
  // We don't need these properties
  data.id = undefined
  data.guildId = undefined

  for (const [key, value] of Object.entries(data)) {
    data[key] = value ?? defaultConfig[key]
  }

  return data
}