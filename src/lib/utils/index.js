// Log
export {default as log} from './log';

// Object and array support
export {flatten, flattenVertices, fillArray} from './flatten';
export {compareProps, areEqualShallow} from './compare-objects';
export {compareArrays, checkArray} from './compare-arrays';

// FP64 and Color support
export {fp64ify} from './fp64';
export {parseColor} from './color';
export {getBlendMode, setBlendMode} from './blend';

// ES6 Container and Immutable support
export {get} from './get';
export {count} from './count';

// TBD - The Container API is too intrusive.
import * as Container from './container';
export {Container};
