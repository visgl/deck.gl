// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  _CustomProjectionViewport as CustomProjectionViewport,
  Viewport,
  WebMercatorViewport,
  project
} from '@deck.gl/core';
import {projectionEngine} from '@math.gl/geospatial/projection';
import {WGS84_CRS} from '@deck.gl/core/utils/crs';
import {createTestCRS} from './test-crs';

const normalizationScale = 512 / 40075016.6855;
const crs = await projectionEngine.getCRS('EPSG:3857');
const options = {crs, width: 800, height: 600};

test('Viewport installs the CRS before invoking overridden projectPosition', () => {
  class ProjectedViewport extends Viewport {
    projectPosition(position: number[]): [number, number, number] {
      expect(this.crs).toBeDefined();
      const projected = this.crs!.converter.WGS84.from(position);
      return [projected[0], projected[1], projected[2] * this.distanceScales.unitsPerMeter[2]];
    }
  }
  const from = vi.fn(([x, y, z = 0]) => [x * 2, y * 3, z]);
  const to = ([x, y, z = 0]) => [x / 2, y / 3, z];
  const descriptor = createTestCRS({converter: {forward: from, inverse: to}});
  const viewport = new ProjectedViewport({
    crs: descriptor,
    distanceScales: {},
    position: [10, 20, 0]
  });
  expect(from).toHaveBeenCalledExactlyOnceWith([10, 20, 0]);
  expect(viewport.center).toEqual([20, 60, 0]);
  expect(viewport.unprojectPosition(viewport.center)).toEqual([10, 20, 0]);
  from.mockClear();
  const scaled = new ProjectedViewport({
    crs: descriptor,
    position: [10, 20, 5],
    distanceScales: {
      unitsPerMeter: [2, 2, 2],
      unitsPerWorldUnit: [2, 2, 2]
    }
  });
  expect(scaled.center).toEqual([20, 60, 10]);
  expect(from).toHaveBeenCalledExactlyOnceWith([10, 20, 5]);
});

test('CustomProjectionViewport projects WGS84 XYZ through its descriptor exactly once', () => {
  const from = vi.fn(crs.converter.WGS84.from);
  const normalize = vi.fn(crs.converter.WGS84.normalize);
  const viewport = new CustomProjectionViewport({
    ...options,
    crs: {...crs, converter: {WGS84: {...crs.converter.WGS84, from, normalize}}}
  });
  from.mockClear();
  normalize.mockClear();
  const input = [-122, 38, 100];
  const expected = crs.converter.WGS84.from(input).map(value => value * normalizationScale);
  expect(viewport.projectPosition(input)).toEqual(expected);
  expect(from).toHaveBeenCalledTimes(1);
  expect(normalize).toHaveBeenCalledExactlyOnceWith(input);
  viewport
    .unprojectPosition(expected)
    .forEach((value, axis) => expect(value).toBeCloseTo(input[axis], 7));
  expect(input).toEqual([-122, 38, 100]);
  expect(viewport.projectPosition([0, 0])).toHaveLength(3);
  expect(viewport.projectPosition([0, 0])[2]).toBe(0);
});

test('CustomProjectionViewport flat methods scale target coordinates without conversion', () => {
  const viewport = new CustomProjectionViewport(options);
  const convert = vi.spyOn(viewport.crs.converter.WGS84, 'from');
  const input = [1000, -2000];
  expect(viewport.projectFlat(input)).toEqual(input.map(value => value * normalizationScale));
  viewport
    .unprojectFlat(viewport.projectFlat(input))
    .forEach((value, axis) => expect(value).toBeCloseTo(input[axis], 8));
  expect(convert).not.toHaveBeenCalled();
});

