// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoJsonLayer, ArcLayer, TextLayer} from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';
import type {Layer} from '@deck.gl/core';
import type {Basemap, StressTest} from '../types';
import {buildStressTestLayer} from './stress-test';

// Data URLs
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
const LONDON_COORDINATES: [number, number] = [-0.4531566, 51.4709959];

type LayerBuildOptions = {
  basemap: Basemap;
  interleaved: boolean;
  globe: boolean;
  multiView: boolean;
  stressTest: StressTest;
};

/**
 * Get interleaved layer positioning props based on basemap.
 */
function getInterleavedProps(basemap: Basemap, interleaved: boolean): Record<string, any> {
  if (!interleaved) {
    return {};
  }

  switch (basemap) {
    case 'mapbox':
      return {slot: 'middle'};
    case 'maplibre':
      return {beforeId: 'watername_ocean'};
    case 'google-maps':
      // Google Maps doesn't support slot/beforeId
      return {};
    default:
      return {};
  }
}

/**
 * Build all layers based on current dimensions.
 * Single source of truth for layer configuration.
 */
export function buildLayers(options: LayerBuildOptions): Layer[] {
  const {basemap, interleaved, globe, multiView, stressTest} = options;

  const interleavedProps = getInterleavedProps(basemap, interleaved);

  // Arc layer needs cullMode: 'none' for globe projection
  const arcParameters = globe ? {cullMode: 'none' as const} : undefined;

  // Base visualization layers
  const baseLayers: Layer[] = [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: (f: any) => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true,
      ...interleavedProps
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: (d: any) => d.features.filter((f: any) => f.properties.scalerank < 4),
      getSourcePosition: () => LONDON_COORDINATES,
      getTargetPosition: (f: any) => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1,
      parameters: arcParameters,
      ...interleavedProps
    })
  ];

  // Add stress test layer if enabled
  const stressTestLayer = buildStressTestLayer(stressTest, basemap, interleaved);
  if (stressTestLayer) {
    baseLayers.push(stressTestLayer);
  }

  // Single view mode - return base layers only
  if (!multiView) {
    return baseLayers;
  }

  // Multi-view mode - add additional layers
  return [
    // OSM tile layer for minimap
    new TileLayer({
      id: 'osm-tiles',
      data: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: props => {
        const {boundingBox} = props.tile;
        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
        });
      }
    }),
    ...baseLayers,
    // Text layer for orthographic view (rendered on top, not interleaved)
    new TextLayer({
      id: 'example-name-text',
      data: [{position: [0, 0, 0], text: 'Basemap Browser'}],
      getPosition: (d: any) => d.position,
      getText: (d: any) => d.text,
      getSize: 24,
      getColor: [255, 255, 255, 255],
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      background: true,
      getBackgroundColor: [0, 0, 0, 200],
      backgroundPadding: [6, 3],
      // Disable culling for globe projection
      parameters: {cullMode: 'none'}
    })
  ];
}
