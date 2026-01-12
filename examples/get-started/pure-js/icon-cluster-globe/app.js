// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';
import {SolidPolygonLayer, GeoJsonLayer, IconClusterLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 20,
  longitude: 30,
  zoom: 0.5
};

// Generate random points around the globe for clustering
function generateGlobalPoints(count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const longitude = Math.random() * 360 - 180;
    const latitude = (Math.asin(Math.random() * 2 - 1) * 180) / Math.PI;

    points.push({
      coordinates: [longitude, latitude],
      id: i,
      value: Math.floor(Math.random() * 100)
    });
  }
  return points;
}

const clusterData = generateGlobalPoints(1000);

new Deck({
  views: new GlobeView(),
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  parameters: {
    // cull: true
  },
  layers: [
    // Background
    new SolidPolygonLayer({
      id: 'background',
      data: [
        [
          [-180, 90],
          [0, 90],
          [180, 90],
          [180, -90],
          [0, -90],
          [-180, -90]
        ]
      ],
      opacity: 0.5,
      getPolygon: d => d,
      stroked: false,
      filled: true,
      getFillColor: [5, 10, 40]
    }),

    // Countries
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      getLineColor: [5, 10, 40],
      getFillColor: [15, 40, 80]
    }),

    // IconClusterLayer with text-based counts
    new IconClusterLayer({
      id: 'clusters',
      data: clusterData,
      getPosition: d => d.coordinates,
      pickable: true,

      // Clustering parameters
      clusterRadius: 80,
      clusterMaxZoom: 16,

      // Dynamic clustering: cluster counts decrement as points leave viewport
      // Toggle this to see the difference - true = more accurate, false = better performance
      dynamicClustering: true,

      // Scale cluster size by point count - larger clusters = bigger circles
      sizeByCount: true,

      // Cluster styling - blue circles
      clusterFillColor: [51, 102, 204, 220],
      clusterTextColor: [255, 255, 255, 255],
      clusterRadiusScale: 1,
      clusterRadiusMinPixels: 20,
      clusterRadiusMaxPixels: 80,

      // Individual point styling - orange dots
      pointFillColor: [255, 140, 0, 220],
      pointRadiusMinPixels: 5,
      pointRadiusMaxPixels: 15,

      // Text styling
      fontFamily: 'Monaco, monospace',
      fontWeight: 'bold'
    })
  ],

  getTooltip: ({object, objects}) => {
    if (objects) {
      return `Cluster: ${objects.length} points`;
    } else if (object) {
      return `Point ${object.id}: Value ${object.value}`;
    }
    return null;
  }
});