test('target feet and independent altitude units normalize to the same common space as meters', async () => {
  const crs = '+proj=merc +a=6378137 +b=6378137 +units=ft +vunits=ft';
  const feet = await projectionEngine.getCRS(crs);
  const viewport = new CustomProjectionViewport({...options, crs: feet});
  const meterViewport = new CustomProjectionViewport(options);
  expect(viewport.distanceScales.unitsPerWorldUnit).toEqual(
    new Array(3).fill(0.3048 * normalizationScale)
  );
  const input = [-122, 38, 100];
  expect(viewport.getPreprojection(WGS84_CRS).preproject!(input)[2]).toBeCloseTo(100 / 0.3048, 8);
  viewport
    .projectPosition(input)
    .forEach((value, axis) =>
      expect(value).toBeCloseTo(meterViewport.projectPosition(input)[axis], 8)
    );
  viewport
    .unprojectPosition(viewport.projectPosition(input))
    .forEach((value, axis) => expect(value).toBeCloseTo(input[axis], 8));
  viewport
    .unproject(viewport.project(input).slice(0, 2), {targetZ: input[2]})
    .forEach((value, axis) => expect(value).toBeCloseTo(input[axis], 6));
});

test('WGS84 normalization uses the target descriptor latitude and longitude interval', () => {
  const viewport = new CustomProjectionViewport(options);
  const input = [450, 100, 123];
  expect(viewport.getPreprojection(WGS84_CRS).preproject!(input)).toEqual(
    crs.converter.WGS84.from(crs.converter.WGS84.normalize(input))
  );
  expect(viewport.getPreprojection(WGS84_CRS).preproject!(input)[2]).toBe(123);
  expect(input).toEqual([450, 100, 123]);
});

test('common-space camera and pixel projection align with WebMercatorViewport', () => {
  for (const center of [
    [0, 0, 0],
    [-122, 38, 0]
  ] as [number, number, number][]) {
    for (const pitch of [0, 45]) {
      const viewport = new CustomProjectionViewport({
        ...options,
        center,
        zoom: 7,
        pitch,
        bearing: 20
      });
      const map = new WebMercatorViewport({
        width: 800,
        height: 600,
        longitude: center[0],
        latitude: center[1],
        zoom: 7,
        pitch,
        bearing: 20
      });
      const input = [center[0] + 0.1, center[1] + 0.1, 0];
      viewport
        .project(input)
        .forEach((value, axis) => expect(value).toBeCloseTo(map.project(input)[axis], 5));
      viewport
        .unproject(viewport.project(input))
        .forEach((value, axis) => expect(value).toBeCloseTo(input[axis], 6));
      expect(viewport.position).toEqual(center);
    }
  }
});

test('panByPosition retains its WGS84 anchor on the common ground plane', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    center: [-122, 38, 0],
    zoom: 8,
    pitch: 40,
    bearing: 20
  });
  const input = [-121.9, 38.1, 0];
  const {center} = viewport.panByPosition(input, [450, 350]);
  const panned = new CustomProjectionViewport({
    ...options,
    center,
    zoom: 8,
    pitch: 40,
    bearing: 20
  });
  panned
    .project(input)
    .slice(0, 2)
    .forEach((value, axis) => expect(value).toBeCloseTo([450, 350][axis], 6));
  expect(center[2]).toBe(0);
});

test('distance scales come from the target descriptor and fallback belongs to the viewport', () => {
  const getDistanceScale = vi.fn(p => (p[0] === 0 ? ([0.25, 1, 2] as const) : null));
  const descriptor = {...createTestCRS(), getRenderingScale: getDistanceScale};
  const viewport = new CustomProjectionViewport({...options, crs: descriptor});
  expect(viewport.distanceScales.unitsPerMeter).toEqual(
    [4, 1, 0.5].map(value => value * normalizationScale)
  );
  getDistanceScale.mockClear();
  expect(viewport.getDistanceScales([10, 20, 0])).toBe(viewport.distanceScales);
  expect(getDistanceScale).toHaveBeenCalledExactlyOnceWith([10, 20, 0]);
  expect(Array.from(viewport.getSizeScaleData(2))).toEqual(new Array(16).fill(0));
  expect(viewport.metersPerPixel).toBeCloseTo(1 / (0.5 * normalizationScale), 8);
  expect(project.getUniforms({viewport}).commonUnitsPerWorldUnit).toEqual(
    viewport.distanceScales.unitsPerWorldUnit
  );
});

