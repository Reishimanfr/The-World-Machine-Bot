import { play } from './play';
import { pause } from './pause';
import { nowplaying } from './nowPlaying';
import { seek } from './seek';
import { remove } from './remove';
import { replace } from './replace';
import { audit } from './audit';
import { skipto } from './skipto';
import { save } from './save';

const subcomamndHandler = {
  play: play,
  pause: pause,
  nowplaying: nowplaying,
  seek: seek,
  remove: remove,
  replace: replace,
  audit: audit,
  save: save,
  skipto: skipto,
};

export default subcomamndHandler;
