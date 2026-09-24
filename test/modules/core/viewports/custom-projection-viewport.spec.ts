// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  _CustomProjectionViewport as CustomProjectionViewport,
  _CustomProjectionView as CustomProjectionView,
  WebMercatorViewport,
  project
} from '@deck.gl/core';
import {CustomProjectionState} from '@deck.gl/core/controllers/custom-projection-controller';
import {getEmptyPickingInfo} from '@deck.gl/core/lib/picking/pick-info';
import {lngLatToWorld, worldToLngLat, getDistanceScales} from '@math.gl/web-mercator';
import {Proj4Projection} from '@math.gl/proj4';

const projection = {forward: p => p.slice(), inverse: p => p.slice()};
const options = {
  projection,
  toBounds: [-180, -90, 180, 90] as [number, number, number, number],
  width: 800,
  height: 600
};

test('CustomProjectionViewport normalization, inverse and camera independence', () => {
  const viewport = new CustomProjectionViewport(options);
  expect(viewport.preproject!([0, 0])).toEqual([256, 256, 0]);
  expect(viewport.preproject!([-180, -90])).toEqual([0, 128, 0]);
  expect(viewport.postUnproject!(viewport.preproject!([32, 48, 10]))![0]).toBeCloseTo(32);
  expect(viewport.projectPosition([32, 48, 10])[2]).toBeCloseTo(
    (10 * 512) / 360 / ((Math.PI * 6371008.8) / 180),
    10
  );
  viewport
    .unprojectPosition(viewport.projectPosition([32, 48, 10]))
    .forEach((value, i) => expect(value).toBeCloseTo([32, 48, 10][i], 10));
  const moved = new CustomProjectionViewport({...options, zoom: 4, center: [300, 300, 0]});
  expect(moved.projectionSignature).toBe(viewport.projectionSignature);
  expect(moved.preproject!([32, 48, 10])).toEqual(viewport.preproject!([32, 48, 10]));
  const changed = new CustomProjectionViewport({...options, toCrs: 'new'});
  expect(changed.equals(viewport)).toBe(false);
  expect(new CustomProjectionViewport({...options, resolution: 2}).projectionSignature).not.toBe(
    viewport.projectionSignature
  );
});

// Independent converter: do not delegate to the viewport being used as the reference.
const webMercator = {
  forward: ([longitude, latitude, altitude = 0]) => [
    ...lngLatToWorld([longitude, latitude]),
    altitude
  ],
  inverse: ([x, y, z = 0]) => {
    const [longitude, latitude] = worldToLngLat([x, y]);
    return [longitude, latitude, z];
  }
};

for (const orthographic of [false, true]) {
  for (const [pitch, bearing] of [
    [0, 0],
    [45, 0],
    [0, 60],
    [50, -35]
  ]) {
    test(`CustomProjectionViewport matches Web Mercator camera: pitch=${pitch}, bearing=${bearing}, orthographic=${orthographic}`, () => {
      for (const [longitude, latitude, zoom] of [
        [0, 0, 0],
        [-122, 38, 5],
        [120, -45, 13]
      ]) {
        for (const padding of [null, {left: 80, right: 20, top: 30, bottom: 70}]) {
          const camera = {
            width: 800,
            height: 600,
            longitude,
            latitude,
            zoom,
            pitch,
            bearing,
            orthographic,
            padding
          };
          const mercator = new WebMercatorViewport(camera);
          const viewport = new CustomProjectionViewport({
            ...camera,
            projection: webMercator,
            fromCrs: 'EPSG:4326',
            toCrs: 'EPSG:3857',
            getMetersPerUnit: () => {
              const scales = getDistanceScales({longitude, latitude});
              return [
                scales.unitsPerDegree[0] / scales.unitsPerMeter[0],
                scales.unitsPerDegree[1] / scales.unitsPerMeter[1],
                1
              ];
            },
            toBounds: [0, 0, 512, 512],
            center: [...lngLatToWorld([longitude, latitude]), 0]
          });
          for (const key of ['center', 'viewMatrix', 'projectionMatrix'] as const) {
            Array.from(mercator[key]).forEach((value, index) => {
              expect(viewport[key][index], key).toBeCloseTo(value, 8);
            });
          }
          for (const point of [
            [longitude, latitude, 0],
            [longitude, latitude, 100],
            [longitude + 0.01, latitude - 0.02, 0]
          ]) {
            const common = viewport.preproject!(point);
            mercator.projectPosition(point).forEach((value, index) => {
              expect(viewport.projectPosition(common)[index], 'common space').toBeCloseTo(value, 8);
            });
            for (const topLeft of [false, true]) {
              const actual = viewport.project(common, {topLeft});
              mercator.project(point, {topLeft}).forEach((value, index) => {
                expect(actual[index], 'screen space').toBeCloseTo(value, 6);
              });
              const inverse = viewport.postUnproject!(viewport.unproject(actual, {topLeft}))!;
              point.forEach((value, index) => expect(inverse[index]).toBeCloseTo(value, 3));
            }
          }
        }
      }
    });
  }
}