test('invalid inverses return NaNs and navigation retains the previous center', () => {
  const descriptor = createTestCRS({converter: {forward: p => p.slice(), inverse: () => null}});
  const viewport = new CustomProjectionViewport({...options, crs: descriptor, center: [10, 20, 0]});
  expect(viewport.unprojectPosition([1, 2, 3]).every(Number.isNaN)).toBe(true);
  expect(viewport.panByPosition([10, 20, 0], [0, 0]).center).toEqual([10, 20, 0]);
});

test('projection signatures track target CRS and subdivision, independently of camera', () => {
  const viewport = new CustomProjectionViewport(options);
  expect(new CustomProjectionViewport({...options, zoom: 8, pitch: 40}).projectionSignature).toBe(
    viewport.projectionSignature
  );
  expect(
    new CustomProjectionViewport({
      ...options,
      crs: {...crs, signature: 'different-crs'}
    }).projectionSignature
  ).not.toBe(viewport.projectionSignature);
  expect(new CustomProjectionViewport({...options, resolution: 1}).projectionSignature).not.toBe(
    viewport.projectionSignature
  );
  expect(new CustomProjectionViewport({...options, resolution: 1}).sizeScaleSignature).toBe(
    viewport.sizeScaleSignature
  );
  for (const resolution of [-1, NaN, Infinity])
    expect(() => new CustomProjectionViewport({...options, resolution})).toThrow('resolution');
});

test('inverse conversion delegates to math.gl without forward validation or normalization', () => {
  const forward = vi.fn(p => p.slice());
  const inverse = vi.fn(() => [12, 34, 56]);
  const descriptor = createTestCRS({converter: {forward, inverse}});
  const normalize = vi.fn(p => p.slice());
  const viewport = new CustomProjectionViewport({
    crs: {...descriptor, converter: {WGS84: {...descriptor.converter.WGS84, normalize}}}
  });
  forward.mockClear();
  normalize.mockClear();
  expect(viewport.getPreprojection(WGS84_CRS).unpreproject!([1, 2, 3])).toEqual([12, 34, 56]);
  expect(inverse).toHaveBeenCalledExactlyOnceWith([1, 2, 3]);
  expect(forward).not.toHaveBeenCalled();
  expect(normalize).not.toHaveBeenCalled();
});

test('viewport signatures consume CRS identity independently of converters and rendering bounds', () => {
  const viewport = new CustomProjectionViewport(options);
  const sameIdentity = {
    ...crs,
    converter: {...crs.converter, WGS84: {...crs.converter.WGS84}, another: crs.converter.WGS84}
  };
  const equivalent = new CustomProjectionViewport({...options, crs: sameIdentity});
  expect(equivalent.projectionSignature).toBe(viewport.projectionSignature);
  expect(equivalent.sizeScaleSignature).toBe(viewport.sizeScaleSignature);
  const bounded = new CustomProjectionViewport({
    ...options,
    crs: {
      ...crs,
      renderingBounds: [
        [0, 0, 0],
        [100, 100, 0]
      ]
    }
  });
  expect(bounded.projectionSignature).toBe(viewport.projectionSignature);
  expect(bounded.sizeScaleSignature).not.toBe(viewport.sizeScaleSignature);
});

test('getTopDownViewport keeps the CRS and the camera target with zero pitch', async () => {
  const utm = await projectionEngine.getCRS('+proj=utm +zone=18 +datum=WGS84 +units=m');
  const center: [number, number, number] = [-75.612, 40.042, 0];
  const viewport = new CustomProjectionViewport({
    id: 'utm',
    crs: utm,
    resolution: 16,
    width: 800,
    height: 600,
    padding: {top: 40, bottom: 0, left: 10, right: 0},
    center,
    zoom: 16,
    pitch: 45,
    bearing: 30
  });
  const topDown = viewport.getTopDownViewport();

  expect(topDown).toBeInstanceOf(CustomProjectionViewport);
  expect(topDown).not.toBe(viewport);
  expect(topDown.id).toBe('utm');
  expect(topDown.crs).toBe(utm);
  expect(topDown.projectionSignature).toBe(viewport.projectionSignature);
  expect(topDown.pitch).toBe(0);
  expect(topDown.bearing).toBe(30);
  expect(topDown.zoom).toBe(16);
  expect([topDown.width, topDown.height]).toEqual([800, 600]);
  expect(topDown.padding).toEqual(viewport.padding);
  expect(topDown.position).toEqual(center);
  expect(topDown.center).toEqual(viewport.center);
  topDown
    .unprojectPosition(topDown.center)
    .forEach((value, axis) => expect(value).toBeCloseTo(center[axis], 9));
  // The camera target, not the pitched eye, stays on the same pixel.
  topDown
    .project(center)
    .slice(0, 2)
    .forEach((value, axis) => expect(value).toBeCloseTo(viewport.project(center)[axis], 6));
  // A zero-pitch eye is over the target; the pitched eye is not.
  expect(topDown.cameraPosition[0]).toBeCloseTo(viewport.center[0], 9);
  expect(topDown.cameraPosition[1]).toBeCloseTo(viewport.center[1], 9);
  expect(
    Math.hypot(...viewport.cameraPosition.slice(0, 2).map((v, i) => v - viewport.center[i]))
  ).toBeGreaterThan(1e-6);
});

