import {getLoggers} from '../src/debug/loggers';

declare global {
  const deck: any;
}

const loggers = getLoggers(deck.log);
deck._registerLoggers(loggers);

export {loggers};
