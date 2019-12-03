const log = require('../utils/log').default;
let enabled = false;
let loggers;
// Conditionally load default loggers in development mode
// eslint-disable-next-line
if (process.env.NODE_ENV !== 'production') {
  loggers = require('./loggers').getLoggers(log);
}

function enable(state = true) {
  enabled = state;
  if (state) {
    log.enable();
  }
  if (state && !loggers) {
    // TODO - load from a pre-bundled URL
    loggers = {};
  }
}

function register(getLoggers) {
  loggers = getLoggers(log);
}

function logEvent(eventType, source, arg1, arg2) {
  if (enabled && loggers[eventType]) {
    // Not using ...args to defeat perf hit from array construction
    loggers[eventType](source, arg1, arg2);
  }
}

module.exports = {
  init: deck => {
    // User facing API
    deck.debug = enable;
    // hook for loading external bundle
    enable.register = register;

    // This state can persist via localStorage
    if (log.isEnabled()) {
      enable();
    }
    // Print helpful info in non-production environment or if debugging is enabled
    if (enabled || loggers) {
      log.log(
        `deck.gl ${deck.version} - set deck.debug(true) and deck.log.priority=1 for update logs`
      )();
    }
  },

  enable,
  log: logEvent
};
