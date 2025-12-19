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
    {
      Type: WebMercatorViewport,
      props: {
        width: 100,
        height: 100
      }
    },
    {
      Type: WebMercatorViewport,
      props: {
        width: 400,
        height: 300,
        longitude: -122.4,
        latitude: 37.8,
        fovy: 50,
        zoom: 12,
        pitch: 24,
        bearing: -160,
        position: [0, 0, 2]
      }
    },
    {
      Type: WebMercatorViewport,
      props: {
        width: 400,
        height: 300,
        longitude: -122.4,
        latitude: 37.8,
        zoom: 12,
        nearZ: 0.01,
        farZMultiplier: 10
      }
    },
    {
      Type: OrbitViewport,
      props: {
        width: 100,
        height: 100
      }
    },
    {
      Type: OrbitViewport,
      props: {
        width: 400,
        height: 300,
        target: [-10.24, 2833, 47.2],
        orbitAxis: 'Y',
        rotationX: 45,
        rotationAxis: -111,
        zoom: -3
      }
    },
    {
      Type: OrthographicViewport,
      props: {
        width: 100,
        height: 100
      }
    },
    {
      Type: OrthographicViewport,
      props: {
        width: 400,
        height: 300,
        target: [100, -50],
        zoom: 4.3
      }
    },
    {
      Type: GlobeViewport,
      props: {
        width: 100,
        height: 100
      }
    },
    {
      Type: GlobeViewport,
      props: {
        width: 400,
        height: 300,
        longitude: -122.4,
        latitude: 37.8,
        fovy: 50,
        zoom: 12
      }
    },
    {
      Type: FirstPersonViewport,
      props: {
        width: 100,
        height: 100
      }
    },
    {
      Type: FirstPersonViewport,
      props: {
        width: 400,
        height: 300,
        longitude: -122.4,
        latitude: 37.8,
        pitch: 35,
        bearing: -140,
        zoom: 12
      }
    }
  ];
  for (const {Type, props} of TEST_CASES) {
    const viewport1 = new Type(props as any) as Viewport;
    const viewport2 = new Type({...viewport1}) as Viewport;
    t.ok(viewport1.equals(viewport2), String(Type.name));
  }
});
