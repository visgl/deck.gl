import * as CartoUtils from './src';

export * from '../layers/bundle/peer-dependency';

export const carto = CartoUtils;

// Export carto layer library for pydeck integration
// More info: https://github.com/ajduberstein/pydeck_custom_layer
globalThis.CartoLayerLibrary = CartoUtils;
