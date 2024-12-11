import { handlers as internalHandlers } from './handlers/internal';
import { handlers as twitchHandlers } from './handlers/twitch';

export const handlers = [...twitchHandlers, ...internalHandlers];
