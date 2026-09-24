// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import proj4 from 'proj4';
import {estimateProjectionScaleError} from './projection-scale-error';

const mercator = proj4('EPSG:4326', 'EPSG:3857');
const mercatorLatitude = 85.0511287798066;
const mercatorEast = mercator.forward([180, 0])[0];
const mercatorNorth = mercator.forward([0, mercatorLatitude])[1];
const equalEarth = proj4('EPSG:4326', '+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m');
const equalEarthEast = equalEarth.forward([180, 0])[0];
const equalEarthNorth = equalEarth.forward([0, 90])[1];
const stereographic = proj4(
  'EPSG:4326',
  '+proj=stere +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +k=1 +R=6371008.8 +units=m'
);
const stereographicExtent = Math.abs(stereographic.forward([0, -60])[1]);
const albers = proj4(
  'EPSG:4326',
  '+proj=aea +lat_0=30 +lon_0=-90 +lat_1=35 +lat_2=65 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
);
const cases = [
  {
    name: 'web-mercator',
    options: {
      projection: mercator,
      fromBounds: [-180, -mercatorLatitude, 180, mercatorLatitude] as [
        number,
        number,
        number,
        number
      ],
      toBounds: [-mercatorEast, -mercatorNorth, mercatorEast, mercatorNorth] as [
        number,
        number,
        number,
        number
      ]
    }
  },
  {
    name: 'equal-earth',
    options: {
      projection: equalEarth,
      fromBounds: [-180, -90, 180, 90] as [number, number, number, number],
      toBounds: [-equalEarthEast, -equalEarthNorth, equalEarthEast, equalEarthNorth] as [
        number,
        number,
        number,
        number
      ]
    }
  },
  {
    name: 'stereographic',
    options: {
      projection: stereographic,
      fromBounds: [-180, -60, 180, 90] as [number, number, number, number],
      toBounds: [
        -stereographicExtent,
        -stereographicExtent,
        stereographicExtent,
        stereographicExtent
      ] as [number, number, number, number]
    },
    getReferenceScale: ([, latitude]: number[]) => 2 / (1 + Math.sin((latitude * Math.PI) / 180))
  },
  {
    name: 'albers-conic',
    options: {
      projection: albers,
      fromBounds: [-135, 30, -45, 75] as [number, number, number, number],
      toBounds: [-4500000, -500000, 4500000, 5500000] as [number, number, number, number]
    }
  }
];

test.each(cases)(
  'CustomProjectionViewport scale accuracy: $name',
  ({name, options, getReferenceScale}) => {
    const result = estimateProjectionScaleError(options, {getReferenceScale});
    console.table(
      (['center', 'whole'] as const).map(region => ({
        projection: name,
        region: region === 'center' ? '128x128' : '512x512',
        'max error (%)': result[region].maxima[0],
        'max discontinuity (%)': result[region].maxima[1],
        'invalid samples': result[region].dropouts
      }))
    );
    expect(result.center.positions).toBeGreaterThan(100);
    expect(result.center.boundaries).toBeGreaterThan(100);
    expect(result.whole.positions).toBeGreaterThan(result.center.positions);
    expect(result.whole.boundaries).toBeGreaterThan(result.center.boundaries);
    for (const region of ['center', 'whole'] as const) {
      for (let metric = 0; metric < 2; metric++) {
        expect(
          result[region].maxima[metric],
          `${name} ${region}: ${metric === 0 ? 'error' : 'discontinuity'} (%)`
        ).toBeLessThan(1);
      }
      expect(
        result[region].dropouts,
        `${name} ${region}: valid positions must have valid samples`
      ).toBe(0);
    }
    expect(result.singularPositions > 0).toBe(name === 'equal-earth');
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
    projection: {forward: (p: number[]) => p.slice(), inverse: (p: number[]) => p.slice()},
    fromBounds: [-180, -80, 180, 80] as [number, number, number, number],
    toBounds: [-180, -80, 180, 80] as [number, number, number, number]
  };
  const settings = {divisions: 16, getReferenceScale: () => 360 / 512};
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
