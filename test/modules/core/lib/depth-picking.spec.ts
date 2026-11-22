// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {Deck, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import type {DeckProps, Layer} from '@deck.gl/core';
import {SolidPolygonLayer, BitmapLayer} from '@deck.gl/layers';

const SIZE = 400;
const LONGITUDE = -122.4;
const LATITUDE = 37.75;
const POLYGON_ALTITUDE = 100;

type TestViews = MapView | GlobeView;
type TestDeckProps = DeckProps<TestViews>;

function updateDeckProps(deck: Deck<TestViews>, props: TestDeckProps): Promise<void> {
  return new Promise(resolve => {
    deck.setProps({
      ...props,
      onAfterRender: () => {
        // @ts-expect-error private member
        if (!deck.layerManager.needsUpdate()) {
          resolve();
        }
      }
    });
  });
}

/** Largest |picked altitude - ground altitude| over a grid of pixels that hit the layer. */
async function measureAltitudeError(
  props: TestDeckProps,
  layer: Layer,
  groundAltitude: number
): Promise<number> {
  const deckProps = {width: SIZE, height: SIZE, useDevicePixels: false, ...props};
  const deck = new Deck(deckProps);
  await updateDeckProps(deck, {...deckProps, layers: [layer]});

  let maxError = 0;
  let hits = 0;
  for (let y = 20; y < SIZE; y += 40) {
    for (let x = 20; x < SIZE; x += 40) {
      const coordinate = (await deck.pickObjectAsync({x, y, unproject3D: true}))?.coordinate;
      if (coordinate?.length === 3) {
        hits++;
        maxError = Math.max(maxError, Math.abs(coordinate[2] - groundAltitude));
      }
    }
  }
  // @ts-expect-error protected member
  const ownedDevice = props.deviceProps && deck.device;
  deck.finalize();
  ownedDevice?.destroy();
  expect(hits, 'most grid pixels hit the layer').toBeGreaterThan(50);
  return maxError;
}

function getQuad(halfSize: number): [number, number, number][] {
  return [
    [LONGITUDE - halfSize, LATITUDE - halfSize, POLYGON_ALTITUDE],
    [LONGITUDE + halfSize, LATITUDE - halfSize, POLYGON_ALTITUDE],
    [LONGITUDE + halfSize, LATITUDE + halfSize, POLYGON_ALTITUDE],
    [LONGITUDE - halfSize, LATITUDE + halfSize, POLYGON_ALTITUDE]
  ];
}

function makePolygonLayer(halfSize: number) {
  return new SolidPolygonLayer({
    id: 'quad',
    data: [{polygon: getQuad(halfSize)}],
    getPolygon: d => d.polygon,
    getFillColor: [255, 0, 0],
    pickable: true
  });
}

function makeBitmapLayer(halfSize: number) {
  return new BitmapLayer({
    id: 'bitmap',
    image: new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1),
    bounds: [LONGITUDE - halfSize, LATITUDE - halfSize, LONGITUDE + halfSize, LATITUDE + halfSize],
    pickable: true
  });
}

const VIEWS: Record<string, {props: TestDeckProps; halfSize: number}> = {
  MapView: {
    props: {
      views: new MapView(),
      viewState: {longitude: LONGITUDE, latitude: LATITUDE, zoom: 12, pitch: 60, bearing: 30}
    },
    halfSize: 0.2
  },
  GlobeView: {
    props: {
      views: new GlobeView(),
      viewState: {longitude: LONGITUDE, latitude: LATITUDE, zoom: 14, pitch: 60, bearing: 30}
    },
    halfSize: 0.05
  }
};

const LAYERS: Record<string, [(halfSize: number) => Layer, number]> = {
  SolidPolygonLayer: [makePolygonLayer, POLYGON_ALTITUDE],
  BitmapLayer: [makeBitmapLayer, 0]
};

// The quads are a few large triangles that the camera sees at a steep angle, so the depth
// across each triangle is far from linear in its vertex attributes.
for (const [viewName, {props, halfSize}] of Object.entries(VIEWS)) {
  for (const [layerName, [makeLayer, groundAltitude]] of Object.entries(LAYERS)) {
    test(`depthPicking#${layerName} in a tilted ${viewName}`, async () => {
      const maxError = await measureAltitudeError(props, makeLayer(halfSize), groundAltitude);
      // Software rasterizers leave about 1 m of depth precision error at these zooms.
      expect(maxError, `picked altitude is within 2 m of the ground`).toBeLessThan(2);
    });
  }
}

test('depthPicking#BitmapLayer in a tilted MapView on WebGPU', async context => {
  if (!(await getWebGPUTestDevice())) return context.skip();
  const props = {
    ...VIEWS.MapView.props,
    deviceProps: {type: 'webgpu' as const, adapters: [webgpuAdapter]}
  };
  const maxError = await measureAltitudeError(props, makeBitmapLayer(VIEWS.MapView.halfSize), 0);
  expect(maxError, `picked altitude is within 2 m of the ground`).toBeLessThan(2);
});
