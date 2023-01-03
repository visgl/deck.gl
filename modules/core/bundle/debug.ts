import {getLoggers} from '../src/debug/loggers';

// @ts-expect-error deck is not defined on globalThis
const {deck} = globalThis;
const loggers = getLoggers(deck.log);
deck._registerLoggers(loggers);

export default deck;
