// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * This file should be included in another bundle if @deck.gl/layers is expected as a peer dependency
 */

/* eslint-disable */ // import/no-extraneous-dependencies

// Check if @deck.gl/core is present
import {GeoJsonLayer} from '@deck.gl/layers';

if (!GeoJsonLayer) {
  throw new Error('@deck.gl/layers is not found');
}

// Re-export all endpoints so that new exports add to the global namespace, not overwrite it
export * from '@deck.gl/layers';