test('getTopDownViewport does not change the original viewport', async () => {
  const utm = await projectionEngine.getCRS('+proj=utm +zone=18 +datum=WGS84 +units=m');
  const viewport = new CustomProjectionViewport({
    crs: utm,
    width: 640,
    height: 480,
    center: [-75.612, 40.042, 0],
    zoom: 15,
    pitch: 60,
    bearing: -20
  });
  const before = {
    pitch: viewport.pitch,
    bearing: viewport.bearing,
    zoom: viewport.zoom,
    position: viewport.position.slice(),
    center: viewport.center.slice(),
    cameraPosition: viewport.cameraPosition.slice(),
    viewMatrix: Array.from(viewport.viewMatrix),
    projectionMatrix: Array.from(viewport.projectionMatrix)
  };
  viewport.getTopDownViewport();
  expect(viewport.crs).toBe(utm);
  expect({
    pitch: viewport.pitch,
    bearing: viewport.bearing,
    zoom: viewport.zoom,
    position: viewport.position.slice(),
    center: viewport.center.slice(),
    cameraPosition: viewport.cameraPosition.slice(),
    viewMatrix: Array.from(viewport.viewMatrix),
    projectionMatrix: Array.from(viewport.projectionMatrix)
  }).toEqual(before);
});

test('fovy matches WebMercatorViewport and the top-down copy keeps it', () => {
  const viewport = new CustomProjectionViewport({...options, zoom: 12, pitch: 45, bearing: 30});
  const map = new WebMercatorViewport({width: 800, height: 600, zoom: 12, pitch: 45, bearing: 30});
  expect(viewport.fovy).toBe(map.fovy);
  expect(viewport.getTopDownViewport().fovy).toBe(map.fovy);
});

test('getTopDownViewport keeps an orthographic camera', () => {
  const pitched = new CustomProjectionViewport({
    ...options,
    center: [-75.612, 40.042, 0],
    zoom: 12,
    pitch: 45,
    bearing: 30,
    orthographic: true
  });
  const level = new CustomProjectionViewport({
    ...options,
    center: [-75.612, 40.042, 0],
    zoom: 12,
    bearing: 30,
    orthographic: true
  });
  const perspective = new CustomProjectionViewport({
    ...options,
    center: [-75.612, 40.042, 0],
    zoom: 12,
    bearing: 30
  });
  const topDown = pitched.getTopDownViewport();
  expect(Array.from(topDown.projectionMatrix)).toEqual(Array.from(level.projectionMatrix));
  // An elevated point off center shows the camera model: perspective moves it away from center.
  const raised = [-75.6, 40.05, 2000];
  for (const position of [[-75.612, 40.042, 0], raised]) {
    topDown
      .project(position)
      .forEach((value, axis) => expect(value).toBeCloseTo(level.project(position)[axis], 6));
  }
  expect(Math.abs(perspective.project(raised)[0] - level.project(raised)[0])).toBeGreaterThan(1);
  expect(pitched.orthographic).toBe(true);
  expect(perspective.orthographic).toBe(false);
  expect(topDown.orthographic).toBe(true);
});
