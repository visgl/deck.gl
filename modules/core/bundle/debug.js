/* global deck */
import {getLoggers} from '../src/debug/loggers';

const loggers = getLoggers(deck.log);
deck.registerLoggers(loggers);
