// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Matrix4} from '@math.gl/core';
import {
  halton,
  getTemporalJitter,
  getJitterPhaseCount,
  getReprojectionMatrix,
  getTemporalViewportRect
} from '@deck.gl/core/passes/temporal-utils';
import LayersPass from '@deck.gl/core/passes/layers-pass';
import DrawLayersPass from '@deck.gl/core/passes/draw-layers-pass';
import PickLayersPass from '@deck.gl/core/passes/pick-layers-pass';
import ShadowPass from '@deck.gl/core/passes/shadow-pass';
import {NullDevice} from '@luma.gl/core/test-utils';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';
import {Viewport, WebMercatorViewport, _GlobeViewport as GlobeViewport} from '@deck.gl/core';

test('temporal Halton sequence and phase count', () => {
  expect([1, 2, 3, 4].map(index => halton(index, 2))).toEqual([0.5, 0.25, 0.75, 0.125]);
  expect(halton(1, 3)).toBeCloseTo(1 / 3);
  expect(getJitterPhaseCount(800, 800)).toBe(8);
  expect(getJitterPhaseCount(800, 400)).toBe(32);
  for (let i = 0; i < 64; i++) {
    const jitter = getTemporalJitter(i, 32);
    expect(jitter).toEqual(getTemporalJitter(i + 32, 32));
    for (const value of jitter) {
      expect(value).toBeGreaterThanOrEqual(-0.5);
      expect(value).toBeLessThanOrEqual(0.5);
    }
  }
});

test('temporal reprojection preserves static depth and removes jitter from camera motion', () => {
  const previous = new Matrix4()
    .perspective({fovy: 1, aspect: 2, near: 0.1, far: 100})
    .translate([0, 0, -10]);
  const current = previous.clone().translate([1, 2, 0]);
  expect(getReprojectionMatrix(current, current)).toEqual(new Matrix4());
  const point = [2, 1, 0, 1];
  const clip = current.transform(point);
  const oldClip = previous.transform(point);
  const jitter = getTemporalJitter(3, 8);
  const pixel = [
    ((clip[0] / clip[3]) * 0.5 + 0.5) * 800 + jitter[0],
    (0.5 - (clip[1] / clip[3]) * 0.5) * 400 + jitter[1]
  ];
  const depth = (clip[2] / clip[3]) * 0.5 + 0.5;
  const reconstructed = [
    ((pixel[0] - jitter[0]) / 800) * 2 - 1,
    1 - ((pixel[1] - jitter[1]) / 400) * 2,
    depth * 2 - 1,
    1
  ];
  const result = getReprojectionMatrix(current, previous).transform(reconstructed);
  for (let i = 0; i < 3; i++) {
    expect(result[i] / result[3]).toBeCloseTo(oldClip[i] / oldClip[3], 12);
  }
  const stationary = getReprojectionMatrix(current, current).transform(reconstructed);
  expect(stationary[0]).toBe(reconstructed[0]);
  expect(stationary[1]).toBe(reconstructed[1]);
  expect(stationary[2] * 0.5 + 0.5).toBe(depth);
});

test('temporal projection shears matrix and center without mutating viewport or memoized uniforms', () => {
  const viewports = [
    new Viewport({width: 800, height: 400}),
    new WebMercatorViewport({width: 800, height: 400, longitude: -122, latitude: 37, zoom: 15}),
    new GlobeViewport({width: 800, height: 400, longitude: -122, latitude: 37, zoom: 2})
  ];
  for (const viewport of viewports) {
    const original = Array.from(viewport.viewProjectionMatrix);
    const baseline = structuredClone(getUniformsFromViewport({viewport}));
    const jitter: [number, number] = [(2 * 0.25) / 800, (-2 * -0.375) / 400];
    const result = getUniformsFromViewport({viewport, jitter});
    const shear = new Matrix4();
    shear[12] = jitter[0];
    shear[13] = jitter[1];
    expect(Array.from(result.viewProjectionMatrix)).toEqual(
      Array.from(shear.clone().multiplyRight(baseline.viewProjectionMatrix))
    );
    expect(result.center).toEqual(shear.transform(baseline.center));
    const point = [1, 2, 3, 1];
    const before = new Matrix4(baseline.viewProjectionMatrix)
      .transform(point)
      .map((v, i) => v + baseline.center[i]);
    const after = new Matrix4(result.viewProjectionMatrix)
      .transform(point)
      .map((v, i) => v + result.center[i]);
    expect((after[0] / after[3] - before[0] / before[3]) * 400).toBeCloseTo(0.25, 7);
    expect((after[1] / after[3] - before[1] / before[3]) * -200).toBeCloseTo(-0.375, 7);
    expect(getUniformsFromViewport({viewport})).toEqual(baseline);
    expect(Array.from(viewport.viewProjectionMatrix)).toEqual(original);
  }
});

