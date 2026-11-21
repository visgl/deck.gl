// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createTestCRS} from '../../viewports/test-crs';
import {WGS84_CRS} from '@deck.gl/core/utils/crs';
import {test, expect} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport, project} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {getWorldPosition} from './project-glsl-test-utils';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';

// Custom geospatial projection must not acquire a geospatial Cartesian scale override.
const normalizationScale = 512 / 40075016.6855;
class MeterAltitudeViewport extends CustomProjectionViewport {
  longitude = 0;
  latitude = 0;

  constructor(geospatial: boolean) {
    super({
      width: 800,
      height: 600,
      crs: createTestCRS({
        converter: {
          forward: ([x, y, z = 0]) => [x * 3, y * 4, z],
          inverse: ([x, y, z = 0]) => [x / 3, y / 4, z]
        },
        distanceScale: () => [0.5, 0.5, 1]
      })
    });
    this.isGeospatial = geospatial;
  }
}

for (const geospatial of [false, true]) {
  test(`preprojection preserves meter altitude on CPU, geospatial=${geospatial}`, () => {
    const viewport = new MeterAltitudeViewport(geospatial);
    const position = viewport.getPreprojection(WGS84_CRS).preproject!([10, 20, 50]);
    expect(position).toEqual([30, 80, 50]);
    expect(viewport.projectPosition([10, 20, 50])).toEqual([
      30 * normalizationScale,
      80 * normalizationScale,
      50 * normalizationScale
    ]);
    expect(
      getWorldPosition([10, 20, 50], {
        viewport,
        coordinateSystem: 'lnglat',
        coordinateOrigin: [0, 0, 0]
      })
    ).toEqual([30 * normalizationScale, 80 * normalizationScale, 50 * normalizationScale]);
    expect(project.getUniforms({viewport}).commonUnitsPerWorldUnit).toEqual(
      viewport.distanceScales.unitsPerWorldUnit
    );
    viewport
      .unproject(viewport.project(position))
      .forEach((value, i) => expect(value).toBeCloseTo(position[i]));
  });

  (device.type === 'webgl' ? test : test.skip)(
    `preprojection scales GPU altitude exactly once, geospatial=${geospatial}`,
    async () => {
      const viewport = new MeterAltitudeViewport(geospatial);
      const position = viewport.getPreprojection(WGS84_CRS).preproject!([10, 20, 50]);
      const result = await runOnGPU({
        vs: `#version 300 es
        out vec3 result;
        void main() { result = project_position(test.uPos, test.uPos64Low) + project.commonOrigin; }`,
        modules: [project, testUniforms],
        vertexCount: 1,
        varying: 'result',
        shaderInputProps: {project: {viewport}, test: {uPos: position, uPos64Low: [0, 0, 0]}}
      });
      [30 * normalizationScale, 80 * normalizationScale, 50 * normalizationScale].forEach(
        (value, i) => expect(result[i]).toBeCloseTo(value)
      );
    }
  );
}

test('Custom projection meter offsets retain local positions and project only their anchor', async () => {
  const viewport = new CustomProjectionViewport({
    width: 400,
    height: 300,
    crs: createTestCRS({
      converter: {
        forward: ([x, y, z = 0]) => [x * 1000, y * 2000, z],
        inverse: ([x, y, z = 0]) => [x / 1000, y / 2000, z]
      },
      distanceScale: ([x]) => [2 + Math.abs(x) / 1000, 3, 4]
    })
  });
  const coordinateOrigin: [number, number, number] = [-122, 38, 10];
  const props = {viewport, coordinateSystem: 'meter-offsets', coordinateOrigin};
  const origin = viewport.projectPosition(coordinateOrigin);
  const targetOrigin = viewport.crs.converter.WGS84.from(coordinateOrigin);
  const scale = viewport.getDistanceScales(targetOrigin).unitsPerMeter;
  const uniforms = project.getUniforms(props);
  expect(viewport.getPreprojection(null).preproject).toBeNull();
  expect(uniforms.commonOrigin).toEqual(origin);
  expect(uniforms.commonUnitsPerWorldUnit).toEqual(scale);
  expect(uniforms.commonUnitsPerMeter).toEqual(scale);
  for (const position of [
    [0, 0, 0],
    [10, 20, 30]
  ]) {
    const expected = origin.map((value, axis) => value + position[axis] * scale[axis]);
    expect(getWorldPosition(position, props)).toEqual(expected);
    if (device.type === 'webgl') {
      const result = await runOnGPU({
        vs: `#version 300 es
        out vec3 result;
        void main() { result = project_position(test.uPos, test.uPos64Low) + project.commonOrigin; }`,
        modules: [project, testUniforms],
        vertexCount: 1,
        varying: 'result',
        shaderInputProps: {project: props, test: {uPos: position, uPos64Low: [0, 0, 0]}}
      });
      expected.forEach((value, i) => expect(result[i]).toBeCloseTo(value, 5));
    }
  }
});
