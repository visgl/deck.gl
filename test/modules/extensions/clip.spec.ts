// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  Deck,
  LayerManager,
  MapView,
  _CustomProjectionView as CustomProjectionView,
  WebMercatorViewport,
  GlobeViewport
} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';
import {CLIP_POLYGON_SIZE} from '@deck.gl/extensions/clip/shader-module';
import {
  lngLatToMercatorCommon,
  projectToFlatCommon
} from '@deck.gl/extensions/utils/projection-utils';
import {GeoJsonLayer, PathLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer, device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Matrix4} from '@math.gl/core';
import {convertGeojsonToBinaryFeatureCollection} from '@loaders.gl/core/geoarrow';

import {geojson, polygons, points} from 'deck.gl-test/data';

const webglTest = device.type === 'webgl' ? test : test.skip;

class DashArclengthPathLayer extends PathLayer {
  static layerName = 'DashArclengthPathLayer';

  getShaders() {
    const shaders = super.getShaders();
    return {
      ...shaders,
      defines: {...shaders.defines, DASH_ENABLED: 1}
    };
  }
}

test('ClipExtension#clipByInstance', () => {
  const checkLayer = (layer, expectedClipByInstance) => {
    expect(
      layer.state.clipByInstance,
      `${layer.constructor.layerName} clipByInstance prop: ${layer.props.clipByInstance} actual: ${expectedClipByInstance}`
    ).toBe(expectedClipByInstance);
  };

  const testCases = [
    {
      props: {
        id: 'clipByInstance:default',
        data: geojson,
        stroked: false,
        extensions: [new ClipExtension()]
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          if (layer.id.includes('points')) {
            checkLayer(layer, true);
          } else {
            checkLayer(layer, false);
          }
        }
      }
    },
    {
      updateProps: {
        id: 'clipByInstance:true',
        clipByInstance: true
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, true);
        }
      }
    },
    {
      updateProps: {
        id: 'clipByInstance:false',
        clipByInstance: false
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, false);
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

webglTest('ClipExtension#bounds uniform per viewport', () => {
  const SF = {longitude: -122.42694203247012, latitude: 37.751537058389985, zoom: 11.5};
  const SIZE = {width: 800, height: 450};
  const mercatorViewport = new WebMercatorViewport({...SF, ...SIZE});
  const globeViewport = new GlobeViewport({...SF, ...SIZE});
  // Deliberately reversed corners: the geometry-mode bounds must be re-ordered to min/max
  const clipBounds: [number, number, number, number] = [-122.39, 37.78, -122.47, 37.73];

  const [ax, ay] = lngLatToMercatorCommon([clipBounds[0], clipBounds[1]]);
  const [bx, by] = lngLatToMercatorCommon([clipBounds[2], clipBounds[3]]);
  const mercatorBounds = [Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)];

  const expectBounds = (layer, expected: number[], message: string) => {
    const {bounds} = getLayerUniforms(layer, 'clip');
    expect(bounds, `${message}: has bounds`).toHaveLength(4);
    for (let i = 0; i < 4; i++) {
      expect(bounds[i], `${message}: bounds[${i}]`).toBeCloseTo(expected[i], 6);
    }
  };

  // Geometry mode: bounds are compared with project_common_position_to_flat(geometry.position),
  // i.e. Mercator common space on both flat and globe viewports
  testLayer({
    Layer: SolidPolygonLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'WebMercatorViewport',
        viewport: mercatorViewport,
        props: {
          data: polygons,
          getPolygon: f => f,
          clipBounds,
          extensions: [new ClipExtension()]
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(false);
          expectBounds(layer, mercatorBounds, 'mercator geometry mode');
        }
      },
      {
        title: 'GlobeViewport',
        viewport: globeViewport,
        updateProps: {},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(false);
          // Not the sphere XYZ that layer.projectPosition() yields on the globe
          const sphere = layer.projectPosition([clipBounds[0], clipBounds[1], 0]);
          expect(Math.hypot(sphere[0], sphere[1], sphere[2])).toBeCloseTo(256, 3);
          expectBounds(layer, mercatorBounds, 'globe geometry mode');
        }
      }
    ]
  });

  // Instance mode: bounds are compared with geometry.worldPosition (raw lng/lat) in every view
  testLayer({
    Layer: ScatterplotLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'WebMercatorViewport',
        viewport: mercatorViewport,
        props: {
          data: points,
          getPosition: d => d.COORDINATES,
          clipBounds,
          extensions: [new ClipExtension()]
        },
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(true);
          expectBounds(layer, clipBounds, 'mercator instance mode');
        }
      },
      {
        title: 'GlobeViewport',
        viewport: globeViewport,
        updateProps: {},
        onAfterUpdate: ({layer}) => {
          expect(layer.state.clipByInstance).toBe(true);
          expectBounds(layer, clipBounds, 'globe instance mode');
        }
      }
    ]
  });
});

