// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Dimensions, Config, ViewStateChangeCallback} from '../types';
import {validateDimensions} from './validation';
import {buildLayers} from './layers';
import {buildViews, getMultiViewLayerFilter} from './views';
import {getMapStyle} from './styles';
import {getInitialViewState} from './dimensions';

/**
 * Central configuration builder.
 *
 * Takes user-selected dimensions and produces a complete render configuration.
 *
 * Responsibilities:
 * 1. Validate dimension combinations (warnings only, no auto-correct)
 * 2. Generate layers appropriate for all dimensions
 * 3. Compute view state (single or multi-view)
 * 4. Return complete config with validation warnings
 */
export function buildConfig(
  dimensions: Dimensions,
  onViewStateChange?: ViewStateChangeCallback
): Config {
  const {basemap, framework, interleaved, batched, globe, multiView, stressTest} = dimensions;

  // Validate dimensions (warnings only)
  const validation = validateDimensions(dimensions);

  // Compute map style
  const mapStyle = getMapStyle(basemap);

  // Build layers with all dimension context
  const layers = buildLayers({
    basemap,
    interleaved,
    globe,
    multiView,
    stressTest
  });

  // Compute view state
  const initialViewState = getInitialViewState(globe, multiView);

  // Build multi-view configuration if needed
  const views = multiView ? buildViews() : undefined;
  const layerFilter = multiView ? getMultiViewLayerFilter : undefined;

  return {
    // Pass through dimensions
    basemap,
    framework,
    interleaved,
    batched,
    globe,
    multiView,
    stressTest,

    // Computed configuration
    mapStyle,
    initialViewState,
    layers,

    // Multi-view specific
    views,
    layerFilter,

    // Callbacks
    onViewStateChange,

    // Validation
    validation
  };
}
