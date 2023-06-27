import Command from '../Interfaces/Command';
import { avatar } from './avatar';
import { define } from './define';
import { emoji } from './emoji';
import { starboard } from './starboard';
import { help } from './help';
import { reaction } from './reaction';
import { picture } from './picture';
import { tf2 } from './tf2';

export const CommandList: Command[] = [
    avatar,
    emoji,
    define,
    starboard,
    help,
    reaction,
    picture,
    tf2,
];