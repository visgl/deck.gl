// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  _CustomProjectionViewport as CustomProjectionViewport,
  _CustomProjectionView as CustomProjectionView,
  WebMercatorViewport,
  Viewport,
  project
} from '@deck.gl/core';
import {CustomProjectionState} from '@deck.gl/core/controllers/custom-projection-controller';
import {getEmptyPickingInfo} from '@deck.gl/core/lib/picking/pick-info';
import {lngLatToWorld, worldToLngLat, getDistanceScales} from '@math.gl/web-mercator';
import {Proj4Projection} from '@math.gl/proj4';

const projection = {forward: p => p.slice(), inverse: p => p.slice()};
const normalizationScale = 512 / 40075016.6855;
const options = {
  projection,
  width: 800,
  height: 600
};

test('Viewport installs the projection pair before invoking overridden projectPosition', () => {
  class ProjectedViewport extends Viewport {
    projectPosition(position: number[]): [number, number, number] {
      expect(this.postUnproject).toBeTypeOf('function');
      const projected = this.preproject!(position);
      return [projected[0], projected[1], projected[2] * this.distanceScales.unitsPerMeter[2]];
    }
  }
  const preproject = vi.fn(([x, y, z = 0]): [number, number, number] => [x * 2, y * 3, z]);
  const postUnproject = ([x, y, z = 0]): [number, number, number] => [x / 2, y / 3, z];
  const viewport = new ProjectedViewport({preproject, postUnproject, position: [10, 20, 0]});
  expect(preproject).toHaveBeenCalledExactlyOnceWith([10, 20, 0]);
  expect(viewport.center).toEqual([20, 60, 0]);
  expect(viewport.postUnproject!(viewport.center)).toEqual([10, 20, 0]);
  preproject.mockClear();
  const scaled = new ProjectedViewport({
    preproject,
    postUnproject,
    position: [10, 20, 5],
    distanceScales: {unitsPerMeter: [2, 2, 2], metersPerUnit: [0.5, 0.5, 0.5]}
  });
  expect(scaled.center).toEqual([20, 60, 10]);
  expect(preproject).toHaveBeenCalledExactlyOnceWith([10, 20, 5]);
});

test('CustomProjectionViewport centers the camera on world coordinates, defaulting to zero', () => {
  const converter = new Proj4Projection({from: 'EPSG:4326', to: 'EPSG:3857'});
  for (const center of [undefined, [-122, 38, 0] as [number, number, number]]) {
    const viewport = new CustomProjectionViewport({
      ...options,
      projection: {forward: converter.project, inverse: converter.unproject},
      center,
      pitch: 35,
      bearing: 20
    });
    const worldCenter = center || [0, 0, 0];
    expect(viewport.position).toEqual(worldCenter);
    const pixel = viewport.project(worldCenter);
    expect(pixel[0]).toBeCloseTo(400, 8);
    expect(pixel[1]).toBeCloseTo(300, 8);
    viewport.center.forEach((value, i) =>
      expect(value).toBeCloseTo(viewport.projectPosition(worldCenter)[i], 8)
    );
  }
});

test('CustomProjectionViewport public methods convert world XYZ exactly once', () => {
  const forward = vi.fn(([x, y, z = 0]) => [2 * x + 100, 3 * y - 50, 4 * z + 10]);
  const inverse = vi.fn(([x, y, z = 0]) => [(x - 100) / 2, (y + 50) / 3, (z - 10) / 4]);
  const viewport = new CustomProjectionViewport({
    width: 800,
    height: 600,
    pitch: 35,
    bearing: 20,
    projection: {forward, inverse},
    getDistanceScale: () => [1, 1, 1]
  });
  // The base constructor must use the final distance scales when deriving the camera center.
  expect(viewport.center).toEqual(viewport.projectPosition(viewport.position));
  expect(viewport.center[2]).toBe(10 * normalizationScale);
  const world = [20, 30, 40];
  const common = [
    256 + 140 * normalizationScale,
    256 + 40 * normalizationScale,
    170 * normalizationScale
  ];
  forward.mockClear();
  expect(viewport.projectPosition(world)).toEqual(common);
  expect(forward).toHaveBeenCalledExactlyOnceWith(world);
  expect(viewport.projectFlat(world)).toEqual(common.slice(0, 2));
  viewport.unprojectFlat(common).forEach((value, i) => expect(value).toBeCloseTo(world[i], 6));
  viewport.unprojectPosition(common).forEach((value, i) => expect(value).toBeCloseTo(world[i], 6));
  for (const topLeft of [true, false]) {
    const pixel = viewport.project(world, {topLeft});
    viewport
      .unproject(pixel, {topLeft})
      .forEach((value, i) => expect(value).toBeCloseTo(world[i], 5));
  }
});

