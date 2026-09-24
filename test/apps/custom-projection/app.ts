// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, _CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import type {FeatureCollection, LineString} from 'geojson';
import type {ProjectionName} from './projections';
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {projections} from './projections';

// The same Natural Earth datasets as examples/get-started/pure-js/basic.
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';
const AIRPORTS = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const GEOMETRY_TRANSITION = {
  duration: 1000
};

const graticules: FeatureCollection<LineString> = {type: 'FeatureCollection', features: []};
for (let longitude = -180; longitude <= 180; longitude += 15) {
  graticules.features.push({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [longitude, -90],
        [longitude, 90]
      ]
    }
  });
}
for (let latitude = -90; latitude <= 90; latitude += 15) {
  graticules.features.push({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [-180, latitude],
        [0, latitude],
        [180, latitude]
      ]
    }
  });
}

function createView(name: ProjectionName): CustomProjectionView {
  const {projection, fromCrs, toCrs, fromBounds, toBounds, note} = projections[name];
  document.getElementById('projection-note')!.textContent = note;
  return new CustomProjectionView({
    fromCrs,
    toCrs,
    projection,
    fromBounds,
    toBounds,
    resolution: 5,
    controller: true
  });
}

// Equal physical radii at regularly spaced input coordinates expose local scale
// variation without relying on the remote datasets.
const scaleProbes: [number, number][] = [];
for (let longitude = -165; longitude <= 165; longitude += 30) {
  for (let latitude = -75; latitude <= 75; latitude += 15) {
    scaleProbes.push([longitude, latitude]);
  }
}

const deck = new Deck({
  views: createView('equalEarth'),
  initialViewState: {center: [256, 256, 0], zoom: 0.8, pitch: 0, bearing: 0},
  layers: [
    new GeoJsonLayer({
      id: 'countries',
      transitions: {geometry: GEOMETRY_TRANSITION},
      data: COUNTRIES,
      filled: true,
      stroked: true,
      getFillColor: [50, 100, 120],
      getLineColor: [150, 195, 200],
      lineWidthUnits: 'meters',
      getLineWidth: 12000,
      pickable: true
    }),
    new GeoJsonLayer({
      id: 'graticules',
      transitions: {geometry: GEOMETRY_TRANSITION},
      data: graticules,
      getLineColor: [140, 170, 200, 100],
      lineWidthUnits: 'pixels',
      getLineWidth: 1
    }),
    new GeoJsonLayer({
      id: 'airports',
      transitions: {geometry: GEOMETRY_TRANSITION},
      data: AIRPORTS,
      pointRadiusUnits: 'meters',
      getPointRadius: 25000,
      getFillColor: [255, 170, 80],
      pickable: true
    }),
    new ScatterplotLayer({
      id: 'meter-scale-probes',
      data: scaleProbes,
      getPosition: position => position,
      radiusUnits: 'meters',
      getRadius: 80000,
      getFillColor: [255, 80, 150, 180],
      pickable: true
    })
  ],
  onHover: ({coordinate}) => {
    document.getElementById('coordinates')!.textContent = coordinate
      ? `${coordinate[0].toFixed(3)}°, ${coordinate[1].toFixed(3)}°`
      : 'Outside projection';
  }
});
// Expose the instance for inspecting projection and picking in this development app.
(globalThis as typeof globalThis & {deck: typeof deck}).deck = deck;

const projectionSelect = document.getElementById('projection') as HTMLSelectElement;
projectionSelect.addEventListener('change', () => {
  const name = projectionSelect.value;
  if (Object.hasOwn(projections, name)) {
    deck.setProps({views: createView(name as ProjectionName)});
  }
});