test('ClipExtension#WebGPU GeoJson sublayers', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const features = [
    {type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [0, 0]}},
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-1, 0],
          [1, 0]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
            [-1, -1]
          ]
        ]
      }
    }
  ];

  for (const [format, data] of [
    ['geojson', {type: 'FeatureCollection', features}],
    ['binary', convertGeojsonToBinaryFeatureCollection(features as any)]
  ] as const) {
    const errors: Error[] = [];
    const layerManager = new LayerManager(webgpuDevice, {viewport});
    layerManager.setProps({onError: error => errors.push(error)});

    const layer = new GeoJsonLayer({
      id: `webgpu-clip-extension-${format}`,
      data: data as any,
      clipBounds: [-0.5, -0.5, 0.5, 0.5],
      extensions: [new ClipExtension()]
    });

    webgpuDevice.handle.pushErrorScope('validation');
    layerManager.setLayers([layer]);

    const scatterplotLayer = layerManager.layers.find(
      currentLayer => currentLayer instanceof ScatterplotLayer
    );
    const pathLayers = layerManager.layers.filter(
      currentLayer => currentLayer instanceof PathLayer
    );
    const solidPolygonLayer = layerManager.layers.find(
      currentLayer => currentLayer instanceof SolidPolygonLayer
    );

    expect(errors, format).toEqual([]);
    expect(scatterplotLayer?.state.clipByInstance, `${format} points clip by instance`).toBe(true);
    expect(
      pathLayers.length,
      `${format} creates line and polygon stroke sublayers`
    ).toBeGreaterThan(0);
    for (const pathLayer of pathLayers) {
      expect(pathLayer.state.clipByInstance, `${format} ${pathLayer.id} clips by geometry`).toBe(
        false
      );
    }
    expect(solidPolygonLayer?.state.clipByInstance, `${format} polygons clip by geometry`).toBe(
      false
    );

    await webgpuDevice.handle.queue.onSubmittedWorkDone();
    expect(await webgpuDevice.handle.popErrorScope(), format).toBeNull();

    layerManager.finalize();
  }
});

test('ClipExtension#WebGPU PathLayer dash arclength with billboard', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1, pitch: 45}
  });
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});
  const layer = new DashArclengthPathLayer({
    id: 'webgpu-clip-dash-arclength-billboard',
    data: [
      {
        path: [
          [-1, 0, 0],
          [1, 0, 100]
        ]
      }
    ],
    getPath: path => path.path,
    billboard: true,
    clipBounds: [-0.5, -0.5, 0.5, 0.5],
    extensions: [new ClipExtension()]
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([layer]);

  expect(errors).toEqual([]);
  expect(layer.state.clipByInstance, 'PathLayer clips interpolated geometry').toBe(false);
  expect(layer.getShaders().defines.DASH_ENABLED, 'dash arclength branch is compiled').toBe(1);
  await webgpuDevice.handle.queue.onSubmittedWorkDone();
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

  layerManager.finalize();
});

// A polar view rotates the clip bounds, and bends the edges on parallels into arcs
const NORTH_POLAR_STEREOGRAPHIC =
  '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +datum=WGS84 +units=m';

const POLAR_CLIP_TEST_CASES = [
  {
    title: 'rotated bounds',
    // Longitude 15 is 60 degrees from lon_0
    clipBounds: [10, 60, 20, 65] as [number, number, number, number],
    viewState: {center: [15, 62.5, 0] as [number, number, number], zoom: 5}
  },
  {
    title: 'bounds with curved edges',
    // The edges at latitudes 70 and 80 are arcs of 90 degrees around the pole
    clipBounds: [-90, 70, 0, 80] as [number, number, number, number],
    viewState: {center: [-45, 75, 0] as [number, number, number], zoom: 3}
  }
];

/** Positions inside and outside the clip bounds, near the corners and the middles of the edges */
function getClipTestPositions([west, south, east, north]: number[]): {
  inside: number[][];
  outside: number[][];
} {
  const inside: number[][] = [];
  const outside: number[][] = [];
  for (const lng of [west, east]) {
    for (const lat of [south, north]) {
      const dLng = lng === west ? 0.4 : -0.4;
      const dLat = lat === south ? 0.3 : -0.3;
      inside.push([lng + dLng, lat + dLat]);
      outside.push([lng - dLng, lat + dLat], [lng + dLng, lat - dLat]);
    }
  }
  const middle = (west + east) / 2;
  inside.push([middle, south + 0.3], [middle, north - 0.3]);
  outside.push([middle, south - 0.3], [middle, north + 0.3]);
  return {inside, outside};
}

