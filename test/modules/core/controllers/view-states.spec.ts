// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  MapController,
  OrbitController,
  FirstPersonController,
  _GlobeController as GlobeController,
  OrbitViewport,
  OrthographicController,
  OrthographicViewport,
  Viewport
} from '@deck.gl/core';
import {normalizeViewportProps} from '@math.gl/web-mercator';

const dummyMakeViewport = (props: any) => new Viewport(props);
const makeOrthographicViewport = (props: any) => new OrthographicViewport(props);

test('MapViewState', () => {
  const MapViewState = new MapController({} as any).ControllerState;

  let viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();
  const expectedProps = normalizeViewportProps({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180
  });

  expect(viewportProps.pitch, 'added default pitch').toBe(0);
  expect(viewportProps.longitude, 'props are normalized').toBe(expectedProps.longitude);
  expect(viewportProps.latitude, 'props are normalized').toBe(expectedProps.latitude);
  expect(viewportProps.zoom, 'props are normalized').toBe(expectedProps.zoom);

  const viewState2 = new MapViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 0,
    zoom: 0,
    bearing: -30,
    makeViewport: dummyMakeViewport
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.longitude, 'found shortest path for longitude').toBe(200);
  expect(transitionViewportProps.bearing, 'found shortest path for bearing').toBe(330);

  viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    bearing: 180,
    normalize: false,
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.zoom, 'props are not normalized').toBe(0);

  expect(() => new MapViewState({width: 400, height: 300} as any), 'should throw').toThrow();

  viewState = new MapViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 0,
    bearing: 120,
    maxBounds: [
      [-5, 45],
      [5, 55]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.longitude, 'longitude is inside maxBounds').toBe(0);
  expect(
    viewportProps.latitude > 45 && viewportProps.latitude < 55,
    'latitude is inside maxBounds'
  ).toBeTruthy();
  expect(viewportProps.zoom > 5, 'zoom is adjusted by maxBounds').toBeTruthy();
});

