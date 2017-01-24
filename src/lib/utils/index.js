import * as Container from './container';
export {Container};
export {count, get, values, isKeyedContainer, keys, entries, map} from './container';
export {flatten, flattenVertices, fillArray} from './flatten';
export * from './compare-objects';
export {compareArrays, checkArray} from './compare-arrays';
export {getGeojsonFeatures, featureToPolygons} from './geojson';
export {default as log} from './log';
export * from './fp64';

// deprecated
export {normalizeGeojson, extractPolygons} from './geojson';