test('temporal viewport rectangle scales and does not clip', () => {
  expect(getTemporalViewportRect({x: 10, y: 20, width: 800, height: 400}, 0.5)).toEqual([
    5, 10, 400, 200
  ]);
  // A viewport that is partly outside the canvas keeps its size, so its projection does not change.
  expect(getTemporalViewportRect({x: -100, y: -40, width: 800, height: 400}, 1.5)).toEqual([
    -150, -60, 1200, 600
  ]);
});

test('halton exact values', () => {
  expect([1, 2, 3, 4, 5, 6].map(index => halton(index, 3))).toEqual(
    [1 / 3, 2 / 3, 1 / 9, 1 / 9 + 1 / 3, 1 / 9 + 2 / 3, 2 / 9].map(value =>
      expect.closeTo(value, 15)
    )
  );
  expect(halton(0, 2)).toBe(0);
  expect(getTemporalJitter(0, 8)).toEqual([0, expect.closeTo(1 / 3 - 0.5, 15)]);
  expect(getTemporalJitter(7, 8)).toEqual([1 / 16 - 0.5, expect.closeTo(2 / 9 + 2 / 3 - 0.5, 15)]);
  expect(getTemporalJitter(8, 8)).toEqual(getTemporalJitter(0, 8));
  expect(getTemporalJitter(1, 8)).not.toEqual(getTemporalJitter(0, 8));
  expect(getJitterPhaseCount(800, 600)).toBe(15);
  expect(getJitterPhaseCount(0, 600)).toBe(1);
});

test('only scene passes use the temporal inputs', () => {
  const device = new NullDevice({});
  const uses = (pass: LayersPass) =>
    (pass as unknown as {usesTemporalInputs: boolean}).usesTemporalInputs;
  expect(uses(new LayersPass(device))).toBe(true);
  expect(uses(new DrawLayersPass(device))).toBe(true);
  expect(uses(new PickLayersPass(device))).toBe(false);
  expect(uses(new ShadowPass(device))).toBe(false);
  device.destroy();
});

test('temporal projection applies a jitter with one zero component', () => {
  // The first Halton(2,3) sample has a zero x offset.
  const viewport = new WebMercatorViewport({
    width: 800,
    height: 400,
    longitude: -122,
    latitude: 37,
    zoom: 15
  });
  const baseline = structuredClone(getUniformsFromViewport({viewport}));
  const project = (uniforms: {viewProjectionMatrix: number[]; center: number[]}) => {
    const clip = new Matrix4(uniforms.viewProjectionMatrix)
      .transform([1, 2, 3, 1])
      .map((value, index) => value + uniforms.center[index]);
    return [clip[0] / clip[3], clip[1] / clip[3]];
  };
  const before = project(baseline as any);
  const onlyY = project(getUniformsFromViewport({viewport, jitter: [0, 0.001]}) as any);
  expect(onlyY[0] - before[0]).toBeCloseTo(0, 9);
  expect(onlyY[1] - before[1]).toBeCloseTo(0.001, 9);
  const onlyX = project(getUniformsFromViewport({viewport, jitter: [0.002, 0]}) as any);
  expect(onlyX[0] - before[0]).toBeCloseTo(0.002, 9);
  expect(onlyX[1] - before[1]).toBeCloseTo(0, 9);
  expect(getUniformsFromViewport({viewport, jitter: [0, 0]})).toEqual(baseline);
});
