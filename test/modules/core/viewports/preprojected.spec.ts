// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Matrix4} from '@math.gl/core';
import {
  Viewport,
  WebMercatorViewport,
  OrbitViewport,
  OrthographicViewport,
  _GlobeViewport as GlobeViewport,
  _CustomProjectionViewport as CustomProjectionViewport
} from '@deck.gl/core';

function close(actual: number[], expected: number[]) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, i) => expect(value).toBeCloseTo(expected[i], 5));
}

test('Viewport skips only the preprojection pair when requested', () => {
  const preproject = vi.fn(([x, y, z = 0]): [number, number, number] => [x + 10, y * 2, z * 3]);
  const postUnproject = vi.fn(([x, y, z]): [number, number, number] => [x - 10, y / 2, z / 3]);
  const viewport = new Viewport({width: 400, height: 300, preproject, postUnproject});
  const world = [2, 3, 4];
  const packed = preproject(world);
  const common = viewport.projectPosition(world);
  const pixel = viewport.project(world);
  preproject.mockClear();
  postUnproject.mockClear();
  close(viewport.projectPosition(packed, true), common);
  close(viewport.project(packed, {preprojected: true}), pixel);
  close(viewport.unprojectPosition(common, true), packed);
  close(viewport.unproject(pixel, {preprojected: true}), packed);
  close(viewport.unproject(pixel.slice(0, 2), {preprojected: true, targetZ: packed[2]}), packed);
  expect(preproject).not.toHaveBeenCalled();
  expect(postUnproject).not.toHaveBeenCalled();
  close(viewport.unprojectPosition(common), world);
  close(viewport.unproject(pixel), world);
  viewport.postUnproject = () => null;
  expect(viewport.unprojectPosition(common).every(Number.isNaN)).toBe(true);
  close(viewport.unprojectPosition(common, true), packed);
});

test('CustomProjectionViewport preprojected methods skip conversion without changing the targetZ plane', () => {
  const viewport = new CustomProjectionViewport({
    width: 800,
    height: 600,
    zoom: 10,
    pitch: 35,
    bearing: 20,
    center: [100, 200, 0],
    projection: {
      forward: ([x, y, z = 0]) => [x + 1000, y * 2, z * 0.3048 + 10],
      inverse: ([x, y, z = 0]) => [x - 1000, y / 2, (z - 10) / 0.3048]
    },
    getDistanceScale: ([x]) => [1000 / x, 1000 / x]
  });
  const preproject = vi.spyOn(viewport, 'preproject');
  const postUnproject = vi.spyOn(viewport, 'postUnproject');
  try {
    for (const topLeft of [true, false]) {
      for (const world of [
        [110, 210],
        [110, 210, 0],
        [110, 210, 100]
      ]) {
        const original = world.slice();
        const packed = viewport.preproject!(world);
        const input = world.length === 2 ? packed.slice(0, 2) : packed;
        const common = viewport.projectPosition(world);
        // Two-component preprojected positions mean zero map-meter altitude.
        const pixel = viewport.project(world, {topLeft});
        preproject.mockClear();
        postUnproject.mockClear();
        close(viewport.projectPosition(packed, true), common);
        close(viewport.unprojectPosition(common, true), packed);
        if (world.length === 3) {
          close(viewport.project(input, {topLeft, preprojected: true}), pixel);
          close(viewport.unproject(pixel, {topLeft, preprojected: true}), packed);
        } else {
          expect(viewport.project(input, {topLeft, preprojected: true})).toHaveLength(2);
        }
        const planePosition = viewport.unproject(pixel.slice(0, 2), {
          topLeft,
          preprojected: true,
          targetZ: 10
        });
        expect(preproject).not.toHaveBeenCalled();
        expect(postUnproject).not.toHaveBeenCalled();
        const worldPlanePosition = viewport.unproject(pixel.slice(0, 2), {topLeft, targetZ: 10});
        close(worldPlanePosition, [...viewport.postUnproject!(planePosition)!.slice(0, 2), 10]);
        expect(postUnproject).toHaveBeenCalled();
        expect(world).toEqual(original);
      }
    }
  } finally {
    vi.restoreAllMocks();
  }
});

test('preprojected does not change ordinary viewport behavior', () => {
  const options = {width: 800, height: 600};
  for (const viewport of [
    new Viewport({...options, viewMatrix: new Matrix4().lookAt({eye: [0, 0, 20]})}),
    new WebMercatorViewport(options),
    new GlobeViewport(options),
    new OrbitViewport(options),
    new OrthographicViewport(options)
  ]) {
    for (const world of [
      [1, 2],
      [1, 2, 3]
    ]) {
      close(viewport.projectPosition(world, true), viewport.projectPosition(world));
      const common = viewport.projectPosition(world);
      close(viewport.unprojectPosition(common, true), viewport.unprojectPosition(common));
      for (const topLeft of [true, false]) {
        const pixel = viewport.project(world, {topLeft});
        close(viewport.project(world, {topLeft, preprojected: true}), pixel);
        close(
          viewport.unproject(pixel, {topLeft, preprojected: true}),
          viewport.unproject(pixel, {topLeft})
        );
        const opts = {topLeft, targetZ: 10};
        close(
          viewport.unproject(pixel.slice(0, 2), {...opts, preprojected: true}),
          viewport.unproject(pixel.slice(0, 2), opts)
        );
      }
    }
  }
});
