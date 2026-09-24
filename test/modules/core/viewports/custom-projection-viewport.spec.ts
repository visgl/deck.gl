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

const projection = {forward: p => p.slice(), inverse: p => p.slice()};
const options = {
  projection,
  outputBounds: [-180, -90, 180, 90] as [number, number, number, number],
  width: 800,
  height: 600
};

test('CustomProjectionViewport normalization, inverse and camera independence', () => {
  const viewport = new CustomProjectionViewport(options);
  expect(viewport.preproject!([0, 0])).toEqual([256, 256, 0]);
  expect(viewport.preproject!([-180, -90])).toEqual([0, 128, 0]);
  expect(viewport.postUnproject!(viewport.preproject!([32, 48, 10]))![0]).toBeCloseTo(32);
  expect(viewport.projectPosition([32, 48, 10])[2]).toBeCloseTo((10 * 512) / 360);
  expect(viewport.unprojectPosition(viewport.projectPosition([32, 48, 10]))).toEqual([32, 48, 10]);
  const moved = new CustomProjectionViewport({...options, zoom: 4, center: [300, 300, 0]});
  expect(moved.projectionSignature).toBe(viewport.projectionSignature);
  expect(moved.preproject!([32, 48, 10])).toEqual(viewport.preproject!([32, 48, 10]));
  const changed = new CustomProjectionViewport({...options, projectionId: 'new'});
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
            getUnitsPerMeter: () => getDistanceScales({longitude, latitude}).unitsPerMeter,
            outputBounds: [0, 0, 512, 512],
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
    getUnitsPerMeter: () => [2, 3, 7],
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
    outputBounds: [0, 0, 512, 512],
    getUnitsPerMeter: () => [2, 3, 1],
    projection: {forward: p => [2 * p[0], 3 * p[1], p[2]], inverse: p => [p[0] / 2, p[1] / 3, p[2]]}
  });
  expect(metric.distanceScales.unitsPerMeter).toEqual([2, 3, 1]);
  expect(metric.distanceScales.metersPerUnit).toEqual([0.5, 1 / 3, 1]);
  const override = new CustomProjectionViewport({
    ...options,
    outputBounds: [0, 0, 512, 512],
    getUnitsPerMeter: () => [5, 6, 7]
  });
  expect(override.distanceScales.unitsPerMeter).toEqual([5, 6, 7]);
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
    outputBounds: [0, 0, 512, 512],
    inputBounds: [10, 20, 100, 200]
  });
  const source = [-50, 250, 7];
  expect(viewport.preproject!(source)).toEqual([10, 200, 7]);
  expect(source).toEqual([-50, 250, 7]);
  expect(viewport.postUnproject!([-50, 250, 7])).toEqual([10, 200, 7]);
  const changed = new CustomProjectionViewport({
    ...options,
    outputBounds: [0, 0, 512, 512],
    inputBounds: [10, 20, 100, 201]
  });
  expect(changed.projectionSignature).not.toBe(viewport.projectionSignature);
  const invalid = new CustomProjectionViewport({
    ...options,
    inputBounds: [-180, -90, 180, 90],
    projection: {forward: p => p, inverse: () => null}
  });
  expect(invalid.postUnproject!([256, 256, 0])).toBeNull();
  expect(() => new CustomProjectionViewport({...options, inputBounds: [10, 0, 0, 10]})).toThrow(
    'inputBounds'
  );
});
