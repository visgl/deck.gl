// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  GreatCircleLayer,
  QuadkeyLayer,
  S2Layer,
  A5Layer,
  H3ClusterLayer,
  H3HexagonLayer,
  TripsLayer,
  GeohashLayer
  // KMLLayer
} from '@deck.gl/geo-layers';

import {gridDisk} from 'h3-js';

import {registerLoaders} from '@loaders.gl/core';
import {PLYLoader} from '@loaders.gl/ply';

import * as dataSamples from '../data-samples';

registerLoaders([PLYLoader]);

const GreatCircleLayerExample = {
  layer: GreatCircleLayer,
  getData: () => dataSamples.greatCircles,
  props: {
    id: 'greatCircleLayer',
    getSourcePosition: d => d.source,
    getTargetPosition: d => d.target,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    widthMinPixels: 5,
    pickable: true
  }
};

const GeohashLayerExample = {
  layer: GeohashLayer,
  props: {
    data: dataSamples.geohashes,
    opacity: 0.6,
    getGeohash: f => f.geohash,
    getFillColor: f => [f.value * 255, (1 - f.value) * 128, 0],
    getElevation: f => 100 * f.value,
    pickable: true
  }
};

const QuadkeyLayerExample = {
  layer: QuadkeyLayer,
  props: {
    data: dataSamples.quadkeys,
    opacity: 0.6,
    getQuadkey: f => f.quadkey,
    getFillColor: f => [f.value * 128, (1 - f.value) * 255, (1 - f.value) * 255, 180],
    getElevation: f => 100 * f.value,
    pickable: true
  }
};

const S2LayerExample = {
  layer: S2Layer,
  props: {
    data: dataSamples.s2cells,
    // data: ['14','1c','24','2c','34','3c'],
    opacity: 0.6,
    getS2Token: f => f.token,
    getFillColor: f => [f.value * 255, (1 - f.value) * 255, (1 - f.value) * 128, 128],
    getElevation: f => Math.random() * 1000,
    pickable: true
  }
};

const A5LayerExample = {
  layer: A5Layer,
  props: {
    data: dataSamples.pentagons,
    opacity: 0.6,
    getPentagon: f => f.pentagon,
    getFillColor: f => {
      const value = f.count / 211;
      return [(1 - value) * 235, 255 - 85 * value, 255 - 170 * value];
    },
    getElevation: f => f.count,
    elevationScale: 10,
    pickable: true
  }
};

const H3ClusterLayerExample = {
  layer: H3ClusterLayer,
  props: {
    data: ['882830829bfffff'],
    getHexagons: d => gridDisk(d, 6),
    getLineWidth: 100,
    stroked: true,
    filled: false
  }
};

const H3HexagonLayerExample = {
  layer: H3HexagonLayer,
  props: {
    // data: gridDisk('891c0000003ffff', 4), // Pentagon sample, [-143.478, 50.103]
    // data: compactCells(gridDisk('882830829bfffff', 8)), // Multi-resolution
    data: gridDisk('882830829bfffff', 4), // SF
    getHexagon: d => d,
    getFillColor: (d, {index}) => [255, index * 5, 0],
    getElevation: d => Math.random() * 1000
  }
};

const TripsLayerExample = {
  layer: TripsLayer,
  propTypes: {
    currentTime: {
      type: 'range',
      step: 12,
      min: 0,
      max: 1200
    },
    trailLength: {
      type: 'range',
      step: 12,
      min: 0,
      max: 1200
    }
  },
  props: {
    id: 'trips-layer',
    data: dataSamples.SFTrips,
    getPath: d => d.waypoints.map(p => p.coordinates),
    getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 5,
    rounded: true,
    trailLength: 600,
    currentTime: 500
  }
};

/* eslint-disable quote-props */
export default {
  'Geo Layers': {
    S2Layer: S2LayerExample,
    QuadkeyLayer: QuadkeyLayerExample,
    A5Layer: A5LayerExample,
    H3ClusterLayer: H3ClusterLayerExample,
    H3HexagonLayer: H3HexagonLayerExample,
    GreatCircleLayer: GreatCircleLayerExample,
    TripsLayer: TripsLayerExample,
    GeohashLayer: GeohashLayerExample
  }
};
