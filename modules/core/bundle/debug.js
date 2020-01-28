/* global deck */
const {getLoggers} = require('../src/debug/loggers');

const loggers = getLoggers(deck.log);
deck._registerLoggers(loggers);

module.exports = deck;
