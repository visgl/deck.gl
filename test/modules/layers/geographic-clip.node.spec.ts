// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, expect, test, vi} from 'vitest';
import {LayerManager, _CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import {PathLayer, PolygonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {getPolygonSignedArea} from '@math.gl/geometry';
import PolygonTesselator from '@deck.gl/layers/solid-polygon-layer/polygon-tesselator';
import PathTesselator from '@deck.gl/layers/path-layer/path-tesselator';
import type {PolygonGeometry} from '@deck.gl/layers/solid-polygon-layer/polygon';
import type {PathGeometry} from '@deck.gl/layers/path-layer/path';

/** Tesselators whose pooled buffers are released after each case. */
const tesselators: (PolygonTesselator | PathTesselator)[] = [];
afterEach(() => {
  for (const tesselator of tesselators.splice(0)) {
    for (const attribute of Object.values(tesselator.attributes)) {
      tesselator.typedArrayManager.release(attribute);
    }
  }
});

/** Create a tesselator whose CPU transform leaves the source chart visible in the output. */
function tessellatePolygons(
  data: PolygonGeometry[],
  options: Partial<PolygonTesselator['opts']> = {}
): PolygonTesselator {
  const tesselator = new PolygonTesselator({
    data,
    getGeometry: (polygon: PolygonGeometry) => polygon,
    positionFormat: 'XY',
    fp64: true,
    transform: (position: number[]) => position,
    ...options
  });
  tesselators.push(tesselator);
  return tesselator;
}

/** Create a path tesselator with the same source and target charts. */
function tessellatePath(
  path: PathGeometry,
  options: Partial<PathTesselator['opts']>
): PathTesselator {
  const tesselator = new PathTesselator({
    data: [path],
    getGeometry: (geometry: PathGeometry) => geometry,
    positionFormat: 'XY',
    fp64: true,
    transform: (position: number[]) => position,
    ...options
  });
  tesselators.push(tesselator);
  return tesselator;
}

/** Return only the positions used by the draw. */
function getPositions(tesselator: PolygonTesselator | PathTesselator): number[][] {
  const positions = tesselator.get('positions')!;
  return Array.from({length: tesselator.instanceCount}, (_, i) =>
    Array.from(positions.subarray(i * 3, i * 3 + 3))
  );
}

/** Return triangle longitudes in emitted index order. */
function getTriangleLongitudes(tesselator: PolygonTesselator): number[][] {
  const positions = getPositions(tesselator);
  const indices = tesselator.get('indices')!;
  return Array.from({length: indices.length / 3}, (_, i) =>
    Array.from(indices.subarray(i * 3, i * 3 + 3), index => positions[index][0])
  );
}

/** Check which nondegenerate edges remain visible to extruded sides and wireframes. */
function getVisibleEdges(tesselator: PolygonTesselator): number[][][] {
  const positions = getPositions(tesselator);
  const flags = tesselator.get('vertexValid')!;
  return positions.flatMap((position, i) => (flags[i] ? [[position, positions[i + 1]]] : []));
}

/** Rectangle crossing the antimeridian, with a short edge on each side. */
const crossingPolygon: PolygonGeometry = [
  [170, 10],
  [-170, 10],
  [-170, 30],
  [170, 30]
];

/** Boundary winding once around the south pole. */
const southCap: PolygonGeometry = Array.from({length: 36}, (_, i) => [-180 + 10 * i, -60, 12]);

test('clips both halves of an antimeridian polygon into the Equal Earth longitude chart', () => {
  const tesselator = tessellatePolygons([crossingPolygon], {geographicClip: {}});
  const triangles = getTriangleLongitudes(tesselator);
  expect(triangles).toHaveLength(4);
  expect(triangles.filter(part => part.every(x => x >= 170 && x <= 180))).toHaveLength(2);
  expect(triangles.filter(part => part.every(x => x >= -180 && x <= -170))).toHaveLength(2);
  expect(getVisibleEdges(tesselator)).toHaveLength(6);
});

test('densifies the Ross Sea polygon boundary on both sides of the seam', () => {
  const tesselator = tessellatePolygons(
    [
      [
        [160, -72],
        [-150, -72],
        [-150, -80],
        [160, -80]
      ]
    ],
    {
      geographicClip: {},
      resolution: 10
    }
  );
  const positions = getPositions(tesselator);
  expect(positions.every(([x]) => (x >= 160 && x <= 180) || (x >= -180 && x <= -150))).toBe(true);
  const flags = tesselator.get('vertexValid')!;
  for (const [min, max, count] of [
    [160, 180, 7],
    [-180, -150, 9]
  ]) {
    const ring = positions.filter(([x]) => x >= min && x <= max);
    expect(ring).toHaveLength(count);
    expect(ring.at(-1)).toEqual(ring[0]);
    for (let i = 0; i < ring.length - 1; i++) {
      const [x, y] = ring[i];
      const [nextX, nextY] = ring[i + 1];
      expect(x === min || x === max || y === -72 || y === -80).toBe(true);
      expect(Math.abs(nextX - x)).toBeLessThanOrEqual(10);
      expect(Math.abs(nextY - y)).toBeLessThanOrEqual(10);
      expect(flags[positions.indexOf(ring[i])]).toBe(Math.abs(x) === 180 && x === nextX ? 0 : 1);
    }
  }
  const perimeter = getVisibleEdges(tesselator).reduce(
    (total, [a, b]) => total + Math.hypot(b[0] - a[0], b[1] - a[1]),
    0
  );
  expect(perimeter).toBeCloseTo(2 * (50 + 8));
});

test('densifies a south polar cap while keeping its pole edge intact and hidden', () => {
  const tesselator = tessellatePolygons([southCap], {
    geographicClip: {enclosedPole: 'south'},
    positionFormat: 'XYZ',
    resolution: 10
  });
  const positions = getPositions(tesselator);
  const poleLongitudes = positions
    .slice(0, -1)
    .filter(([, latitude]) => latitude === -90)
    .map(([longitude]) => longitude)
    .sort((a, b) => a - b);
  expect(poleLongitudes).toEqual([-180, 180]);
  expect(positions.filter(([, latitude]) => latitude > -90 && latitude < -60)).toHaveLength(4);
  expect(positions.every(([, , altitude]) => altitude === 12)).toBe(true);
  expect(tesselator.vertexCount).toBeGreaterThan(0);
  const edges = getVisibleEdges(tesselator);
  expect(edges.length).toBeGreaterThanOrEqual(36);
  expect(edges.every(([a, b]) => a[1] === -60 && b[1] === -60)).toBe(true);
});

test('keeps the southern latitude band and handles entirely clipped rows', () => {
  const north: PolygonGeometry = [
    [0, 10],
    [10, 10],
    [10, 20],
    [0, 20]
  ];
  const crossing: PolygonGeometry = [
    [0, -10],
    [10, -10],
    [10, 10],
    [0, 10]
  ];
  const tesselator = tessellatePolygons([north, crossing, north], {
    geographicClip: {latitudeRange: [-90, 0]},
    resolution: 5
  });
  expect(tesselator.vertexStarts).toEqual([0, 0, 9, 9]);
  expect(tesselator.indexStarts).toEqual([0, 0, tesselator.vertexCount, tesselator.vertexCount]);
  expect(tesselator.vertexCount).toBeGreaterThan(0);
  const positions = getPositions(tesselator);
  expect(positions.every(([, lat]) => lat >= -10 && lat <= 0)).toBe(true);
  expect(positions).toContainEqual([5, 0, 0]);
  const visibleEdges = getVisibleEdges(tesselator);
  expect(visibleEdges).toHaveLength(6);
  expect(visibleEdges.some(([a, b]) => a[1] === 0 && b[1] === 0)).toBe(false);
});

test('clips a pre-normalized XYZ polygon with a hole and interpolates seam altitude', () => {
  const tesselator = tessellatePolygons(
    [
      {
        positions: new Float64Array([
          160, 0, 10, 160, 30, 10, -160, 30, 30, -160, 0, 30, 160, 0, 10, 165, 10, 12, 175, 10, 18,
          175, 20, 18, 165, 20, 12, 165, 10, 12
        ]),
        holeIndices: [15]
      }
    ],
    {geographicClip: {}, normalize: false, positionFormat: 'XYZ', resolution: 6}
  );
  const positions = getPositions(tesselator);
  const seam = positions.filter(([x]) => Math.abs(x) === 180);
  expect(seam.length).toBeGreaterThanOrEqual(4);
  expect(seam.every(([, , z]) => z === 20)).toBe(true);
  expect(positions).toContainEqual([165, 0, 12.5]);
  expect(positions).toContainEqual([170, 10, 15]);
  // The chart sides have area 20 * 30 each, with a 10 * 10 hole on the east side.
  const indices = tesselator.get('indices')!;
  let area = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = Array.from(indices.subarray(i, i + 3), index => positions[index]);
    area += Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2;
  }
  expect(area).toBeCloseTo(1100);
});

test('requires explicit pole selection for a once-winding ring', () => {
  expect(() => tessellatePolygons([southCap], {geographicClip: {}, positionFormat: 'XYZ'})).toThrow(
    '_geographicClip requires enclosedPole for a ring that encloses a pole'
  );
});

test('restores legacy polygon geometry when clipping is cleared', () => {
  const tesselator = tessellatePolygons([crossingPolygon]);
  const original = getPositions(tesselator);
  const originalIndices = Array.from(tesselator.get('indices')!);
  const originalEdges = getVisibleEdges(tesselator);
  expect(original).toHaveLength(5);
  expect(originalIndices).toHaveLength(6);
  expect(originalEdges.some(([a, b]) => Math.abs(a[0] - b[0]) === 340)).toBe(true);

  tesselator.updateGeometry({geographicClip: {}});
  expect(tesselator.instanceCount).toBe(10);
  tesselator.updateGeometry({geographicClip: null});
  expect(getPositions(tesselator)).toEqual(original);
  expect(Array.from(tesselator.get('indices')!)).toEqual(originalIndices);
  expect(getVisibleEdges(tesselator)).toEqual(originalEdges);
});

test('splits an antimeridian path into two capped parts', () => {
  const tesselator = tessellatePath(
    [
      [170, 20, 10],
      [-170, 20, 30]
    ],
    {
      geographicClip: {},
      positionFormat: 'XYZ'
    }
  );
  expect(getPositions(tesselator)).toEqual([
    [170, 20, 10],
    [180, 20, 20],
    [-180, 20, 20],
    [-170, 20, 30]
  ]);
  expect(Array.from(tesselator.get('segmentTypes')!.subarray(0, 4))).toEqual([3, 4, 3, 4]);
});

test('keeps the closing edge of a pre-normalized loop and subdivides each clipped part', () => {
  const tesselator = tessellatePath([170, 10, 170, 20, -170, 20, -170, 10], {
    geographicClip: {},
    normalize: false,
    loop: true,
    resolution: 5
  });
  const positions = getPositions(tesselator);
  const segments = tesselator.getPathSegmentIndices(0).map(i => [positions[i], positions[i + 1]]);
  expect(segments).toHaveLength(12);
  expect(segments.every(([a, b]) => Math.hypot(a[0] - b[0], a[1] - b[1]) === 5)).toBe(true);
  expect(segments.filter(([a, b]) => a[1] === 10 && b[1] === 10)).toHaveLength(4);
});

test('PolygonLayer clips both sublayers and reuses geometry for equal options', async () => {
  const view = new CustomProjectionView({crs: '+proj=eqearth +lon_0=0 +datum=WGS84 +units=m'});
  await view.initialize();
  const viewport = view.makeViewport({
    width: 800,
    height: 450,
    viewState: {center: [0, 0, 0], zoom: 0}
  })!;
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  let layer = new PolygonLayer({
    data: [{polygon: crossingPolygon}],
    positionFormat: 'XY',
    _geographicClip: {latitudeRange: [-90, 90]}
  });
  try {
    manager.setLayers([layer]);
    const fill = layer.getSubLayers().find(child => child instanceof SolidPolygonLayer)!;
    const stroke = layer.getSubLayers().find(child => child instanceof PathLayer)!;
    expect(fill.getNumInstances()).toBe(10);
    expect(stroke.getNumInstances()).toBe(8);
    const polygonTesselator = fill.state.polygonTesselator as PolygonTesselator;
    const pathTesselator = stroke.state.pathTesselator as PathTesselator;
    const positions = getPositions(pathTesselator);
    for (const i of pathTesselator.getPathSegmentIndices(0)) {
      expect(Math.sign(positions[i][0])).toBe(Math.sign(positions[i + 1][0]));
    }

    const updateFill = vi.spyOn(polygonTesselator, 'updateGeometry');
    const updateStroke = vi.spyOn(pathTesselator, 'updateGeometry');
    layer = layer.clone({_geographicClip: {latitudeRange: [-90, 90]}});
    manager.setLayers([layer]);
    expect(updateFill).not.toHaveBeenCalled();
    expect(updateStroke).not.toHaveBeenCalled();

    layer = layer.clone({_geographicClip: null});
    manager.setLayers([layer]);
    expect(polygonTesselator.instanceCount).toBe(5);
    expect(pathTesselator.instanceCount).toBe(7);
  } finally {
    manager.finalize();
  }
});

test.each([
  {name: 'north at the antimeridian', startLatitude: 10, endLatitude: 30, seamLongitude: undefined},
  {
    name: 'south at the antimeridian',
    startLatitude: -70,
    endLatitude: -80,
    seamLongitude: undefined
  },
  {name: 'north at a shifted seam', startLatitude: 10, endLatitude: 30, seamLongitude: 150}
])(
  'fills both Equal Earth seam parts ($name)',
  async ({startLatitude, endLatitude, seamLongitude}) => {
    const centralLongitude = (seamLongitude ?? 180) - 180;
    const view = new CustomProjectionView({
      crs: `+proj=eqearth +lon_0=${centralLongitude} +datum=WGS84 +units=m`
    });
    await view.initialize();
    const viewport = view.makeViewport({
      width: 800,
      height: 450,
      viewState: {center: [0, 0, 0], zoom: 0}
    })!;
    const manager = new LayerManager(device, {viewport});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    const layer = new SolidPolygonLayer({
      data: [
        {
          polygon: [
            [centralLongitude + 170, startLatitude],
            [centralLongitude - 170, startLatitude],
            [centralLongitude - 170, endLatitude],
            [centralLongitude + 170, endLatitude]
          ]
        }
      ],
      positionFormat: 'XY',
      _geographicClip: {seamLongitude}
    });
    try {
      manager.setLayers([layer]);
      const {vertexPositions, indices} = layer.getAttributeManager()!.getAttributes();
      const positions = vertexPositions.value as Float64Array;
      const triangleIndices = indices.value as Uint32Array;
      const areas = {east: 0, west: 0};
      for (let i = 0; i < triangleIndices.length; i += 3) {
        const triangle = Array.from(triangleIndices.subarray(i, i + 3)).flatMap(index =>
          Array.from(positions.subarray(index * 3, index * 3 + 2))
        );
        const direction = Math.sign(triangle[0]);
        expect(Math.sign(triangle[2])).toBe(direction);
        expect(Math.sign(triangle[4])).toBe(direction);
        areas[direction > 0 ? 'east' : 'west'] += Math.abs(getPolygonSignedArea(triangle));
      }

      const converter = viewport.crs.converter.WGS84;
      for (const [side, direction] of [
        ['east', 1],
        ['west', -1]
      ] as const) {
        const innerLongitude = centralLongitude + direction * 170;
        const outerLongitude = centralLongitude + direction * 180;
        const quad = [
          [innerLongitude, startLatitude],
          [outerLongitude, startLatitude],
          [outerLongitude, endLatitude],
          [innerLongitude, endLatitude]
        ].flatMap(position => converter.from(position));
        const expectedArea = Math.abs(getPolygonSignedArea(quad));
        expect(areas[side] / expectedArea, `${side} fill`).toBeCloseTo(1, 8);
      }
    } finally {
      manager.finalize();
    }
  }
);

test('submits no draw calls for a fully clipped extruded polygon', async () => {
  const view = new CustomProjectionView({crs: '+proj=eqearth +lon_0=0 +datum=WGS84 +units=m'});
  await view.initialize();
  const viewport = view.makeViewport({
    width: 800,
    height: 450,
    viewState: {center: [0, 0, 0], zoom: 0}
  })!;
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const layer = new SolidPolygonLayer({
    data: [{polygon: crossingPolygon}],
    positionFormat: 'XY',
    _geographicClip: {},
    extruded: true,
    wireframe: true
  });
  const renderPass = device.beginRenderPass({});
  const draw = vi.spyOn(renderPass, 'draw');
  manager.context.renderPass = renderPass;
  try {
    manager.setLayers([layer]);
    layer._drawLayer({renderPass, shaderModuleProps: null, uniforms: {}, parameters: {}});
    expect(draw).toHaveBeenCalled();
    draw.mockClear();

    const clipped = layer.clone({_geographicClip: {latitudeRange: [-90, 0]}});
    manager.setLayers([clipped]);
    expect(clipped.getNumInstances()).toBe(0);
    clipped._drawLayer({renderPass, shaderModuleProps: null, uniforms: {}, parameters: {}});
    expect(draw).not.toHaveBeenCalled();
  } finally {
    renderPass.end();
    manager.finalize();
  }
});
