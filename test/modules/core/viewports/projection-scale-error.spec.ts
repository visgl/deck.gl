// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import {projectionEngine} from '@math.gl/projection';
import type {CRSDescriptor} from '@math.gl/projection/core';
import {Ellipsoid} from '@math.gl/geospatial';
import {Vector3} from '@math.gl/core';
import {createTestCRS} from './test-crs';
import {estimateProjectionScaleError} from './projection-scale-error';

const definitions = {
  mercator: 'EPSG:3857',
  equalEarth: '+proj=eqearth +datum=WGS84 +units=m',
  utm: '+proj=utm +zone=18 +datum=WGS84 +units=m',
  albers: '+proj=aea +lat_0=23 +lon_0=-96 +lat_1=29.5 +lat_2=45.5 +datum=NAD83 +units=m',
  polar: '+proj=stere +lat_0=90 +R=6371008.8 +units=m'
};
const descriptors: Record<string, CRSDescriptor> = {};
await Promise.all(
  Object.entries(definitions).map(async ([name, definition]) => {
    descriptors[name] = await projectionEngine.getCRS(definition);
  })
);
const normalizationScale = 512 / 40075016.6855;

test.each([0, 42, 75])('UTM central-meridian XY scales match 0.9996 at latitude %s', latitude => {
  const crs = descriptors.utm;
  const viewport = new CustomProjectionViewport({crs});
  const position = crs.converter.WGS84.from([-75, latitude, 0]);
  viewport
    .getDistanceScales(position)
    .unitsPerMeter.slice(0, 2)
    .forEach(value => expect(value / normalizationScale).toBeCloseTo(0.9996, 6));
  expect(viewport.getDistanceScales(position).unitsPerMeter[2]).toBeCloseTo(
    0.9996 * normalizationScale,
    12
  );
});

test.each([
  {name: 'utm', position: [-78, 10]},
  {name: 'utm', position: [-75, 42]},
  {name: 'albers', position: [-96, 29.5]},
  {name: 'albers', position: [-80, 42]},
  {name: 'polar', position: [0, 75]}
])(
  '$name scales follow independent ground displacements on target coordinate axes',
  ({name, position}) => {
    const crs = descriptors[name];
    const viewport = new CustomProjectionViewport({crs});
    // Descriptor rendering scales measure ground distances in the WGS84 reference frame.
    const ellipsoid = Ellipsoid.WGS84;
    const target = crs.converter.WGS84.from([...position, 0]);
    const ground = ellipsoid.cartographicToCartesian([...position, 0]);
    for (const axis of [0, 1]) {
      const shifted = target.slice();
      shifted[axis] += 1;
      const reference = new Vector3(
        ellipsoid.cartographicToCartesian(crs.converter.WGS84.to(shifted))
      )
        .subtract(ground)
        .len();
      expect(
        viewport.getDistanceScales(target).unitsPerMeter[axis] / normalizationScale
      ).toBeCloseTo(1 / reference, 6);
    }
  }
);

test.each(['utm', 'albers'])('finite %s rendering bounds enable local size sampling', name => {
  const viewport = new CustomProjectionViewport({
    crs: descriptors[name]
  });
  expect(viewport.sizeScaleTransform[0]).toBeGreaterThan(0);
  expect(viewport.sizeScaleTransform[1]).toBeGreaterThan(0);
  const data = viewport.getSizeScaleData(4);
  expect(data.every(Number.isFinite)).toBe(true);
  expect(data.some((value, index) => index % 4 === 3 && value > 0)).toBe(true);
});

test('polar rendering bounds enable local size sampling', () => {
  const viewport = new CustomProjectionViewport({crs: descriptors.polar});
  expect(viewport.sizeScaleTransform[0]).toBeGreaterThan(0);
  expect(viewport.sizeScaleTransform[1]).toBeGreaterThan(0);
  expect(viewport.sizeScaleTransform[2]).toBeCloseTo(256, 10);
  expect(viewport.sizeScaleTransform[3]).toBeCloseTo(256, 10);
  const data = viewport.getSizeScaleData(4);
  expect(data.every(Number.isFinite)).toBe(true);
  for (let index = 0; index < data.length; index += 4) {
    expect(data[index]).toBeGreaterThan(0);
    expect(data[index + 3]).toBeGreaterThan(0);
  }
});

test.each(['mercator', 'equalEarth'])(
  'bounded %s sampler error is evaluated against ground displacements',
  name => {
    const options = {
      crs: descriptors[name],
      fromBounds: [
        -180,
        name === 'mercator' ? -85.0511287798066 : -90,
        180,
        name === 'mercator' ? 85.0511287798066 : 90
      ] as [number, number, number, number]
    };
    const result = estimateProjectionScaleError(options);
    for (const region of ['center', 'whole'] as const) {
      expect(result[region].positions).toBeGreaterThan(100);
      expect(result[region].boundaries).toBeGreaterThan(100);
      expect(result[region].maxima[0]).toBeLessThan(1);
      expect(result[region].maxima[1]).toBeLessThan(1);
      expect(result[region].dropouts).toBe(0);
    }
  },
  15000
);

test('scale error harness includes invalid records and measures one-sided boundary limits', () => {
  const data = new Float32Array(64 * 64 * 4);
  for (let i = 0; i < 64 * 64; i++) data.set([1, 0, 0, 1], i * 4);
  const generate = vi
    .spyOn(CustomProjectionViewport.prototype, 'getSizeScaleData')
    .mockReturnValue(data);
  const options = {
    crs: createTestCRS({bounds: [-180, -80, 180, 80]}),
    fromBounds: [-180, -80, 180, 80] as [number, number, number, number]
  };
  const settings = {divisions: 16, getReferenceScale: () => 1};
  try {
    const constant = estimateProjectionScaleError(options, settings);
    expect(constant.center.maxima).toEqual([0, 0]);
    expect(constant.whole.maxima).toEqual([0, 0]);
    // Half the records become invalid, although the converter remains valid there.
    for (let row = 0; row < 64; row++) data.fill(0, row * 64 * 4, (row * 64 + 32) * 4);
    const dropout = estimateProjectionScaleError(options, settings);
    expect(dropout.center.maxima).toEqual([100, 100]);
    expect(dropout.whole.maxima).toEqual([100, 100]);
    expect(dropout.center.dropouts).toBeGreaterThan(0);
  } finally {
    generate.mockRestore();
  }
});
