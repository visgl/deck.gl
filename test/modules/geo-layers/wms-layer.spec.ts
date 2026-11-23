// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license

import {test, expect, vi} from 'vitest';
import {generateLayerTests, testInitializeLayer, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {
  _CustomProjectionView as CustomProjectionView,
  WebMercatorViewport,
  log
} from '@deck.gl/core';
import type {Viewport} from '@deck.gl/core';
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';
import type {WMSLayerProps} from '@deck.gl/geo-layers';
import type {BitmapLayer} from '@deck.gl/layers';
import {WMSImageSource} from '@loaders.gl/ogc/wms';
import type {ImageSource} from '@loaders.gl/ogc/wms';
import type {
  GetImageParameters,
  ImageSourceMetadata,
  ImageType
} from '@loaders.gl/core/loader-utils';
import {projectionEngine} from '@math.gl/geospatial/projection';
import {WGS84ToPseudoMercator} from '@deck.gl/geo-layers/wms-layer/utils';
import {equals} from '@math.gl/core/matrix';

/** PROJ definition of the ETRS89 / LAEA Europe CRS. */
const LAEA_CRS = '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m';

test.each([undefined, 'wms'] as const)('WMSLayer creates a URL source (%s)', serviceType => {
  const data = 'https://example.com/maps';
  const loadOptions = {wms: {wmsParameters: {version: '1.1.1'}}};
  const layer = new WMSLayer(serviceType ? {data, loadOptions, serviceType} : {data, loadOptions});

  const source = layer._createImageSource(layer.props);
  expect(source).toBeInstanceOf(WMSImageSource);
  expect(source).toMatchObject({wmsParameters: {version: '1.1.1'}});
});

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
  const projConverter = projectionEngine.createProjection({from: 'EPSG:4326', to: 'EPSG:3857'});

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

/** Mount a WMS layer and let the test request images without waiting for the debounce. */
function initializeRecordingLayer(viewport: Viewport, srs?: WMSLayerProps['srs']) {
  const {imageSource, requests} = createRecordingImageSource();
  const layer = new WMSLayer({
    data: imageSource,
    layers: ['test-layer'],
    srs
  });
  const {finalize} = testInitializeLayer({
    layer,
    viewport,
    finalize: false,
    onError: error => expect(error).toBeFalsy()
  });
  clearTimeout(layer.state._timeoutId);
  return {layer, requests, finalize};
}

test.each(['EPSG:4326', 'auto'] as const)('WMSLayer in Web Mercator with srs %s', async srs => {
  const viewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -72,
    latitude: 40,
    zoom: 6
  });
  const {layer, requests, finalize} = initializeRecordingLayer(viewport, srs);
  try {
    await layer.loadImage(viewport, 'test');
    const bounds = viewport.getBounds();
    const min: [number, number] = [bounds[0], bounds[1]];
    const max: [number, number] = [bounds[2], bounds[3]];
    expect(requests).toEqual([
      {
        crs: srs === 'auto' ? 'EPSG:3857' : 'EPSG:4326',
        width: 800,
        height: 600,
        layers: ['test-layer'],
        boundingBox:
          srs === 'auto' ? [WGS84ToPseudoMercator(min), WGS84ToPseudoMercator(max)] : [min, max]
      }
    ]);
    expect(layer.renderLayers().props).toMatchObject({
      bounds,
      coordinateSystem: 'default',
      _imageCoordinateSystem: srs === 'auto' ? 'cartesian' : 'lnglat'
    });
  } finally {
    finalize();
  }
});

