// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import {projectionEngine} from '@math.gl/projection';
import {Ellipsoid} from '@math.gl/geospatial';
import {Vector3} from '@math.gl/core';
import {estimateProjectionScaleError} from './projection-scale-error';

function createProjection(to: string) {
  const converter = projectionEngine.createProjection({from: 'EPSG:4326', to});
  return {forward: converter.project, inverse: converter.unproject};
}

const mercator = createProjection('EPSG:3857');
const mercatorLatitude = 85.0511287798066;
const mercatorEast = mercator.forward([180, 0])[0];
const mercatorNorth = mercator.forward([0, mercatorLatitude])[1];
const equalEarth = createProjection('+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m');
const equalEarthEast = equalEarth.forward([180, 0])[0];
const equalEarthNorth = equalEarth.forward([0, 90])[1];
const stereographic = createProjection(
  '+proj=stere +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +k=1 +R=6371008.8 +units=m'
);
const stereographicExtent = Math.abs(stereographic.forward([0, -60])[1]);
const albers = createProjection(
  '+proj=aea +lat_0=30 +lon_0=-90 +lat_1=35 +lat_2=65 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
);
const utm18 = createProjection('+proj=utm +zone=18 +datum=WGS84 +units=m');
// EPSG:5070 uses NAD83/GRS80 and the two standard parallels of the contiguous US.
const albersNad83 = createProjection(
  '+proj=aea +lat_0=23 +lon_0=-96 +lat_1=29.5 +lat_2=45.5 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs'
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
    getReferenceScale: ([, latitude]: number[]) => {
      // Spherical projection formulas still map physical WGS84 ground distances.
      const a = Ellipsoid.WGS84.radii[0];
      const b = Ellipsoid.WGS84.radii[2];
      const sinLatitude = Math.sin((latitude * Math.PI) / 180);
      const w = 1 - (1 - (b / a) ** 2) * sinLatitude ** 2;
      return (2 * 6371008.8 * w) / ((1 + sinLatitude) * b);
    }
  },
  {
    name: 'utm-18n',
    options: {
      projection: utm18,
      fromBounds: [-78, 0, -72, 84] as [number, number, number, number],
      toBounds: [100000, 0, 900000, 9400000] as [number, number, number, number]
    }
  },
  {
    name: 'albers-nad83',
    options: {
      projection: albersNad83,
      fromBounds: [-125, 24, -66, 50] as [number, number, number, number],
      toBounds: [-3000000, 0, 3000000, 3500000] as [number, number, number, number]
    }
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

test('UTM central-meridian scales match the independent 0.9996 ground-scale reference', () => {
  const projection = utm18;
  const viewport = new CustomProjectionViewport({projection});
  const normalizationScale = 512 / 40075016.6855;
  for (const latitude of [0, 42, 75]) {
    const mapPosition = projection.forward([-75, latitude]);
    for (const scale of viewport.getDistanceScales(mapPosition).unitsPerMeter) {
      expect(scale / normalizationScale, `UTM scale at latitude ${latitude}`).toBeCloseTo(
        0.9996,
        6
      );
    }
  }
});

test.each([
  {name: 'UTM 18N', projection: utm18, position: [-75, 0]},
  {name: 'UTM 18N', projection: utm18, position: [-75, 42]},
  {name: 'UTM 18N', projection: utm18, position: [-75, 75]},
  {name: 'UTM 18N', projection: utm18, position: [-78, 10]},
  {name: 'Albers NAD83', projection: albersNad83, position: [-96, 29.5]},
  {name: 'Albers NAD83', projection: albersNad83, position: [-80, 42]}
])('$name scales at $position match independent ground displacements', ({projection, position}) => {
  // Review regression locations: compare each axis and area against surface
  // displacements, independently of the estimator's ellipsoidal curvature formula.
  const step = 0.00001;
  const [longitude, latitude] = position;
  const mapOrigin = projection.forward(position);
  const mapEast = new Vector3(projection.forward([longitude + step, latitude, 0])).subtract([
    ...mapOrigin.slice(0, 2),
    0
  ]);
  const mapNorth = new Vector3(projection.forward([longitude, latitude + step, 0])).subtract([
    ...mapOrigin.slice(0, 2),
    0
  ]);
  const groundOrigin = Ellipsoid.WGS84.cartographicToCartesian([longitude, latitude, 0]);
  const groundEast = new Vector3(
    Ellipsoid.WGS84.cartographicToCartesian([longitude + step, latitude, 0])
  ).subtract(groundOrigin);
  const groundNorth = new Vector3(
    Ellipsoid.WGS84.cartographicToCartesian([longitude, latitude + step, 0])
  ).subtract(groundOrigin);
  const reference = [
    mapEast.len() / groundEast.len(),
    mapNorth.len() / groundNorth.len(),
    Math.sqrt(mapEast.cross(mapNorth).len() / groundEast.cross(groundNorth).len())
  ];
  const viewport = new CustomProjectionViewport({projection});
  const scales = viewport.getDistanceScales(mapOrigin).unitsPerMeter;
  const normalizationScale = 512 / 40075016.6855;
  for (let axis = 0; axis < 3; axis++) {
    expect(scales[axis] / normalizationScale, `axis ${axis}`).toBeCloseTo(reference[axis], 6);
  }
});

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