test('CustomProjectionViewport defaults to Earth-circumference bounds and allows overrides', () => {
  const circumference = 40075016.6855;
  const viewport = new CustomProjectionViewport({projection, getDistanceScale: () => [1, 1, 1]});
  expect(viewport.preproject!([0, 0, 20])).toEqual([256, 256, 20]);
  expect(viewport.preproject!([-circumference / 2, -circumference / 2])).toEqual([0, 0, 0]);
  expect(viewport.preproject!([circumference / 2, circumference / 2])).toEqual([512, 512, 0]);
  expect(viewport.distanceScales.unitsPerMeter).toEqual(Array(3).fill(512 / circumference));
  const overridden = new CustomProjectionViewport({
    projection,
    toBounds: [100, 200, 1124, 712],
    getDistanceScale: () => [1, 1, 1]
  });
  expect(overridden.preproject!([100, 200, 20])).toEqual([0, 128, 20]);
  expect(overridden.distanceScales.unitsPerMeter).toEqual([0.5, 0.5, 0.5]);
  const shared = new CustomProjectionViewport({projection});
  expect(shared.preproject!([0, 0])).toEqual([256, 256, 0]);
  viewport.postUnproject!(viewport.preproject!([1234, 5678, 20]))!.forEach((value, i) =>
    expect(value).toBeCloseTo([1234, 5678, 20][i], 6)
  );
});

test('CustomProjectionViewport default bounds align projected Web Mercator with MapView', () => {
  const converter = new Proj4Projection({from: 'EPSG:4326', to: 'EPSG:3857'});
  for (const [pitch, bearing] of [
    [0, 0],
    [45, 30]
  ]) {
    const camera = {
      width: 800,
      height: 600,
      longitude: -122,
      latitude: 38,
      zoom: 4,
      pitch,
      bearing
    };
    const map = new WebMercatorViewport(camera);
    const viewport = new CustomProjectionViewport({
      ...camera,
      projection: {forward: converter.project, inverse: converter.unproject},
      fromCrs: 'EPSG:4326',
      toCrs: 'EPSG:3857',
      center: [-122, 38, 0]
    });
    for (const point of [
      [0, 0],
      [-122, 38],
      [90, -60]
    ]) {
      const common = viewport.preproject!(point);
      const expected = map.projectPosition(point);
      common.forEach((value, i) => expect(value).toBeCloseTo(expected[i], 8));
      viewport
        .project(point)
        .slice(0, 2)
        .forEach((value, i) => expect(value).toBeCloseTo(map.project(point)[i], 6));
    }
  }
});

test('CustomProjectionViewport subdivision is opt-in and rejects invalid resolutions', () => {
  expect(new CustomProjectionViewport(options).resolution).toBe(0);
  expect(new CustomProjectionViewport({...options, resolution: 0}).resolution).toBe(0);
  expect(new CustomProjectionViewport({...options, resolution: 100000}).resolution).toBe(100000);
  for (const resolution of [-1, NaN, Infinity]) {
    expect(() => new CustomProjectionViewport({...options, resolution})).toThrow(
      'non-negative resolution'
    );
  }
});

