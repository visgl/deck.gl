// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

import {test, expect} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';
import {Proj4Projection} from '@math.gl/proj4';
import {WGS84ToPseudoMercator} from '@deck.gl/geo-layers/wms-layer/utils';
import {equals} from '@math.gl/core';

test.skip('WMSLayer', async t => {
  const testCases = generateLayerTests({
    Layer: WMSLayer,
    sampleProps: {
      data: 'https://ows.terrestris.de/osm/service',
      serviceType: 'wms',
      layers: ['OSM-WMS']
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });
  await testLayerAsync({Layer: WMSLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('EPSG:4326 -> EPSG:3857', () => {
  const projConverter = new Proj4Projection({from: 'EPSG:4326', to: 'EPSG:3857'});

  const testCases = [
    [-180, -85.06], // bound min
    [180, 85.06], // bound max
    [-122.45, 37.78], // SF
    [-0.122, 51.51], // London
    [-58.59, -34.62], // Buenos Aires
    [174.57, -36.86] // Aukland
  ];

  for (const coord of testCases) {
    const actual = WGS84ToPseudoMercator(coord);
    const expected = projConverter.project(coord);
    // console.log(actual);
    // console.log(expected);
    expect(equals(actual, expected), 'matches proj4 output').toBeTruthy();
  }
});
