import deckLog from '../utils/log';
import {getLoggers} from './loggers';

/* debug utility */

let loggers = {};

// Conditionally load default loggers in development mode
// eslint-disable-next-line
if (process.env.NODE_ENV !== 'production') {
  loggers = getLoggers(deckLog);
}

export function register(handlers) {
  loggers = handlers;
}

export default function debug(eventType) {
  if (deckLog.level > 0 && loggers[eventType]) {
    // Not using ...args to defeat perf hit from array construction
    loggers[eventType].call(...arguments);
  }
}