test.each([
  {
    crs: 'EPSG:32632',
    srs: 'auto',
    center: [9, 45, 0],
    zoom: 8,
    // UTM zone 32N's central meridian at 45°N, with a 305.75 m/pixel view scale.
    bounds: [377701, 4891226, 622299, 5074675],
    width: 800,
    height: 600
  },
  {
    crs: 'EPSG:32648',
    srs: 'EPSG:32648',
    center: [105, 45, 0],
    zoom: 6,
    // The UTM zone clamps the horizontal span to about 668 km at 1223 m/pixel.
    bounds: [166021, 4616052, 833979, 5349848],
    width: 546,
    height: 600
  },
  {
    crs: LAEA_CRS,
    srs: 'EPSG:3035',
    center: [10, 52, 0],
    zoom: 5,
    // LAEA false origin at the center, with a 2446 m/pixel view scale.
    bounds: [3342606, 2476205, 5299394, 3943795],
    width: 800,
    height: 600
  },
  {
    crs: '+proj=eqc +R=6378137 +units=m',
    srs: 'EPSG:4087',
    center: [0, 0, 0],
    zoom: 0,
    // The viewport extends past the projection's global bounds on all four sides.
    bounds: [-20037508, -10018754, 20037508, 10018754],
    width: 512,
    height: 256
  }
])(
  'WMSLayer requests and places native imagery in $crs',
  async ({crs, srs, center, zoom, bounds, width, height}) => {
    const view = new CustomProjectionView({crs, resolution: 16});
    await view.initialize();
    const viewport = view.makeViewport({
      width: 800,
      height: 600,
      viewState: {center: center as [number, number, number], zoom}
    })!;
    const {layer, requests, finalize} = initializeRecordingLayer(viewport, srs);
    const warn = vi.spyOn(log, 'warn').mockReturnValue(() => {});
    try {
      await layer.loadImage(viewport, 'test');
      expect(warn).not.toHaveBeenCalled();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatchObject({
        crs: srs === 'auto' ? crs : srs,
        width,
        height,
        layers: ['test-layer']
      });
      const requestedBounds = requests[0].boundingBox.flat();
      requestedBounds.forEach((value, axis) => expect(value).toBeCloseTo(bounds[axis], -1));
      if (zoom === 0) {
        expect(requestedBounds).toEqual(
          viewport.crs.renderingBounds.flatMap(point => point.slice(0, 2))
        );
      }
      const bitmap = layer.renderLayers() as BitmapLayer;
      expect(bitmap.props).toMatchObject({
        bounds: requestedBounds,
        coordinateSystem: viewport.crs.signature,
        _imageCoordinateSystem: 'default'
      });
      expect(viewport.getPreprojection(viewport.crs).preproject).toBeNull();
    } finally {
      warn.mockRestore();
      finalize();
    }
  }
);

test('WMSLayer covers visible ground below the horizon at high pitch', async () => {
  const crs = '+proj=eqc +R=6378137 +units=m';
  const view = new CustomProjectionView({crs});
  await view.initialize();
  const viewport = view.makeViewport({
    width: 800,
    height: 600,
    viewState: {center: [0, 0, 0], zoom: 8, pitch: 80}
  })!;
  const {layer, requests, finalize} = initializeRecordingLayer(viewport, 'EPSG:4087');
  try {
    await layer.loadImage(viewport, 'test');
    expect(requests).toHaveLength(1);
    const [[, minY], [, maxY]] = requests[0].boundingBox;
    const [, , nearDepth] = viewport.project([0, 20, 0]);
    const [, , farDepth] = viewport.project([0, 25, 0]);
    expect(nearDepth).toBeLessThan(1);
    expect(farDepth).toBeGreaterThan(1);
    expect(minY).toBeLessThan(0);
    expect(maxY).toBeGreaterThan(viewport.crs.converter.WGS84.from([0, 20, 0])[1]);
    expect(maxY).toBeLessThan(viewport.crs.converter.WGS84.from([0, 25, 0])[1]);
  } finally {
    finalize();
  }
});

test.each([
  {srs: 'auto', crs: LAEA_CRS, center: [10, 52, 0], warns: false},
  {srs: 'EPSG:4326', crs: 'EPSG:32632', center: [9, 45, 0], warns: false},
  {srs: 'EPSG:4326', crs: LAEA_CRS, center: [10, 52, 0], warns: false},
  {srs: 'EPSG:3857', crs: 'EPSG:32632', center: [9, 45, 0], warns: true},
  {srs: 'EPSG:3857', crs: LAEA_CRS, center: [10, 52, 0], warns: true},
  {srs: 'EPSG:3035', crs: 'EPSG:32632', center: [9, 45, 0], warns: true}
])(
  'WMSLayer requests EPSG:4326 with srs $srs in a $crs view',
  async ({srs, crs, center, warns}) => {
    const view = new CustomProjectionView({crs});
    await view.initialize();
    const viewport = view.makeViewport({
      width: 800,
      height: 600,
      viewState: {center: center as [number, number, number], zoom: 5}
    })!;
    const {layer, requests, finalize} = initializeRecordingLayer(viewport, srs);
    const warn = vi.spyOn(log, 'warn').mockReturnValue(() => {});
    try {
      await layer.loadImage(viewport, 'test');
      await layer.loadImage(viewport, 'test');
      expect(warn).toHaveBeenCalledTimes(warns ? 1 : 0);
      if (warns) {
        expect(warn).toHaveBeenCalledWith(expect.stringContaining(`srs ${srs}`));
      }
      const bounds = viewport.getBounds();
      expect(requests).toHaveLength(2);
      for (const request of requests) {
        expect(request).toMatchObject({
          crs: 'EPSG:4326',
          width: 800,
          height: 600,
          boundingBox: [bounds.slice(0, 2), bounds.slice(2)]
        });
      }
      expect(layer.renderLayers().props).toMatchObject({
        bounds,
        coordinateSystem: 'default',
        _imageCoordinateSystem: 'lnglat'
      });
    } finally {
      warn.mockRestore();
      finalize();
    }
  }
);
