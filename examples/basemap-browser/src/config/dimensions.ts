// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Dimensions, InitialViewState, MultiViewState} from '../types';

/**
 * Default dimension values.
 */
export const DEFAULT_DIMENSIONS: Dimensions = {
  basemap: 'maplibre',
  framework: 'react',
  interleaved: true,
  batched: true,
  globe: false,
  multiView: false,
  billboard: true,
  stressTest: 'none'
};

/**
 * Default view state for single-view mode.
 */
const DEFAULT_VIEW_STATE: InitialViewState = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

/**
 * Default view state for globe mode (zoom 0 to show full globe).
 */
const GLOBE_VIEW_STATE: InitialViewState = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 0,
  bearing: 0,
  pitch: 0
};

/**
 * Multi-view state with separate states for each view.
 */
const MULTI_VIEW_STATE: MultiViewState = {
  // Main map view (syncs with basemap)
  mapbox: {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 4,
    bearing: 0,
    pitch: 30
  },
  // Minimap view
  minimap: {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 4,
    bearing: 0,
    pitch: 0
  },
  // Orthographic overlay view (zoom out to show text in corner)
  ortho: {
    target: [0, 0, 0],
    zoom: 0
  }
};

/**
 * Multi-view state for globe mode (GlobeView doesn't support pitch/bearing).
 */
const GLOBE_MULTI_VIEW_STATE: MultiViewState = {
  // GlobeView for main view (no pitch/bearing)
  globe: {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 0
  },
  // Also provide mapbox key for basemap renderers with globe projection
  mapbox: {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 0,
    bearing: 0,
    pitch: 0
  },
  // Minimap view
  minimap: {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 4,
    bearing: 0,
    pitch: 0
  },
  // Orthographic overlay view (zoom out to show text in corner)
  ortho: {
    target: [0, 0, 0],
    zoom: 0
  }
};

/**
 * Get initial view state based on dimensions.
 */
export function getInitialViewState(
  globe: boolean,
  multiView: boolean
): InitialViewState | MultiViewState {
  if (multiView && globe) {
    return GLOBE_MULTI_VIEW_STATE;
  }
  if (multiView) {
    return MULTI_VIEW_STATE;
  }
  if (globe) {
    return GLOBE_VIEW_STATE;
  }
  return DEFAULT_VIEW_STATE;
}

/**
 * Extract base map view state from multi-view or single-view state.
 * In multi-view mode, the 'mapbox' key contains the main map view state.
 */
export function getBaseMapViewState(
  initialViewState: InitialViewState | MultiViewState
): InitialViewState {
  if (initialViewState && typeof initialViewState === 'object' && 'mapbox' in initialViewState) {
    return initialViewState.mapbox as InitialViewState;
  }
  return initialViewState as InitialViewState;
}
