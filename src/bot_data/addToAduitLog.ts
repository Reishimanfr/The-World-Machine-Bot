import { User } from 'discord.js';
import { ExtPlayer } from '../misc/twmClient';
import dayjs from 'dayjs';

const addToAuditLog = (player: ExtPlayer, user: User, message: string) => {
  const newData = {
    date: dayjs(),
    user: user,
    func: message,
  };

  player.auditLog = player.auditLog ? [...player.auditLog, newData] : [newData];
};

export default addToAuditLog;
