// Set up deck.gl global state
import './init';

export {COORDINATE_SYSTEM} from './constants';

// Export core objects
export {default as Layer} from './layer';
export {default as CompositeLayer} from './composite-layer';
export {default as AttributeManager} from './attribute-manager';
export {default as LayerManager} from './layer-manager';

// Ability to extract data from ES6 containers (Maps, Immutable.maps etc)
export {get} from './utils/container';

// Object iteration helper
export {count, values, isKeyedContainer, keys, entries} from './utils/container';