test('GlobeViewState', () => {
  const GlobeViewState = new GlobeController({} as any).ControllerState;

  let viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    zoom: 0,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();

  expect(viewportProps.longitude, 'no bounds#longitude is normalized').toBe(178);
  expect(viewportProps.latitude, 'no bounds#latitude is not changed').toBe(36);
  expect(viewportProps.zoom, 'no bounds#zoom is not changed').toBe(0);

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 90,
    zoom: 5,
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.latitude, 'the default camera can reach the pole').toBe(90);

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 90,
    zoom: 5,
    bearing: 360,
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.bearing, 'equivalent north-up bearing is normalized').toBe(0);
  expect(viewportProps.latitude, 'bearing does not imply a latitude limit').toBe(90);

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 90,
    zoom: 5,
    maxBounds: [
      [-180, -85],
      [180, 85]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.latitude, 'maxBounds explicitly limits latitude').toBeLessThanOrEqual(85);

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 90,
    zoom: 5,
    maxBounds: [
      [-10, 86],
      [10, 89]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.latitude, 'polar maxBounds can approach the pole').toBeGreaterThanOrEqual(
    86
  );
  expect(viewportProps.latitude, 'polar maxBounds remains enforced').toBeLessThanOrEqual(89);

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: -45,
    latitude: 36,
    zoom: 0,
    maxBounds: [
      [-180, -90],
      [180, 90]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.longitude, 'full coverage bounds#longitude is not changed').toBe(-45);
  expect(viewportProps.latitude, 'full coverage bounds#latitude is not changed').toBe(36);
  expect(viewportProps.zoom > 1, 'full coverage bounds#zoom is adjusted').toBeTruthy();

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: -45,
    latitude: 36,
    zoom: 0,
    maxBounds: [
      [-10, -10],
      [30, 30]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.longitude, 'medium bounds#longitude is adjusted').toBe(10);
  expect(
    viewportProps.latitude < 30 && viewportProps.latitude > -10,
    'medium bounds#latitude is adjusted'
  ).toBeTruthy();
  expect(viewportProps.zoom > 3, 'medium bounds#zoom is adjusted').toBeTruthy();

  viewState = new GlobeViewState({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 0,
    maxBounds: [
      [-122.46, 37.75],
      [-122.44, 37.78]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(
    viewportProps.longitude > -122.46 && viewportProps.longitude < -122.44,
    'small bounds#longitude is adjusted'
  ).toBeTruthy();
  expect(
    viewportProps.latitude < 37.78 && viewportProps.latitude > 37.75,
    'small bounds#latitude is adjusted'
  ).toBeTruthy();
  expect(viewportProps.zoom > 12, 'small bounds#zoom is adjusted').toBeTruthy();
});

test('OrbitViewState', () => {
  const OrbitViewState = new OrbitController({} as any).ControllerState;
  const makeViewport = (props: any) => new OrbitViewport(props);

  let viewState = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 60,
    rotationOrbit: 200,
    zoom: 0,
    minRotationX: -45,
    maxRotationX: 45,
    makeViewport
  });
  let viewportProps = viewState.getViewportProps();

  expect(viewportProps.target, 'added default target').toEqual([0, 0, 0]);
  expect(viewportProps.rotationX, 'props are normalized').toBe(45);
  expect(viewportProps.rotationOrbit, 'props are normalized').toBe(-160);

  const viewState2 = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 0,
    rotationOrbit: 120,
    zoom: 0,
    makeViewport
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.rotationOrbit, 'found shortest path for rotationOrbit').toBe(-240);

  viewState = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 0,
    rotationOrbit: 0,
    zoom: 0,
    target: [-3, 2, 0],
    maxBounds: [
      [-1, -1, -1],
      [1, 1, 1]
    ],
    makeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.target, 'target is clipped inside maxBounds').toEqual([-1, 1, 0]);
  expect(viewportProps.zoom > 6, 'zoom is adjusted to maxBounds').toBeTruthy();

  viewState = new OrbitViewState({
    width: 800,
    height: 600,
    rotationX: 60,
    rotationOrbit: 0,
    zoom: 0,
    target: [-3, 2, 0],
    maxBounds: [
      [-1, -1, -1],
      [1, 1, 1]
    ],
    makeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.target[2] < 0, 'target is clipped inside maxBounds').toBeTruthy();
});

