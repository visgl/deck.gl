// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

import test from 'tape-promise/tape';
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
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: WMSLayer, testCases, onError: t.notOk});
  t.end();
});

test('EPSG:4326 -> EPSG:3857', t => {
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
    // t.comment(actual);
    // t.comment(expected);
    t.ok(equals(actual, expected), 'matches proj4 output');
  }

  t.end();
});