test('CustomProjectionViewport anchors pan and zoom in common space on z=0', () => {
  const makeViewport = props =>
    new CustomProjectionViewport({
      ...options,
      ...props
    });
  const state = new CustomProjectionState({
    width: 800,
    height: 600,
    center: [256, 256, 0],
    pitch: 45,
    bearing: 20,
    maxBounds: null,
    makeViewport
  });
  const anchor = makeViewport(state.getViewportProps()).unproject([300, 350]);
  const zoomed = state.zoom({pos: [300, 350], scale: 2});
  const pixel = makeViewport(zoomed.getViewportProps()).project(anchor);
  expect(pixel[0]).toBeCloseTo(300);
  expect(pixel[1]).toBeCloseTo(350);
  const panned = state.panStart({pos: [300, 350]}).pan({pos: [400, 400]});
  const panPixel = makeViewport(panned.getViewportProps()).project(anchor);
  expect(panPixel[0]).toBeCloseTo(400);
  expect(panPixel[1]).toBeCloseTo(400);
  expect(panned.getViewportProps().center[2]).toBe(0);
});

test('CustomProjectionView uniforms and picking use the correct coordinate space', () => {
  const view = new CustomProjectionView(options);
  const viewport = view.makeViewport({
    width: 800,
    height: 600,
    viewState: {center: [256, 256, 0], zoom: 0}
  })!;
  const uniforms = project.getUniforms({
    viewport,
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: [100, 100, 100],
    modelMatrix: new Array(16).fill(2)
  });
  expect(uniforms.commonUnitsPerWorldUnit).toEqual([
    1,
    1,
    viewport.distanceScales.unitsPerMeter[2]
  ]);
  expect(uniforms.modelMatrix[0]).toBe(1);
  expect(uniforms.modelMatrix[12]).toBe(0);
  const info = getEmptyPickingInfo({viewports: [viewport], pixelRatio: 1, x: 400, y: 300});
  expect(info.coordinate![0]).toBeCloseTo(0);
  expect(info.coordinate![1]).toBeCloseTo(0);
  const invalid = new CustomProjectionViewport({
    ...options,
    projection: {forward: p => p, inverse: () => null}
  });
  expect(invalid.postUnproject!([0, 0, 0])).toBeNull();
  expect(invalid.unproject([400, 300]).every(Number.isFinite)).toBe(true);
});

