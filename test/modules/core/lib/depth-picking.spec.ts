// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {Deck, MapView, _GlobeView as GlobeView, GlobeViewport} from '@deck.gl/core';
import type {DeckProps, Layer} from '@deck.gl/core';
import {SolidPolygonLayer, BitmapLayer, ScatterplotLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

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

// A filled circle whose wide dashed stroke covers most of it. The stroke gaps take the fill
// color through a second picking filter call in PathStyleExtension.
function makeDashedCircleLayer(halfSize: number) {
  // Small enough that the view holds several dashes and gaps.
  const radius = halfSize * 14e3;
  return new ScatterplotLayer({
    id: 'dashed-circle',
    data: [{position: [LONGITUDE, LATITUDE, POLYGON_ALTITUDE]}],
    getPosition: d => d.position,
    getRadius: radius,
    getLineWidth: radius * 0.9,
    stroked: true,
    filled: true,
    getFillColor: [0, 0, 255],
    getLineColor: [255, 0, 0],
    getDashArray: [0.4, 0.6],
    extensions: [new PathStyleExtension({dash: true})],
    pickable: true
  });
}

const LAYERS: Record<string, [(halfSize: number) => Layer, number]> = {
  SolidPolygonLayer: [makePolygonLayer, POLYGON_ALTITUDE],
  BitmapLayer: [makeBitmapLayer, 0],
  'ScatterplotLayer with dash gaps': [makeDashedCircleLayer, POLYGON_ALTITUDE]
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

// GlobeView draws with a GlobeViewport only at zoom 12 and below. Above that it falls back to
// a WebMercatorViewport, which the tilted GlobeView cases above use.
const GLOBE_ZOOM = 11;
// The nadir views look straight down at each picked point at the highest GlobeViewport zoom.
const GLOBE_NADIR_ZOOM = 12;
const GLOBE_GRID_HALF_SIZE = 0.5;
// Each flat 0.01 degree cell is at most 5 cm below the sphere through its corners.
const GLOBE_GRID_CELL_SIZE = 0.01;

function makeGlobeGridLayer() {
  const cells: {polygon: [number, number, number][]}[] = [];
  const size = GLOBE_GRID_CELL_SIZE;
  const cellCount = Math.round((2 * GLOBE_GRID_HALF_SIZE) / size);
  for (let i = 0; i < cellCount; i++) {
    for (let j = 0; j < cellCount; j++) {
      const lng = LONGITUDE - GLOBE_GRID_HALF_SIZE + i * size;
      const lat = LATITUDE - GLOBE_GRID_HALF_SIZE + j * size;
      cells.push({
        polygon: [
          [lng, lat, POLYGON_ALTITUDE],
          [lng + size, lat, POLYGON_ALTITUDE],
          [lng + size, lat + size, POLYGON_ALTITUDE],
          [lng, lat + size, POLYGON_ALTITUDE]
        ]
      });
    }
  }
  return new SolidPolygonLayer({
    id: 'globe-grid',
    data: cells,
    getPolygon: d => d.polygon,
    getFillColor: [255, 0, 0],
    pickable: true
  });
}

// The software rasterizer evaluates the sin and cos of the globe projection to about 4e-5, which
// moves the drawn surface hundreds of meters off its nominal altitude. So the reference is the
// drawn surface, picked from straight above each point, where the picked depth does not depend
// on how depth varies across a tilted triangle.
test('depthPicking#SolidPolygonLayer in a tilted GlobeView at GlobeViewport zoom', async () => {
  const deckProps: TestDeckProps = {
    width: SIZE,
    height: SIZE,
    useDevicePixels: false,
    views: new GlobeView(),
    viewState: {longitude: LONGITUDE, latitude: LATITUDE, zoom: GLOBE_ZOOM, pitch: 60, bearing: 30},
    layers: [makeGlobeGridLayer()]
  };
  const deck = new Deck(deckProps);
  await updateDeckProps(deck, deckProps);
  expect(deck.getViewports()[0], 'the tilted view draws with a GlobeViewport').toBeInstanceOf(
    GlobeViewport
  );

  const picked: number[][] = [];
  for (let y = 20; y < SIZE; y += 40) {
    for (let x = 20; x < SIZE; x += 40) {
      const coordinate = (await deck.pickObjectAsync({x, y, unproject3D: true}))?.coordinate;
      if (coordinate?.length === 3) {
        picked.push(coordinate);
      }
    }
  }
  expect(picked.length, 'most grid pixels hit the layer').toBeGreaterThan(50);

  let maxError = 0;
  for (const [longitude, latitude, altitude] of picked) {
    const viewState = {longitude, latitude, zoom: GLOBE_NADIR_ZOOM, pitch: 0, bearing: 0};
    await updateDeckProps(deck, {...deckProps, viewState});
    expect(deck.getViewports()[0], 'the nadir view draws with a GlobeViewport').toBeInstanceOf(
      GlobeViewport
    );
    const center = {x: SIZE / 2, y: SIZE / 2, unproject3D: true};
    const surface = (await deck.pickObjectAsync(center))?.coordinate;
    expect(surface?.length, 'the nadir view hits the layer').toBe(3);
    maxError = Math.max(maxError, Math.abs(altitude - surface![2]));
  }
  deck.finalize();
  // Depth precision is about 1 cm here. The rest is the software rasterizer placing vertices
  // to about 1 m. The picked point is on the ray of the sampled pixel, so its distance from the
  // drawn surface along that ray is this error divided by the cosine of the incidence angle.
  expect(maxError, 'picked altitude is within 2 m of the drawn surface').toBeLessThan(2);
});
