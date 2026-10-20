// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {createSpatialReference} from '@math.gl/crs';
import {mercator} from '@math.gl/projection/projections/merc';
import {createProjectionConverter} from '@deck.gl/core/projection';
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';

const projections = [mercator];

test('prepared converter uses longitude-first EPSG:4326 and retains height', async () => {
  const converter = await createProjectionConverter({
    from: 'EPSG:4326',
    to: 'EPSG:3857',
    projections
  });
  const projected = converter.forward([12, 45, 123]);
  expect(projected[0]).toBeCloseTo((6378137 * 12 * Math.PI) / 180, 6);
  expect(projected[1]).toBeCloseTo(6378137 * Math.log(Math.tan(Math.PI / 4 + Math.PI / 8)), 6);
  expect(projected[2]).toBe(123);
  const inverse = converter.inverse(projected)!;
  expect(inverse[0]).toBeCloseTo(12, 8);
  expect(inverse[1]).toBeCloseTo(45, 8);
  expect(inverse[2]).toBe(123);
});

test('converter rejects nonplanar, nonmeter and explicitly latitude-first stored coordinates', async () => {
  await expect(createProjectionConverter({to: 'EPSG:4326'})).rejects.toThrow('planar');
  await expect(
    createProjectionConverter({to: '+proj=merc +datum=WGS84 +units=ft', projections})
  ).rejects.toThrow('meters');
  const from = createSpatialReference({
    crs: {
      state: 'explicit',
      definition: 'EPSG:4326',
      representation: 'identifier',
      provenance: 'metadata'
    },
    coordinateOrder: ['latitude', 'longitude', 'height']
  });
  await expect(createProjectionConverter({from, to: 'EPSG:3857', projections})).rejects.toThrow(
    'order'
  );
});

test('source metadata gives equivalent sizing for degrees, radians, meters and feet', () => {
  function scales(kind: 'geographic' | 'projected', unitScale: number) {
    const viewport = new CustomProjectionViewport({
      fromCrs: 'opaque',
      center: [0, 0, 0],
      projection: {
        sourceCoordinates: {kind, unitScale, semiMajorAxis: 6378137, eccentricitySquared: 0},
        forward: p => [
          p[0] * unitScale * (kind === 'geographic' ? 6378137 : 1),
          p[1] * unitScale * (kind === 'geographic' ? 6378137 : 1),
          p[2] ?? 0
        ],
        inverse: p => p
      }
    });
    return viewport.getDistanceScales([0, 0]).unitsPerMeter;
  }
  const meters = scales('projected', 1);
  for (const value of [
    scales('geographic', Math.PI / 180),
    scales('geographic', 1),
    scales('projected', 0.3048)
  ]) {
    value.forEach((component, i) => expect(component).toBeCloseTo(meters[i], 10));
  }
});