test('CustomProjectionViewport normalization, inverse and camera independence', () => {
  const options = {
    projection,
    width: 800,
    height: 600,
    toBounds: [-180, -90, 180, 90] as [number, number, number, number]
  };
  const viewport = new CustomProjectionViewport(options);
  expect(viewport.preproject!([0, 0])).toEqual([256, 256, 0]);
  expect(viewport.preproject!([-180, -90])).toEqual([0, 128, 0]);
  expect(viewport.postUnproject!(viewport.preproject!([32, 48, 10]))![0]).toBeCloseTo(32);
  expect(viewport.projectPosition([32, 48, 10])[2]).toBeCloseTo(
    (10 * 512) / 360 / (40075016.6855 / 360),
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
    ...lngLatToWorld([longitude, latitude]).map(value => (value - 256) / normalizationScale),
    altitude
  ],
  inverse: ([x, y, z = 0]) => {
    const [longitude, latitude] = worldToLngLat([
      256 + x * normalizationScale,
      256 + y * normalizationScale
    ]);
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
            getDistanceScale: () => {
              const scales = getDistanceScales({longitude, latitude});
              return [
                scales.metersPerUnit[0] * normalizationScale,
                scales.metersPerUnit[1] * normalizationScale,
                1
              ];
            },

            center: [longitude, latitude, 0]
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
              expect(viewport.projectPosition(point)[index], 'common space').toBeCloseTo(value, 8);
            });
            for (const topLeft of [false, true]) {
              const actual = viewport.project(point, {topLeft});
              mercator.project(point, {topLeft}).forEach((value, index) => {
                expect(actual[index], 'screen space').toBeCloseTo(value, 6);
              });
              const inverse = viewport.unproject(actual, {topLeft});
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
    center: [0, 0, 0],
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
    viewState: {center: [0, 0, 0], zoom: 0}
  })!;
  const uniforms = project.getUniforms({
    viewport,
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: [100, 100, 100],
    modelMatrix: new Array(16).fill(2)
  });
  expect(uniforms.commonUnitsPerWorldUnit).toEqual(viewport.distanceScales.unitsPerMeter);
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
  expect(invalid.unproject([400, 300]).every(Number.isNaN)).toBe(true);
});

test('CustomProjectionViewport preserves converter altitude and applies the distance scale', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    pitch: 30,
    getDistanceScale: () => [1 / 7, 1 / 7, 1],
    projection: {
      forward: p => [p[0], p[1], (p[2] || 0) + 10],
      inverse: p => [p[0], p[1], p[2] - 10]
    }
  });
  const projected = viewport.preproject!([10, 20, 30]);
  expect(projected[2]).toBe(40);
  expect(viewport.projectPosition([10, 20, 30])[2]).toBeCloseTo(40 * 7 * normalizationScale, 10);
  expect(viewport.postUnproject!(projected)![2]).toBeCloseTo(30);
});

test('CustomProjectionViewport inherits targetZ unprojection for altitude-preserving converters', () => {
  const converter = new Proj4Projection({from: 'EPSG:4326', to: 'EPSG:3857'});
  const viewport = new CustomProjectionViewport({
    width: 800,
    height: 600,
    pitch: 35,
    bearing: 20,
    projection: {forward: converter.project, inverse: converter.unproject}
  });
  for (const altitude of [0, 1000]) {
    const world = [10, 20, altitude];
    for (const topLeft of [true, false]) {
      const pixel = viewport.project(world, {topLeft});
      viewport
        .unproject(pixel.slice(0, 2), {topLeft, targetZ: altitude})
        .forEach((value, i) => expect(value).toBeCloseTo(world[i], 6));
    }
  }
});

