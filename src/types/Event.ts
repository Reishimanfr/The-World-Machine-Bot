import { Events } from "discord.js";

type Event = {
  name: Events | string,
  once: boolean,
  execute: (...args: any) => any;
}

export default Event