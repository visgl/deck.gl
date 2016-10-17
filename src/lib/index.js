export {default as Layer} from './layer';
export {default as AttributeManager} from './attribute-manager';
export {default as LayerManager} from './layer-manager';

export * from '../shader-utils';

// Version detection
import {version} from '../../package.json';

const STARTUP_MESSAGE = 'set luma.log.priority=2 to trace attribute updates';

/* global console */
/* eslint-disable no-console */
console.log(`deck.gl ${version} - ${STARTUP_MESSAGE}`);
