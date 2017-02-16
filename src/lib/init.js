import {global} from './utils/globals';
import log from './utils/log';

// Version detection
// TODO - this imports a rather large JSON file, we only need one field
import {version} from '../../package.json';

const STARTUP_MESSAGE = 'set deck.log.priority=2 to trace attribute updates';

if (global.deck && global.deck.VERSION !== version) {
  throw new Error(`deck.gl - multiple versions detected: ${global.deck.VERSION} vs ${version}`);
}

if (!global.deck) {
  /* global console */
  /* eslint-disable no-console */
  console.log(`deck.gl ${version} - ${STARTUP_MESSAGE}`);

  global.deck = global.deck || {
    VERSION: version,
    log
  };
}
