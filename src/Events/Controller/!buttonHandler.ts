import { loop } from './loop';
import { queueHelp } from './queueHelp';
import { showQueue } from './showQueue';
import { skip } from './skip';
import { togglePlayback } from './togglePlayback';

export const buttonMap = {
  showQueue: showQueue,
  togglePlayback: togglePlayback,
  skip: skip,
  loop: loop,
  queueHelp: queueHelp,
};
