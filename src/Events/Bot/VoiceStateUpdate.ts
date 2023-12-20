import { Events, VoiceState } from "discord.js";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { client } from "../../index";
import Event from "../../types/Event";
import PlayerDestroy from "../Poru/PlayerDestroy";

const UpdateVoiceState: Event = {
  name: Events.VoiceStateUpdate,
  once: false,
  execute: async (oldState: VoiceState, newState: VoiceState) => {
    const guildId = oldState?.guild?.id ?? newState?.guild?.id;
    const player = client.poru.players.get(guildId) as ExtPlayer;

    if (!player) return;

    const newChannel = newState.guild.members.me?.voice.channel

    // Bot disconnect event
    if (!newChannel) {
      return await PlayerDestroy.execute(player, 'bot was disconnected.')
    }

    const membersWithoutBots = newChannel.members
      .filter(m => !m.user.bot);

    // Everyone left voice
    if (membersWithoutBots.size == 0) {
      return await PlayerDestroy.execute(player, 'everyone left the channel.')
    }
  },
};

export default UpdateVoiceState;