test('CustomProjectionViewport preserves callback altitude in meters and meter targetZ', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    pitch: 30,
    getMetersPerUnit: () => [1 / 7, 1 / 7, 1],
    projection: {
      forward: p => [p[0], p[1], (p[2] || 0) + 10],
      inverse: p => [p[0], p[1], p[2] - 10]
    }
  });
  const projected = viewport.preproject!([10, 20, 30]);
  expect(projected[2]).toBe(40);
  expect(viewport.projectPosition(projected)[2]).toBeCloseTo((40 * 7 * 512) / 360);
  expect(viewport.postUnproject!(projected)![2]).toBeCloseTo(30);
  const common = [230, 260, 5];
  const pixel = viewport.project(common);
  const roundTrip = viewport.unproject(pixel.slice(0, 2), {targetZ: 5});
  expect(roundTrip[0]).toBeCloseTo(common[0]);
  expect(roundTrip[1]).toBeCloseTo(common[1]);
  expect(roundTrip[2]).toBe(5);
});

test('CustomProjectionViewport defaults to geographic scale estimation and supports metric overrides', () => {
  const metersPerDegree = (Math.PI * 6371008.8) / 180;
  const geographic = new CustomProjectionViewport(options);
  const moved = new CustomProjectionViewport({
    ...options,
    center: geographic.preproject!([0, 60]) as [number, number, number]
  });
  expect(geographic.distanceScales.unitsPerMeter[0]).toBeCloseTo(512 / 360 / metersPerDegree, 10);
  expect(moved.distanceScales.unitsPerMeter[0]).toBeCloseTo(
    2 * geographic.distanceScales.unitsPerMeter[0],
    10
  );
  expect(moved.distanceScales.unitsPerMeter[1]).toBeCloseTo(
    geographic.distanceScales.unitsPerMeter[1],
    10
  );
  expect(moved.projectionSignature).toBe(geographic.projectionSignature);
  const metric = new CustomProjectionViewport({
    ...options,
    toBounds: [0, 0, 512, 512],
    getMetersPerUnit: () => [1, 1, 1],
    projection: {forward: p => [2 * p[0], 3 * p[1], p[2]], inverse: p => [p[0] / 2, p[1] / 3, p[2]]}
  });
  expect(metric.distanceScales.unitsPerMeter).toEqual([2, 3, Math.sqrt(6)]);
  expect(metric.distanceScales.metersPerUnit).toEqual([0.5, 1 / 3, 1 / Math.sqrt(6)]);
  const override = new CustomProjectionViewport({
    ...options,
    toBounds: [0, 0, 512, 512],
    getMetersPerUnit: () => [5, 6, 1]
  });
  expect(override.distanceScales.unitsPerMeter).toEqual([1 / 5, 1 / 6, 1 / Math.sqrt(30)]);
});

test('CustomProjectionViewport derives projected scales from physical input units', () => {
  const create = (metersPerUnit: [number, number, number]) =>
    new CustomProjectionViewport({
      projection: {
        forward: ([x, y, z = 0]) => [2 * x + y, 3 * y, z],
        inverse: ([x, y, z = 0]) => [(x - y / 3) / 2, y / 3, z]
      },
      toBounds: [0, 0, 512, 512],
      getMetersPerUnit: () => metersPerUnit
    });
  const metric = create([1, 1, 1]);
  const feet = create([0.3048, 0.3048, 0.3048]);
  [2, Math.sqrt(10), Math.sqrt(6)].forEach((value, i) => {
    expect(metric.distanceScales.unitsPerMeter[i]).toBeCloseTo(value, 9);
    expect(feet.distanceScales.unitsPerMeter[i]).toBeCloseTo(value / 0.3048, 9);
  });
  const input = [10, 20, 100];
  const projected = feet.preproject!(input);
  expect(projected[2]).toBeCloseTo(30.48);
  const pixel = feet.project(projected);
  feet.postUnproject!(feet.unproject(pixel))!.forEach((value, i) =>
    expect(value).toBeCloseTo(input[i], 6)
  );
  expect(feet.projectionSignature).not.toBe(metric.projectionSignature);
});

