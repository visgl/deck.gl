// Set up deck.gl global state
import './init';

export {COORDINATE_SYSTEM} from './constants';

// Export core objects
export {default as Layer} from './layer';
export {default as AttributeManager} from './attribute-manager';
export {default as LayerManager} from './layer-manager';

// Object iteration helper
export * from './utils/object-iterator';
