// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoJsonLayer, ArcLayer, TextLayer, IconLayer} from '@deck.gl/layers';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';

// Icon atlas for markers
const ICON_ATLAS =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png';
const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, anchorY: 128, mask: true}
};
import type {Layer} from '@deck.gl/core';
import type {Basemap, StressTest} from '../types';
import {buildStressTestLayer} from './stress-test';
import {getInterleavedProps} from './interleaved';

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
 * Build all layers based on current dimensions.
 * Single source of truth for layer configuration.
 */
export function buildLayers(options: LayerBuildOptions): Layer[] {
  const {basemap, interleaved, globe, multiView, stressTest} = options;

  const interleavedProps = getInterleavedProps(basemap, interleaved);

  // Arc layer needs cullMode: 'none' for globe projection
  const arcParameters = globe ? {cullMode: 'none' as const} : undefined;

  // Sample city data for IconLayer and TextLayer
  const cities = [
    {name: 'London', coordinates: [-0.1276, 51.5074]},
    {name: 'Paris', coordinates: [2.3522, 48.8566]},
    {name: 'Berlin', coordinates: [13.405, 52.52]},
    {name: 'Madrid', coordinates: [-3.7038, 40.4168]},
    {name: 'Rome', coordinates: [12.4964, 41.9028]}
  ];

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
    }),
    new IconLayer({
      id: 'city-icons',
      data: cities,
      iconAtlas: ICON_ATLAS,
      iconMapping: ICON_MAPPING,
      getIcon: () => 'marker',
      getPosition: (d: any) => d.coordinates,
      getSize: 40,
      getColor: [0, 140, 255],
      pickable: true,
      ...interleavedProps
    }),
    new TextLayer({
      id: 'city-labels',
      data: cities,
      getPosition: (d: any) => d.coordinates,
      getText: (d: any) => d.name,
      getSize: 16,
      getColor: [255, 255, 255],
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'top',
      getPixelOffset: [0, 20],
      background: true,
      getBackgroundColor: [0, 0, 0, 180],
      backgroundPadding: [4, 2],
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
