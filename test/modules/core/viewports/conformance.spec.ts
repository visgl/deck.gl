import test from 'tape-promise/tape';
import {
  type Viewport,
  WebMercatorViewport,
  OrthographicViewport,
  OrbitViewport,
  _GlobeViewport as GlobeViewport,
  FirstPersonViewport
} from '@deck.gl/core';

test('Viewport#recreate', t => {
  const TEST_CASES = [
    new WebMercatorViewport({
      width: 100,
      height: 100
    }),
    new WebMercatorViewport({
      width: 400,
      height: 300,
      longitude: -122.4,
      latitude: 37.8,
      fovy: 50,
      zoom: 12,
      pitch: 24,
      bearing: -160,
      position: [0, 0, 2]
    }),
    new WebMercatorViewport({
      width: 400,
      height: 300,
      longitude: -122.4,
      latitude: 37.8,
      zoom: 12,
      nearZ: 0.01,
      farZMultiplier: 10
    }),
    new OrbitViewport({
      width: 100,
      height: 100
    }),
    new OrbitViewport({
      width: 400,
      height: 300,
      target: [-10.24, 2833, 47.2],
      orbitAxis: 'Y',
      rotationX: 45,
      rotationOrbit: -111,
      zoom: -3
    }),
    new OrthographicViewport({
      width: 100,
      height: 100
    }),
    new OrthographicViewport({
      width: 400,
      height: 300,
      target: [100, 500],
      zoom: [1, -4]
    }),
    new GlobeViewport({
      width: 100,
      height: 100
    }),
    new GlobeViewport({
      width: 400,
      height: 300,
      longitude: -122.4,
      latitude: 37.8,
      fovy: 50,
      zoom: 12
    }),
    new FirstPersonViewport({
      width: 100,
      height: 100
    }),
    new FirstPersonViewport({
      width: 400,
      height: 300,
      longitude: -122.4,
      latitude: 37.8,
      pitch: 35,
      bearing: -140,
      focalDistance: 2
    })
  ];
  for (const viewport of TEST_CASES) {
    const ViewportType = viewport.constructor as {new (props: unknown): Viewport};
    const clone = new ViewportType({...viewport});
    t.ok(viewport.equals(clone), String(viewport.id));
  }
  t.end();
});
