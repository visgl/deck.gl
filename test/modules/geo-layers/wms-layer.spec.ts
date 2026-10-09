// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

import {test, expect} from 'vitest';
import {generateLayerTests, testInitializeLayer, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {COORDINATE_SYSTEM, WebMercatorViewport} from '@deck.gl/core';
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';
import type {ImageSource} from '@loaders.gl/wms';
import type {GetImageParameters, ImageSourceMetadata, ImageType} from '@loaders.gl/loader-utils';
import {Projection} from '@math.gl/projection';
import {WGS84ToPseudoMercator} from '@deck.gl/geo-layers/wms-layer/utils';
import {equals} from '@math.gl/core';

test.skip('WMSLayer', async () => {
  const testCases = generateLayerTests({
    Layer: WMSLayer,
    sampleProps: {
      data: 'https://ows.terrestris.de/osm/service',
      serviceType: 'wms',
      layers: ['OSM-WMS']
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });
  await testLayerAsync({Layer: WMSLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('EPSG:4326 -> EPSG:3857', () => {
  const projConverter = new Projection({from: 'EPSG:4326', to: 'EPSG:3857'});

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
    expect(equals(actual, expected), 'matches projection output').toBeTruthy();
  }
});

/** Returns an image source that records each GetMap request instead of fetching. */
function createRecordingImageSource() {
  const requests: GetImageParameters[] = [];
  const imageSource = {
    async getMetadata(): Promise<ImageSourceMetadata> {
      return {name: 'recording', keywords: [], layers: []};
    },
    async getImage(parameters: GetImageParameters): Promise<ImageType> {
      requests.push(parameters);
      // The layer only passes the image through to BitmapLayer.
      return {width: 10, height: 10} as unknown as ImageType;
    }
  } as unknown as ImageSource;
  return {imageSource, requests};
}

test('WMSLayer positions an EPSG:4326 image in LNGLAT coordinates', async () => {
  const viewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -72,
    latitude: 40,
    zoom: 6
  });
  const {imageSource, requests} = createRecordingImageSource();
  const layer = new WMSLayer({
    id: 'wms-epsg-4326',
    data: imageSource,
    layers: ['test-layer'],
    srs: 'EPSG:4326'
  });
  const {finalize} = testInitializeLayer({
    layer,
    viewport,
    finalize: false,
    onError: error => expect(error).toBeFalsy()
  });
  try {
    // Request the image directly instead of waiting for the debounced initial load.
    clearTimeout((layer.state as any)._timeoutId);
    await layer.loadImage(viewport, 'test');
    expect(requests.map(request => request.crs)).toEqual(['EPSG:4326']);

    const bitmapLayer = layer.renderLayers() as any;
    expect(bitmapLayer.props._imageCoordinateSystem).toBe(COORDINATE_SYSTEM.LNGLAT);
  } finally {
    finalize();
  }
});