test('CustomProjectionViewport supports UTM input with degree output', () => {
  const converter = new Proj4Projection({
    from: '+proj=utm +zone=10 +datum=WGS84 +units=m',
    to: 'EPSG:4326'
  });
  const viewport = new CustomProjectionViewport({
    projection: {forward: converter.project, inverse: converter.unproject},
    toBounds: [-126, 0, -120, 84],
    fromCrs: '+proj=utm +zone=10 +datum=WGS84 +units=m',
    toCrs: 'EPSG:4326',
    getMetersPerUnit: () => [1, 1, 1]
  });
  // Zone center is 42 degrees north. Expected output is degrees per meter,
  // not the callback's input-unit value of 1, then normalized by the viewport.
  const normalizedDegreesPerMeter = 512 / 84 / ((Math.PI * 6371008.8) / 180);
  expect(
    viewport.distanceScales.unitsPerMeter[0] /
      (normalizedDegreesPerMeter / Math.cos((42 * Math.PI) / 180))
  ).toBeCloseTo(1, 2);
  expect(viewport.distanceScales.unitsPerMeter[1] / normalizedDegreesPerMeter).toBeCloseTo(1, 2);
  const input = [552821.3829931148, 4183794.4989348184, 100];
  viewport.postUnproject!(viewport.preproject!(input))!.forEach((value, i) =>
    expect(value).toBeCloseTo(input[i], 5)
  );
});

test('CustomProjectionViewport scale callbacks receive input positions and invalidate geometry', () => {
  const getMetersPerUnit = (position: number[]): [number, number, number] => [
    1 + position[0] / 512,
    1,
    1
  ];
  const create = (center: [number, number, number], callback = getMetersPerUnit) =>
    new CustomProjectionViewport({
      projection,
      toBounds: [0, 0, 512, 512],
      center,
      getMetersPerUnit: callback
    });
  const first = create([128, 128, 0]);
  const moved = create([384, 128, 0]);
  expect(first.distanceScales.unitsPerMeter[0]).toBeCloseTo(1 / 1.25);
  expect(moved.distanceScales.unitsPerMeter[0]).toBeCloseTo(1 / 1.75);
  expect(moved.projectionSignature).toBe(first.projectionSignature);
  expect(create([128, 128, 0], () => [1, 1, 1]).projectionSignature).not.toBe(
    first.projectionSignature
  );
  expect(() => create([128, 128, 0], () => [0, 1, 1]).preproject!([128, 128, 0])).toThrow(
    'getMetersPerUnit'
  );
});

test('CustomProjectionViewport recognizes geographic CRS aliases and permits scale overrides', () => {
  const implicit = new CustomProjectionViewport(options);
  for (const fromCrs of [
    undefined,
    'EPSG:4326',
    'WGS84',
    'EPSG:4269',
    'NAD83',
    'EPSG:4267',
    'NAD27',
    'EPSG:32610',
    '+proj=longlat +datum=WGS84',
    'local',
    '+units=ft',
    '+units=mm',
    '+not_units=m',
    'prefix+units=m'
  ]) {
    const lnglat = new CustomProjectionViewport({...options, fromCrs});
    expect(lnglat.distanceScales).toEqual(implicit.distanceScales);
    const viewport = new CustomProjectionViewport({
      ...options,
      fromCrs,
      getMetersPerUnit: () => [1, 1, 0.3048]
    });
    expect(viewport.distanceScales.unitsPerMeter).toEqual([512 / 360, 512 / 360, 512 / 360]);
    expect(viewport.preproject!([0, 0, 10])[2]).toBe(3.048);
    expect(viewport.postUnproject!(viewport.preproject!([0, 0, 10]))![2]).toBe(10);
  }
  const outputOnly = new CustomProjectionViewport({...options, toCrs: '+units=m'});
  expect(outputOnly.distanceScales).toEqual(implicit.distanceScales);
});

