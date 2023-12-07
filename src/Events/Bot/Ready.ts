import { ActivityType, Events } from "discord.js";
import { ExtClient } from "../../Helpers/ExtendedClasses";
import { log } from "../../Helpers/Logger";
import { config } from "../../config";
import Event from "../../types/Event";

const Ready: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: ExtClient) => {
    console.clear()
    client.poru.init(client);
    log.info(`${client.user?.username} is online.`);

    if (!config.maintenance) {
      setInterval(function () {
        const activityString =
          client.poru.players.size > 0
            ? `music in ${client.poru.players.size == 1
              ? `one server`
              : `${client.poru.players.size} servers!`
            } 🎵`
            : `Oneshot 💡`;

        client.user?.setPresence({
          activities: [
            {
              name: activityString,
              type: ActivityType.Playing,
            },
          ],
        });
      }, 60000);
    } else {
      client.user?.setPresence({
        activities: [{ name: 'Down for maintenance.', type: ActivityType.Custom }],
        status: "idle"
      })
    }
  },
};

export default Ready;
