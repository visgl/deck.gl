// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect} from 'vitest';
import {_CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {Proj4Projection} from '@math.gl/proj4';
import type {FeatureCollection, Polygon, MultiPolygon} from 'geojson';
import states from 'deck.gl-test/data/us-states.geo.json';
import capitals from 'deck.gl-test/data/us-state-capitals.geo.json';
import {runRenderTestSuite} from '../render-test-suite';
import {defaultOnAfterRender} from '../deck-test-utils';
import type {TestCase} from '../deck-test-utils';
import {WIDTH, HEIGHT} from '../constants';

// EPSG:5070 (NAD83 / Conus Albers). Keep Alaska at its projected location, not an inset.
const converter = new Proj4Projection({
  from: 'EPSG:4326',
  to: '+proj=aea +lat_0=23 +lon_0=-96 +lat_1=29.5 +lat_2=45.5 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs'
});
const projection = {forward: converter.project, inverse: converter.unproject};
// Fixed meter bounds enclose all 50 states, including Hawaii and the Aleutian Islands.
const view = new CustomProjectionView({
  projection,
  outputBounds: [-7400000, 0, 2600000, 6500000],

  resolution: 1
});
const data = states as FeatureCollection<
  Polygon | MultiPolygon,
  {STATE: string; NAME: string; STUSAB: string}
>;
const palette: [number, number, number][] = [
  [86, 158, 204],
  [145, 194, 219],
  [215, 229, 237],
  [246, 201, 137],
  [228, 145, 102]
];
const alaska = {position: [-150, 64], state: 'AK'};
const colorado = {position: [-105, 39], state: 'CO'};

function createLayers() {
  return [
    new GeoJsonLayer({
      id: 'us-states',
      data,
      filled: true,
      stroked: true,
      getFillColor: feature => palette[Number(feature.properties.STATE) % palette.length],
      getLineColor: [35, 48, 61],
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      pickable: true
    }),
    new GeoJsonLayer({
      id: 'us-capitals',
      data: capitals,
      pointType: 'circle',
      getFillColor: [165, 35, 45],
      getLineColor: [255, 255, 255],
      getPointRadius: 2.5,
      pointRadiusUnits: 'pixels',
      pointBillboard: true,
      getLineWidth: 1,
      lineWidthUnits: 'pixels'
    })
  ];
}

function checkPickedStates(probes: (typeof alaska)[]): TestCase['onAfterRender'] {
  return params =>
    defaultOnAfterRender({
      ...params,
      done: () => {
        const viewport = params.deck.getViewports()[0];
        for (const {position, state} of probes) {
          const [x, y] = viewport.project(viewport.preproject!(position));
          expect(x).toBeGreaterThan(0);
          expect(x).toBeLessThan(WIDTH);
          expect(y).toBeGreaterThan(0);
          expect(y).toBeLessThan(HEIGHT);
          // Synchronous picking is WebGL-only. Both backends compare the rendered geometry.
          if (params.deck.device?.type === 'webgl') {
            const picked = params.deck.pickObject({x, y, radius: 1, layerIds: ['us-states']});
            expect(picked?.object.properties.STUSAB, `pick ${state} in EPSG:5070`).toBe(state);
          }
        }
        params.done();
      }
    });
}

const testCases: TestCase[] = [
  {
    name: 'custom-projection-epsg5070-us-states',
    views: view,
    viewState: {center: [256, 256, 0], zoom: 0.15},
    layers: createLayers(),
    onAfterRender: checkPickedStates([alaska, colorado]),
    goldenImage: './test/render/golden-images/custom-projection-epsg5070-us-states.png'
  },
  {
    name: 'custom-projection-epsg5070-us-states-pitched',
    views: view,
    viewState: {center: [256, 256, 0], zoom: 0.15, pitch: 35, bearing: 20},
    layers: createLayers(),
    onAfterRender: checkPickedStates([alaska, colorado]),
    goldenImage: './test/render/golden-images/custom-projection-epsg5070-us-states-pitched.png'
  }
];

describe.each(['webgl', 'webgpu'] as const)(
  'CustomProjectionView / GeoJsonLayer / %s',
  deviceType => {
    runRenderTestSuite(testCases, deviceType, {
      beforeAll: () => {
        expect(data.features).toHaveLength(50);
        expect(new Set(data.features.map(feature => feature.properties.STATE)).size).toBe(50);
        expect(
          data.features.find(feature => feature.properties.STUSAB === 'AK')?.geometry.type
        ).toBe('MultiPolygon');
        expect(data.features.some(feature => feature.properties.STUSAB === 'HI')).toBe(true);
      }
    });
  }
);