/** A ring with a vertex at each degree, so that its edges follow the curves of the projection */
function getPolygonRing([west, south, east, north]: number[]): number[][] {
  const ring: number[][] = [];
  for (let lng = west; lng < east; lng++) ring.push([lng, south]);
  for (let lat = south; lat < north; lat++) ring.push([east, lat]);
  for (let lng = east; lng > west; lng--) ring.push([lng, north]);
  for (let lat = north; lat > south; lat--) ring.push([west, lat]);
  return ring;
}

webglTest('ClipExtension#CustomProjectionView clips to the projected bounds', async () => {
  const deck = new Deck({
    width: 400,
    height: 400,
    useDevicePixels: false,
    views: new CustomProjectionView({crs: NORTH_POLAR_STEREOGRAPHIC}),
    viewState: POLAR_CLIP_TEST_CASES[0].viewState
  });

  for (const {title, clipBounds, viewState} of POLAR_CLIP_TEST_CASES) {
    const {inside, outside} = getClipTestPositions(clipBounds);
    const layers = {
      // Clip by geometry
      polygon: new SolidPolygonLayer({
        id: `clip-polygon-${title}`,
        data: [
          getPolygonRing([
            clipBounds[0] - 10,
            clipBounds[1] - 5,
            clipBounds[2] + 10,
            clipBounds[3] + 5
          ])
        ],
        getPolygon: d => d,
        pickable: true,
        clipBounds,
        extensions: [new ClipExtension()]
      }),
      // Clip by instance
      points: new ScatterplotLayer({
        id: `clip-points-${title}`,
        data: [...inside, ...outside],
        getPosition: d => d,
        getRadius: 2,
        radiusUnits: 'pixels',
        pickable: true,
        clipBounds,
        extensions: [new ClipExtension()]
      })
    };

    for (const [mode, layer] of Object.entries(layers)) {
      await new Promise<void>(resolve => {
        deck.setProps({
          viewState,
          layers: [layer],
          onAfterRender: () => {
            // @ts-expect-error private member
            if (deck.layerManager && !deck.layerManager.needsUpdate() && layer.isLoaded) {
              resolve();
            }
          }
        });
      });
      const viewport = deck.getViewports()[0];
      for (const [positions, expected] of [
        [inside, true],
        [outside, false]
      ] as const) {
        for (const position of positions) {
          const [x, y] = viewport.project(position);
          const object = deck.pickObject({x, y, radius: 0})?.object;
          // A point can cover the pixel of a point near it
          const isDrawn = mode === 'points' ? object === position : Boolean(object);
          expect(isDrawn, `${title}, ${mode}: ${position} is ${expected ? 'in' : 'out'}`).toBe(
            expected
          );
        }
      }
    }
  }
  // The Deck made a WebGL context. Release it: when there are too many, the browser loses the
  // oldest one, which the other tests use.
  const canvas = deck.getCanvas()!;
  expect(canvas, 'the Deck made its own canvas').not.toBe(device.getDefaultCanvasContext().canvas);
  const gl = canvas.getContext('webgl2')!;
  deck.finalize();
  gl.getExtension('WEBGL_lose_context')?.loseContext();
});

/** Distance from a point to the segment between a and b */
function getDistanceToSegment(point: number[], a: number[], b: number[]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(
    0,
    Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))
  );
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
}

/** Vertices of the clip polygon of a layer, in flat common space */
function getClipPolygon(layer): number[][] {
  const uniforms = getLayerUniforms(layer, 'clip');
  const vertices: number[][] = [];
  for (let i = 0; i < CLIP_POLYGON_SIZE / 2; i++) {
    const [x0, y0, x1, y1] = uniforms[`polygon[${i}]`] as number[];
    vertices.push([x0, y0], [x1, y1]);
  }
  return vertices.slice(0, uniforms.polygonSize as number);
}

/** Largest distance from a vertex of `polygon` near `other` to the outline of `other` */
function getEdgeMismatch(polygon: number[][], other: number[][], near: number): number {
  let mismatch = 0;
  for (const vertex of polygon) {
    let distance = Infinity;
    for (let i = 0; i < other.length; i++) {
      distance = Math.min(
        distance,
        getDistanceToSegment(vertex, other[i], other[(i + 1) % other.length])
      );
    }
    if (distance < near) mismatch = Math.max(mismatch, distance);
  }
  return mismatch;
}