test('CustomProjectionViewport defaults to geographic scale estimation and supports toCrs scale overrides', () => {
  const metersPerDegree = 40075016.6855 / 360;
  const geographic = new CustomProjectionViewport(options);
  const moved = new CustomProjectionViewport({
    ...options,
    center: [0, 60, 0]
  });
  expect(
    geographic.distanceScales.unitsPerMeter[0] / (normalizationScale / metersPerDegree)
  ).toBeCloseTo(1, 6);
  expect(moved.distanceScales.unitsPerMeter[0]).toBeCloseTo(
    2 * geographic.distanceScales.unitsPerMeter[0],
    16
  );
  expect(moved.distanceScales.unitsPerMeter[1]).toBeCloseTo(
    geographic.distanceScales.unitsPerMeter[1],
    16
  );
  expect(moved.projectionSignature).toBe(geographic.projectionSignature);
  const metric = new CustomProjectionViewport({
    ...options,
    getDistanceScale: () => [0.5, 1 / 3, 1],
    projection: {forward: p => [2 * p[0], 3 * p[1], p[2]], inverse: p => [p[0] / 2, p[1] / 3, p[2]]}
  });
  [2, 3, Math.sqrt(6)].forEach((value, i) => {
    expect(metric.distanceScales.unitsPerMeter[i] / normalizationScale).toBeCloseTo(value, 10);
    expect(metric.distanceScales.metersPerUnit[i] * normalizationScale).toBeCloseTo(1 / value, 10);
  });
  const override = new CustomProjectionViewport({
    ...options,
    getDistanceScale: () => [5, 6, 1]
  });
  [1 / 5, 1 / 6, 1 / Math.sqrt(30)].forEach((value, i) =>
    expect(override.distanceScales.unitsPerMeter[i] / normalizationScale).toBeCloseTo(value, 10)
  );
});

test('CustomProjectionViewport stores the combined scalar in distanceScales', () => {
  const create = (metersPerUnit: [number, number, number]) =>
    new CustomProjectionViewport({
      projection: {
        forward: ([x, y, z = 0]) => [2 * x + y, 3 * y, z],
        inverse: ([x, y, z = 0]) => [(x - y / 3) / 2, y / 3, z]
      },
      getDistanceScale: () => metersPerUnit
    });
  const metric = create([1, 1, 1]);
  const feet = create([1, 1, 0.3048]);
  [1, 1, 1].forEach((value, i) => {
    expect(metric.distanceScales.unitsPerMeter[i] / normalizationScale).toBeCloseTo(value, 9);
    const scale = i === 2 ? 0.3048 : value;
    expect(feet.distanceScales.unitsPerMeter[i] / normalizationScale).toBeCloseTo(scale, 9);
    expect(feet.distanceScales.metersPerUnit[i] * normalizationScale).toBeCloseTo(1 / scale, 9);
  });
  const input = [10, 20, 100];
  const projected = feet.preproject!(input);
  expect(projected[2]).toBe(100);
  expect(feet.projectPosition(input)[2] / normalizationScale).toBeCloseTo(30.48, 9);
  expect(metric.projectPosition(input)[2] / normalizationScale).toBeCloseTo(100, 9);
  const groundPixel = feet.project(input).slice(0, 2);
  feet
    .unproject(groundPixel, {targetZ: 100})
    .forEach((value, i) => expect(value).toBeCloseTo(input[i], 6));
  const pixel = feet.project(input);
  feet.unproject(pixel).forEach((value, i) => expect(value).toBeCloseTo(input[i], 6));
  expect(feet.projectionSignature).toBe(metric.projectionSignature);
});

test('CustomProjectionViewport supports UTM input with degree output', () => {
  const converter = new Proj4Projection({
    from: '+proj=utm +zone=10 +datum=WGS84 +units=m',
    to: 'EPSG:4326'
  });
  const viewport = new CustomProjectionViewport({
    projection: {forward: converter.project, inverse: converter.unproject},
    center: converter.unproject([-123, 42, 0]) as [number, number, number],
    fromCrs: '+proj=utm +zone=10 +datum=WGS84 +units=m',
    toCrs: 'EPSG:4326',
    getDistanceScale: ([, latitude]) => {
      const metersPerDegree = 40075016.6855 / 360;
      return [metersPerDegree * Math.cos((latitude * Math.PI) / 180), metersPerDegree, 1];
    }
  });
  // Zone center is 42 degrees north. Expected output is degrees per meter,
  // derived from the callback's meters per degree, then normalized by the viewport.
  const normalizedDegreesPerMeter = normalizationScale / (40075016.6855 / 360);
  expect(
    viewport.distanceScales.unitsPerMeter[0] /
      (normalizedDegreesPerMeter / Math.cos((42 * Math.PI) / 180))
  ).toBeCloseTo(1, 2);
  expect(viewport.distanceScales.unitsPerMeter[1] / normalizedDegreesPerMeter).toBeCloseTo(1, 2);
  const input = [552821.3829931148, 4183794.4989348184, 100];
  viewport.postUnproject!(viewport.preproject!(input))!.forEach((value, i) =>
    // Degree output occupies a tiny common-space extent under the default bounds.
    // Allow sub-millimeter round-trip error after converting it back to UTM meters.
    expect(value).toBeCloseTo(input[i], 3)
  );
});

