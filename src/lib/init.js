// Version detection
import {version} from '../../package.json';

const STARTUP_MESSAGE = 'set deck.log.priority=2 to trace attribute updates';

/* global console */
/* eslint-disable no-console */
console.log(`deck.gl ${version} - ${STARTUP_MESSAGE}`);