webglTest(
  'ClipExtension#CustomProjectionView bounds of different sizes share an edge',
  async () => {
    // A coarse tile, and a tile of the next level on half of its north edge, an arc around the pole
    const coarseBounds: [number, number, number, number] = [-90, 70, 0, 80];
    const fineBounds: [number, number, number, number] = [-90, 80, -45, 85];
    const viewState = {center: [-45, 80, 0] as [number, number, number], zoom: 4};
    const deck = new Deck({
      width: 400,
      height: 400,
      useDevicePixels: false,
      views: new CustomProjectionView({crs: NORTH_POLAR_STEREOGRAPHIC}),
      viewState
    });
    const layers = [coarseBounds, fineBounds].map(
      (clipBounds, i) =>
        new SolidPolygonLayer({
          id: `clip-edge-${i}`,
          data: [getPolygonRing([-100, 60, 10, 89])],
          getPolygon: d => d,
          clipBounds,
          extensions: [new ClipExtension()]
        })
    );
    await new Promise<void>(resolve => {
      deck.setProps({
        layers,
        onAfterRender: () => {
          // @ts-expect-error private member
          if (deck.layerManager && !deck.layerManager.needsUpdate()) resolve();
        }
      });
    });
    const [coarse, fine] = layers.map(layer => getClipPolygon(layer.getCurrentLayer()));
    const pixelsPerUnit = deck.getViewports()[0].scale;
    // The vertices on the shared edge; the other vertices are more than 100 pixels away
    const near = 10 / pixelsPerUnit;
    const mismatch = Math.max(
      getEdgeMismatch(fine, coarse, near),
      getEdgeMismatch(coarse, fine, near)
    );
    expect(mismatch * pixelsPerUnit, 'distance between the outlines, in pixels').toBeLessThan(0.5);
    // The Deck made a WebGL context. Release it: when there are too many, the browser loses the
    // oldest one, which the other tests use.
    const canvas = deck.getCanvas()!;
    expect(canvas, 'the Deck made its own canvas').not.toBe(
      device.getDefaultCanvasContext().canvas
    );
    const gl = canvas.getContext('webgl2')!;
    deck.finalize();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
);

webglTest('ClipExtension#CustomProjectionView follows an S-shaped projected edge', async () => {
  // The model matrix turns the south edge into a diagonal through [0, 0]. In Web Mercator, the
  // diagonal is an S-shaped curve. Its midpoint is on the chord, but its quarter points are not.
  const clipBounds: [number, number, number, number] = [-60, 0, 60, 10];
  const deck = new Deck({
    width: 400,
    height: 400,
    useDevicePixels: false,
    views: new CustomProjectionView({crs: 'EPSG:3857'}),
    viewState: {center: [0, 0, 0] as [number, number, number], zoom: 2}
  });
  const layer = new SolidPolygonLayer({
    id: 'clip-s-shaped-edge',
    data: [getPolygonRing([-80, -20, 80, 30])],
    getPolygon: d => d,
    modelMatrix: new Matrix4().rotateZ(Math.PI / 4),
    clipBounds,
    extensions: [new ClipExtension()]
  });
  await new Promise<void>(resolve => {
    deck.setProps({
      layers: [layer],
      onAfterRender: () => {
        // @ts-expect-error private member
        if (deck.layerManager && !deck.layerManager.needsUpdate()) resolve();
      }
    });
  });
  const currentLayer = layer.getCurrentLayer()!;
  const polygon = getClipPolygon(currentLayer);
  const [west, south, east, north] = clipBounds;
  const corners = [
    [west, south],
    [east, south],
    [east, north],
    [west, north]
  ];
  // Largest distance from the true projected edges to the clip polygon
  let error = 0;
  for (let i = 0; i < 4; i++) {
    const [a, b] = [corners[i], corners[(i + 1) % 4]];
    for (let t = 0; t <= 1; t += 1 / 256) {
      const position = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), 0];
      const point = projectToFlatCommon(currentLayer, position);
      let distance = Infinity;
      for (let j = 0; j < polygon.length; j++) {
        distance = Math.min(
          distance,
          getDistanceToSegment(point, polygon[j], polygon[(j + 1) % polygon.length])
        );
      }
      error = Math.max(error, distance);
    }
  }
  const pixelsPerUnit = deck.getViewports()[0].scale;
  expect(error * pixelsPerUnit, 'distance from the projected edges, in pixels').toBeLessThan(1);
  // The Deck made a WebGL context. Release it: when there are too many, the browser loses the
  // oldest one, which the other tests use.
  const canvas = deck.getCanvas()!;
  expect(canvas, 'the Deck made its own canvas').not.toBe(device.getDefaultCanvasContext().canvas);
  const gl = canvas.getContext('webgl2')!;
  deck.finalize();
  gl.getExtension('WEBGL_lose_context')?.loseContext();
});