test('CustomProjectionViewport only evaluates distance scale at the toCrs center', () => {
  const getDistanceScale = vi.fn((_position: number[]): [number, number, number] => [2, 4, 0.3048]);
  const forward = vi.fn(([x, y, z = 0]) => [x + 1000, y * 2, z * 10]);
  const inverse = vi.fn(([x, y, z = 0]) => [x - 1000, y / 2, z / 10]);
  const viewport = new CustomProjectionViewport({
    projection: {forward, inverse},
    center: [128, 128, 0],
    getDistanceScale
  });
  expect(getDistanceScale).toHaveBeenCalledTimes(1);
  getDistanceScale.mock.calls[0][0].forEach((value, i) =>
    expect(value).toBeCloseTo([1128, 256, 0][i], 6)
  );
  getDistanceScale.mockClear();
  inverse.mockClear();
  const position = viewport.preproject!([20, 30, 40]);
  expect(position).toEqual([256 + 1020 * normalizationScale, 256 + 60 * normalizationScale, 400]);
  viewport.postUnproject!(position)!.forEach((value, i) =>
    expect(value).toBeCloseTo([20, 30, 40][i], 6)
  );
  expect(inverse).toHaveBeenCalledTimes(1);
  expect(getDistanceScale).not.toHaveBeenCalled();
  expect(viewport.projectPosition([20, 30, 40])[2] / normalizationScale).toBeCloseTo(
    (400 * 0.3048) / Math.sqrt(8)
  );
  expect(
    project.getUniforms({viewport}).commonUnitsPerWorldUnit[2] / normalizationScale
  ).toBeCloseTo(0.3048 / Math.sqrt(8));
});

test('CustomProjectionViewport scale callbacks receive toCrs positions without changing the signature', () => {
  const getDistanceScale = (position: number[]): [number, number, number] => [
    1 + position[0] / 512,
    1,
    1
  ];
  const create = (center: [number, number, number], callback = getDistanceScale) =>
    new CustomProjectionViewport({
      projection,

      center,
      getDistanceScale: callback
    });
  const first = create([128, 128, 0]);
  const moved = create([384, 128, 0]);
  expect(first.distanceScales.unitsPerMeter[0] / normalizationScale).toBeCloseTo(1 / 1.25);
  expect(moved.distanceScales.unitsPerMeter[0] / normalizationScale).toBeCloseTo(1 / 1.75);
  expect(moved.projectionSignature).toBe(first.projectionSignature);
  expect(create([128, 128, 0], () => [1, 1, 1]).projectionSignature).toBe(
    first.projectionSignature
  );
  expect(() => create([128, 128, 0], () => [0, 1, 1]).preproject!([128, 128, 0])).toThrow(
    'getDistanceScale'
  );
});

