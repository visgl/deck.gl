// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Import from package name instead of relative path
// This will be resolved to src or dist by esbuild depending on bundle settings
// dist has TS transformers applied
/* eslint-disable import/no-extraneous-dependencies */
import * as CartoUtils from '@deck.gl/carto';

export * from '../layers/bundle/peer-dependency';

export const carto = CartoUtils;

// Export CARTO library for pydeck integration.
// More info: https://github.com/ajduberstein/pydeck_custom_layer
globalThis.CartoLibrary = CartoUtils;
