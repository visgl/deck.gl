// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapView, OrthographicView} from '@deck.gl/core';
import type {Layer, View} from '@deck.gl/core';

/**
 * Build multi-view configuration.
 * Returns views for: main map (synced with basemap), minimap, orthographic overlay.
 */
export function buildViews(): View[] {
  return [
    // Orthographic view for text overlay (static, no controller)
    new OrthographicView({
      id: 'ortho',
      controller: false,
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
      flipY: true
    }),
    // Minimap in bottom-right corner with OSM tiles
    new MapView({
      id: 'minimap',
      x: '75%',
      y: '75%',
      width: '25%',
      height: '25%',
      controller: true
    })
  ];
}

/**
 * Layer filter for multi-view mode.
 * Routes layers to appropriate viewports.
 *
 * Uses exclusion logic since MapboxOverlay's internal viewport ID varies.
 */
export function getMultiViewLayerFilter({layer, viewport}: {layer: Layer; viewport: any}): boolean {
  const viewportId = viewport.id;

  // OSM tiles only in minimap
  if (layer.id === 'osm-tiles') {
    return viewportId === 'minimap';
  }

  // Text layer only in orthographic view
  if (layer.id === 'example-name-text') {
    return viewportId === 'ortho';
  }

  // Main visualization layers should appear in the main map view - exclude from ortho and minimap
  const mainLayers = ['airports', 'arcs', 'stress-test', 'city-icons', 'city-labels'];
  if (mainLayers.includes(layer.id)) {
    return viewportId !== 'ortho' && viewportId !== 'minimap';
  }

  // Default: show in main map view (not ortho/minimap)
  return viewportId !== 'ortho' && viewportId !== 'minimap';
}