test('CustomProjectionViewport recognizes meter input units and preserves explicit overrides', () => {
  for (const fromCrs of [
    '+units=m',
    '+proj=utm +zone=10 +units=m',
    '+units=m +proj=utm',
    '\t+units=m\n'
  ]) {
    const viewport = new CustomProjectionViewport({...options, fromCrs});
    expect(viewport.distanceScales.unitsPerMeter).toEqual([512 / 360, 512 / 360, 512 / 360]);
    expect(viewport.preproject!([0, 0, 10])[2]).toBe(10);
    expect(new CustomProjectionViewport({...options, fromCrs}).projectionSignature).toBe(
      viewport.projectionSignature
    );
    const override = new CustomProjectionViewport({
      ...options,
      fromCrs,
      getMetersPerUnit: () => [2, 2, 0.3048]
    });
    override.distanceScales.unitsPerMeter.forEach(value => expect(value).toBeCloseTo(512 / 720));
    expect(override.preproject!([0, 0, 10])[2]).toBe(3.048);
  }
});

test('CustomProjectionViewport invalidates by CRS strings, not converter identity', () => {
  for (const crs of [
    {},
    {fromCrs: 'EPSG:4326'},
    {toCrs: 'output'},
    {fromCrs: 'WGS84', toCrs: 'output'}
  ]) {
    const viewport = new CustomProjectionViewport({...options, ...crs});
    const replacement = new CustomProjectionViewport({
      ...options,
      ...crs,
      projection: {forward: p => [p[0] * 2, p[1]], inverse: p => [p[0] / 2, p[1]]}
    });
    expect(replacement.projectionSignature).toBe(viewport.projectionSignature);
    for (const change of [
      {fromCrs: 'EPSG:4326', toCrs: 'changed'},
      {fromCrs: 'local', getMetersPerUnit: () => [1, 1, 1] as [number, number, number]}
    ]) {
      expect(
        new CustomProjectionViewport({...options, ...crs, ...change}).projectionSignature
      ).not.toBe(viewport.projectionSignature);
    }
  }
  const getMetersPerUnit = (): [number, number, number] => [1, 1, 1];
  const first = new CustomProjectionViewport({
    ...options,
    fromCrs: 'a-b',
    toCrs: 'c',
    getMetersPerUnit
  });
  const second = new CustomProjectionViewport({
    ...options,
    fromCrs: 'a',
    toCrs: 'b-c',
    getMetersPerUnit
  });
  expect(first.projectionSignature).not.toBe(second.projectionSignature);
});

test('CustomProjectionViewport scale sampling stays inside geographic limits', () => {
  const samples: number[][] = [];
  const viewport = new CustomProjectionViewport({
    ...options,
    center: [512, 384, 0],
    projection: {
      forward: p => {
        if (Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) throw new Error('outside domain');
        samples.push(p);
        return p;
      },
      inverse: p => p
    }
  });
  expect(samples.some(p => p[0] < 180 && p[1] === 90)).toBe(true);
  expect(samples.some(p => p[0] === 180 && p[1] < 90)).toBe(true);
  expect(viewport.distanceScales.unitsPerMeter.every(v => Number.isFinite(v) && v > 0)).toBe(true);
});

test('CustomProjectionViewport clamps input bounds in both directions without changing Z', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    toBounds: [0, 0, 512, 512],
    fromBounds: [10, 20, 100, 200]
  });
  const source = [-50, 250, 7];
  expect(viewport.preproject!(source)).toEqual([10, 200, 7]);
  expect(source).toEqual([-50, 250, 7]);
  expect(viewport.postUnproject!([-50, 250, 7])).toEqual([10, 200, 7]);
  const changed = new CustomProjectionViewport({
    ...options,
    toBounds: [0, 0, 512, 512],
    fromBounds: [10, 20, 100, 201]
  });
  expect(changed.projectionSignature).not.toBe(viewport.projectionSignature);
  const invalid = new CustomProjectionViewport({
    ...options,
    fromBounds: [-180, -90, 180, 90],
    projection: {forward: p => p, inverse: () => null}
  });
  expect(invalid.postUnproject!([256, 256, 0])).toBeNull();
  expect(() => new CustomProjectionViewport({...options, fromBounds: [10, 0, 0, 10]})).toThrow(
    'fromBounds'
  );
});