test('CustomProjectionViewport recognizes geographic CRS aliases and permits scale overrides', () => {
  const implicit = new CustomProjectionViewport(options);
  for (const fromCrs of [
    undefined,
    'EPSG:4326',
    'WGS84',
    ' wGs 84 ',
    '4326',
    ' epsg:4326 ',
    '+proj=longlat +datum=WGS84',
    '+proj=latlong',
    '+proj=lonlat',
    '+units=degree',
    '+units=degrees',
    '+units=deg',
    '+proj=utm +units=degrees'
  ]) {
    const lnglat = new CustomProjectionViewport({...options, fromCrs});
    expect(lnglat.distanceScales).toEqual(implicit.distanceScales);
    const viewport = new CustomProjectionViewport({
      ...options,
      fromCrs,
      getDistanceScale: () => [1, 1, 0.3048]
    });
    expect(viewport.distanceScales.unitsPerMeter).toEqual([
      normalizationScale,
      normalizationScale,
      0.3048 * normalizationScale
    ]);
    expect(viewport.preproject!([0, 0, 10])[2]).toBe(10);
    expect(viewport.projectPosition([0, 0, 10])[2]).toBeCloseTo(3.048 * normalizationScale, 12);
    expect(viewport.postUnproject!(viewport.preproject!([0, 0, 10]))![2]).toBe(10);
  }
  const outputOnly = new CustomProjectionViewport({...options, toCrs: '+units=m'});
  expect(outputOnly.distanceScales).toEqual(implicit.distanceScales);
});

test('CustomProjectionViewport estimates planar distance for recognized linear units', () => {
  for (const fromCrs of [
    '+units=m',
    '+proj=utm +zone=10 +units=m',
    '+units=m +proj=utm',
    '\t+units=m\n',
    '+units=meter',
    '+units=metre',
    '+units=ft',
    '+units=us-ft',
    '+proj=longlat +units=m',
    '+PROJ=LATLONG +UNITS=M'
  ]) {
    const viewport = new CustomProjectionViewport({
      ...options,
      fromCrs,
      center: [500000, 4000000, 0],
      projection: {
        forward: ([x, y, z = 0]) => [2 * x + y, 3 * y, z],
        inverse: ([x, y, z = 0]) => [(x - y / 3) / 2, y / 3, z]
      }
    });
    // Planar differences, including shear. Scalar sizing uses area distortion.
    [2, Math.sqrt(10), Math.sqrt(6)].forEach((value, i) => {
      expect(viewport.distanceScales.unitsPerMeter[i] / normalizationScale).toBeCloseTo(value, 6);
      expect(viewport.distanceScales.metersPerUnit[i] * normalizationScale).toBeCloseTo(
        1 / value,
        6
      );
    });
    expect(viewport.preproject!([0, 0, 10])[2]).toBe(10);
    expect(new CustomProjectionViewport({...options, fromCrs}).projectionSignature).toBe(
      viewport.projectionSignature
    );
    const override = new CustomProjectionViewport({
      ...options,
      fromCrs,
      getDistanceScale: () => [2, 2, 0.3048]
    });
    override.distanceScales.unitsPerMeter.forEach((value, i) =>
      expect(value / normalizationScale).toBeCloseTo(i === 2 ? 0.3048 / 2 : 0.5, 10)
    );
    expect(override.preproject!([0, 0, 10])[2]).toBe(10);
    expect(override.projectPosition([0, 0, 10])[2]).toBeCloseTo(
      (3.048 * normalizationScale) / 2,
      12
    );
  }
});

test('CustomProjectionViewport unknown CRS skips estimation but allows a callback override', () => {
  for (const fromCrs of [
    '',
    'local',
    'EPSG:32610',
    'EPSG:4269',
    'NAD83',
    'NAD27',
    '+units=mm',
    '+not_units=m',
    '+proj=merc'
  ]) {
    const forward = vi.fn(([x, y, z = 0]) => [2 * x, 3 * y, z]);
    const inverse = vi.fn(([x, y, z = 0]) => [x / 2, y / 3, z]);
    const viewport = new CustomProjectionViewport({
      projection: {forward, inverse},
      fromCrs,
      toCrs: 'EPSG:4326'
    });
    expect(viewport.distanceScales.unitsPerMeter).toEqual(Array(3).fill(normalizationScale));
    expect(forward).toHaveBeenCalledExactlyOnceWith([0, 0, 0]);
    expect(inverse).not.toHaveBeenCalled();
    const override = new CustomProjectionViewport({
      projection: {forward, inverse},
      fromCrs,
      getDistanceScale: () => [0.5, 1 / 3, 1]
    });
    [2, 3, Math.sqrt(6)].forEach((value, i) =>
      expect(override.distanceScales.unitsPerMeter[i] / normalizationScale).toBeCloseTo(value, 10)
    );
  }
});