test('OrthographicViewState', () => {
  const OrthographicViewState = new OrthographicController({} as any).ControllerState;

  let viewState = new OrthographicViewState({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: [1, 3],
    zoomAxis: 'Y',
    maxZoomY: 2,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();
  expect(viewportProps.zoomX, 'normalized zoom').toBe(1);
  expect(viewportProps.zoomY, 'normalized zoom').toBe(2);

  viewState = new OrthographicViewState({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: [3, 4],
    maxZoomX: 2,
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.zoomX, 'normalized zoom').toBe(2);
  expect(viewportProps.zoomY, 'normalized zoom').toBe(3);

  viewState = new OrthographicViewState({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoom: 0,
    zoomAxis: 'X',
    minZoomX: 0,
    maxZoomX: 20,
    minZoomY: 0,
    maxZoomY: 0,
    maxBounds: [
      [100, 0],
      [200, 150]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();
  expect(viewportProps.target, 'adjusted target to maxBounds').toEqual([150, 300, 0]);
  expect(viewportProps.zoomX, 'adjusted zoom to maxBounds').toBe(3);
  expect(viewportProps.zoomY, 'adjusted zoom to maxBounds').toBe(0);
});

test.each([
  {axis: 'x', alignment: 'start', expected: 50},
  {axis: 'x', alignment: 'center', expected: 12.5},
  {axis: 'x', alignment: 'end', expected: -25},
  {axis: 'y', alignment: 'start', expected: 50},
  {axis: 'y', alignment: 'center', expected: 12.5},
  {axis: 'y', alignment: 'end', expected: -25}
] as const)(
  'OrthographicViewState aligns undersized $axis bounds to $alignment',
  ({axis, alignment, expected}) => {
    const OrthographicViewState = new OrthographicController({} as any).ControllerState;
    const isXAxis = axis === 'x';
    const viewState = new OrthographicViewState({
      width: 100,
      height: 100,
      target: isXAxis ? [0, 100, 0] : [100, 0, 0],
      zoomX: 0,
      zoomY: 0,
      zoomAxis: isXAxis ? 'Y' : 'X',
      maxBounds: isXAxis
        ? [
            [0, 0],
            [25, 200]
          ]
        : [
            [0, 0],
            [200, 25]
          ],
      maxBoundsAlignment: {[axis]: alignment},
      makeViewport: makeOrthographicViewport
    });
    const viewportProps = viewState.getViewportProps();

    expect(viewportProps.target[isXAxis ? 0 : 1], 'aligned the undersized axis').toBe(expected);
    expect(viewportProps.target[isXAxis ? 1 : 0], 'left the fitting axis centered').toBe(100);
    expect(viewportProps.zoomX, 'did not change X zoom behavior').toBe(0);
    expect(viewportProps.zoomY, 'did not change Y zoom behavior').toBe(0);
  }
);

test.each([
  {description: 'exact-fit', boundsSize: 100, target: 1_000, expected: 50},
  {description: 'larger', boundsSize: 200, target: 1_000, expected: 150}
])(
  'OrthographicViewState uses ordinary clamping for $description aligned bounds',
  ({boundsSize, target, expected}) => {
    const OrthographicViewState = new OrthographicController({} as any).ControllerState;
    const viewState = new OrthographicViewState({
      width: 100,
      height: 100,
      target: [target, target, 0],
      zoom: 0,
      zoomAxis: 'X',
      maxBounds: [
        [0, 0],
        [boundsSize, boundsSize]
      ],
      maxBoundsAlignment: {x: 'start', y: 'end'},
      makeViewport: makeOrthographicViewport
    });

    expect(viewState.getViewportProps().target, 'alignment is inactive when bounds fill').toEqual([
      expected,
      expected,
      0
    ]);
  }
);

test.each([true, false])(
  'OrthographicViewState treats alignment as world-relative with flipY=$flipY',
  flipY => {
    const OrthographicViewState = new OrthographicController({} as any).ControllerState;
    const makeViewport = (props: any) => new OrthographicViewport({...props, flipY});
    const viewState = new OrthographicViewState({
      width: 100,
      height: 100,
      target: [100, 0, 0],
      zoom: 0,
      zoomAxis: 'X',
      maxBounds: [
        [0, 0],
        [200, 25]
      ],
      maxBoundsAlignment: {y: 'start'},
      makeViewport
    });

    expect(viewState.getViewportProps().target[1], 'start follows the minimum Y bound').toBe(50);
  }
);

test('OrthographicViewState aligns within asymmetric maxBoundsPadding', () => {
  const OrthographicViewState = new OrthographicController({} as any).ControllerState;
  const baseProps = {
    width: 100,
    height: 100,
    target: [100, 0, 0],
    zoom: 0,
    zoomAxis: 'X' as const,
    maxBounds: [
      [0, 0],
      [200, 25]
    ],
    maxBoundsPadding: {top: 10, bottom: 30},
    makeViewport: makeOrthographicViewport
  };

  for (const [alignment, expected] of [
    ['start', 40],
    ['center', 22.5],
    ['end', 5]
  ] as const) {
    const viewState = new OrthographicViewState({
      ...baseProps,
      maxBoundsAlignment: {y: alignment}
    });
    expect(viewState.getViewportProps().target[1], `${alignment} uses padded extents`).toBe(
      expected
    );
  }
});

test.each([
  {height: 100, expected: -25},
  {height: 200, expected: -75}
])('OrthographicViewState reapplies alignment at height $height', ({height, expected}) => {
  const OrthographicViewState = new OrthographicController({} as any).ControllerState;
  const viewState = new OrthographicViewState({
    width: 100,
    height,
    target: [100, 0, 0],
    zoom: 0,
    zoomAxis: 'X',
    maxBounds: [
      [0, 0],
      [200, 25]
    ],
    maxBoundsAlignment: {y: 'end'},
    makeViewport: makeOrthographicViewport
  });

  expect(viewState.getViewportProps().target[1], 'alignment uses the current dimensions').toBe(
    expected
  );
});

test('OrthographicViewState preserves default undersized maxBounds behavior', () => {
  const OrthographicViewState = new OrthographicController({} as any).ControllerState;
  const viewState = new OrthographicViewState({
    width: 100,
    height: 100,
    target: [100, 0, 0],
    zoom: 0,
    zoomAxis: 'X',
    maxBounds: [
      [0, 0],
      [200, 25]
    ],
    makeViewport: makeOrthographicViewport
  });
  const viewportProps = viewState.getViewportProps();

  expect(viewportProps.target, 'legacy hard constraints remain unchanged').toEqual([100, 50, 0]);
  expect(viewportProps.zoomY, 'legacy zoom fitting remains unchanged').toBe(0);
});

test('FirstPersonViewState', () => {
  const FirstPersonViewState = new FirstPersonController({} as any).ControllerState;

  let viewState = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -182,
    latitude: 36,
    bearing: 200,
    pitch: 60,
    maxPitch: 45,
    minPitch: -45,
    makeViewport: dummyMakeViewport
  });
  let viewportProps = viewState.getViewportProps();

  expect(viewportProps.position, 'added default position').toEqual([0, 0, 0]);
  expect(viewportProps.pitch, 'props are normalized').toBe(45);
  expect(viewportProps.bearing, 'props are normalized').toBe(-160);

  const viewState2 = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -160,
    latitude: 36,
    bearing: 120,
    pitch: 0,
    makeViewport: dummyMakeViewport
  });

  const transitionViewportProps = viewState2.shortestPathFrom(viewState);
  expect(transitionViewportProps.longitude, 'found shortest path for longitude').toBe(200);
  expect(transitionViewportProps.bearing, 'found shortest path for rotationOrbit').toBe(-240);

  viewState = new FirstPersonViewState({
    width: 800,
    height: 600,
    longitude: -122.4,
    latitude: 37.8,
    position: [-200, 100, 0],
    maxBounds: [
      [-100, -100],
      [100, 100]
    ],
    makeViewport: dummyMakeViewport
  });
  viewportProps = viewState.getViewportProps();

  expect(viewportProps.position, 'updated position to constraints').toEqual([-100, 100, 0]);
});

test('maxBoundsPadding adjusts fitting across controller states', () => {
  const padding = {left: '25%', right: '25%', top: '25%', bottom: '25%'};

  const MapViewState = new MapController({} as any).ControllerState;
  const mapOptions = {
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 50,
    zoom: 0,
    maxBounds: [
      [-5, 45],
      [5, 55]
    ],
    makeViewport: dummyMakeViewport
  };
  const mapZoom = new MapViewState(mapOptions).getViewportProps().zoom;
  const paddedMapZoom = new MapViewState({
    ...mapOptions,
    maxBoundsPadding: padding
  }).getViewportProps().zoom;
  expect(paddedMapZoom, 'MapState fits bounds into the padded viewport').toBeCloseTo(mapZoom - 1);

  const GlobeViewState = new GlobeController({} as any).ControllerState;
  const globeOptions = {
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 0,
    maxBounds: [
      [-180, -90],
      [180, 90]
    ],
    makeViewport: dummyMakeViewport
  };
  const globeZoom = new GlobeViewState(globeOptions).getViewportProps().zoom;
  const paddedGlobeZoom = new GlobeViewState({
    ...globeOptions,
    maxBoundsPadding: padding
  }).getViewportProps().zoom;
  expect(paddedGlobeZoom, 'GlobeState fits bounds into the padded viewport').toBeCloseTo(
    globeZoom - 1
  );

  const OrbitViewState = new OrbitController({} as any).ControllerState;
  const orbitOptions = {
    width: 800,
    height: 600,
    target: [0, 0, 0] as [number, number, number],
    zoom: 0,
    maxBounds: [
      [-1, -1, -1],
      [1, 1, 1]
    ],
    makeViewport: (props: any) => new OrbitViewport(props)
  };
  const orbitZoom = new OrbitViewState(orbitOptions).getViewportProps().zoom;
  const paddedOrbitZoom = new OrbitViewState({
    ...orbitOptions,
    maxBoundsPadding: padding
  }).getViewportProps().zoom;
  expect(paddedOrbitZoom, 'OrbitState fits bounds into the padded viewport').toBeCloseTo(
    orbitZoom - 1
  );

  const FirstPersonViewState = new FirstPersonController({} as any).ControllerState;
  const firstPersonProps = new FirstPersonViewState({
    width: 800,
    height: 600,
    position: [-200, 100, 0],
    maxBounds: [
      [-100, -100],
      [100, 100]
    ],
    maxBoundsPadding: padding,
    makeViewport: dummyMakeViewport
  }).getViewportProps();
  expect(firstPersonProps.position, 'FirstPersonState keeps point constraints unchanged').toEqual([
    -100, 100, 0
  ]);
  expect(firstPersonProps.maxBoundsPadding, 'FirstPersonState carries the shared option').toEqual(
    padding
  );
});

test('negative maxBoundsPadding dimensions skip target constraints', () => {
  const maxBoundsPadding = {left: 60, right: 60, top: 60, bottom: 60};
  const geographicBounds = [
    [-10, -10],
    [10, 10]
  ];

  const MapViewState = new MapController({} as any).ControllerState;
  const mapProps = new MapViewState({
    width: 100,
    height: 100,
    longitude: 50,
    latitude: 50,
    zoom: -10,
    minZoom: -20,
    maxBounds: geographicBounds,
    maxBoundsPadding,
    makeViewport: dummyMakeViewport
  }).getViewportProps();
  expect([mapProps.longitude, mapProps.latitude], 'MapState leaves target unconstrained').toEqual([
    50, 50
  ]);

  const GlobeViewState = new GlobeController({} as any).ControllerState;
  const globeProps = new GlobeViewState({
    width: 100,
    height: 100,
    longitude: 50,
    latitude: 50,
    zoom: -10,
    minZoom: -20,
    maxBounds: geographicBounds,
    maxBoundsPadding,
    makeViewport: dummyMakeViewport
  }).getViewportProps();
  expect(
    [globeProps.longitude, globeProps.latitude],
    'GlobeState leaves target unconstrained'
  ).toEqual([50, 50]);

  const OrbitViewState = new OrbitController({} as any).ControllerState;
  const orbitProps = new OrbitViewState({
    width: 100,
    height: 100,
    target: [100, 100, 100],
    maxBounds: [
      [-1, -1, -1],
      [1, 1, 1]
    ],
    maxBoundsPadding,
    makeViewport: (props: any) => new OrbitViewport(props)
  }).getViewportProps();
  expect(orbitProps.target, 'OrbitState leaves target unconstrained').toEqual([100, 100, 100]);

  const FirstPersonViewState = new FirstPersonController({} as any).ControllerState;
  const firstPersonProps = new FirstPersonViewState({
    width: 100,
    height: 100,
    position: [100, 100, 100],
    maxBounds: [
      [-1, -1, -1],
      [1, 1, 1]
    ],
    maxBoundsPadding,
    makeViewport: dummyMakeViewport
  }).getViewportProps();
  expect(firstPersonProps.position, 'FirstPersonState leaves position unconstrained').toEqual([
    100, 100, 100
  ]);
});
