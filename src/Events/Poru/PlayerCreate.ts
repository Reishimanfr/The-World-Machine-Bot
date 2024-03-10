import { combineConfig } from '../../Funcs/CombinePlayerConfig'
import { ExtPlayer, MessageManager, PlayerController, QueueManager } from '../../Helpers/ExtendedPlayer'
import { Event } from '../../Types/Event'

const PlayerCreate: Event = {
  name: 'playerCreate',
  once: false,
  async execute(player: ExtPlayer) {
    player.messageManger = new MessageManager(player)
    player.queueManager = new QueueManager(player)
    player.controller = new PlayerController(player)
    player.settings = await combineConfig(player.guildId)
  }
}

export default PlayerCreate