test('CustomProjectionViewport signature excludes bounds and all callback identities', () => {
  const config = {...options, fromCrs: 'EPSG:4326', toCrs: 'EPSG:4326'};
  const viewport = new CustomProjectionViewport(config);
  const changes = [
    {projection: {forward: p => p.slice(), inverse: p => p.slice()}},
    {getDistanceScale: () => [1, 1, 1] as [number, number, number]},
    {fromBounds: [-170, -80, 170, 80] as [number, number, number, number]},
    {toBounds: [-200, -100, 200, 100] as [number, number, number, number]}
  ];
  for (const change of changes) {
    expect(new CustomProjectionViewport({...config, ...change}).projectionSignature).toBe(
      viewport.projectionSignature
    );
  }
  for (const change of [{fromCrs: 'WGS84'}, {toCrs: 'other'}, {resolution: 1}]) {
    expect(new CustomProjectionViewport({...config, ...change}).projectionSignature).not.toBe(
      viewport.projectionSignature
    );
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
      {fromCrs: 'local', getDistanceScale: () => [1, 1, 1] as [number, number, number]}
    ]) {
      expect(
        new CustomProjectionViewport({...options, ...crs, ...change}).projectionSignature
      ).not.toBe(viewport.projectionSignature);
    }
  }
  const getDistanceScale = (): [number, number, number] => [1, 1, 1];
  const first = new CustomProjectionViewport({
    ...options,
    fromCrs: 'a-b',
    toCrs: 'c',
    getDistanceScale
  });
  const second = new CustomProjectionViewport({
    ...options,
    fromCrs: 'a',
    toCrs: 'b-c',
    getDistanceScale
  });
  expect(first.projectionSignature).not.toBe(second.projectionSignature);
});

test('CustomProjectionViewport scale sampling stays inside geographic limits', () => {
  const samples: number[][] = [];
  const viewport = new CustomProjectionViewport({
    ...options,
    // Stay just inside the boundary despite floating-point normalization, but
    // closer than the distance-estimation step so outward sampling would fail.
    center: [180 - 1e-6, 90 - 1e-6, 0],
    projection: {
      forward: p => {
        if (Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90) throw new Error('outside domain');
        samples.push(p);
        return p;
      },
      inverse: p => p
    }
  });
  expect(samples).toHaveLength(4);
  const [origin, sampleX, sampleY] = samples;
  expect(origin[0]).toBeCloseTo(180, 5);
  expect(origin[1]).toBeCloseTo(90, 5);
  expect(sampleX[0]).toBeLessThan(origin[0]);
  expect(sampleX[1]).toBe(origin[1]);
  expect(sampleY[0]).toBe(origin[0]);
  expect(sampleY[1]).toBeLessThan(origin[1]);
  expect(viewport.distanceScales.unitsPerMeter.every(v => Number.isFinite(v) && v > 0)).toBe(true);
});

test('CustomProjectionViewport clamps input bounds in both directions without changing Z', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    fromBounds: [10, 20, 100, 200]
  });
  const source = [-50, 250, 7];
  expect(viewport.preproject!(source)).toEqual([
    256 + 10 * normalizationScale,
    256 + 200 * normalizationScale,
    7
  ]);
  expect(source).toEqual([-50, 250, 7]);
  expect(
    viewport.postUnproject!([256 - 50 * normalizationScale, 256 + 250 * normalizationScale, 7])
  ).toEqual([10, 200, 7]);
  const changed = new CustomProjectionViewport({
    ...options,
    fromBounds: [10, 20, 100, 201]
  });
  expect(changed.projectionSignature).toBe(viewport.projectionSignature);
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
