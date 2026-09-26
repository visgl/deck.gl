// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport, project} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {getWorldPosition} from '@deck.gl/core/shaderlib/project/project-functions';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';

// External projection must not acquire a geospatial Cartesian scale override.
const normalizationScale = 512 / 40075016.6855;
class MeterAltitudeViewport extends CustomProjectionViewport {
  longitude = 0;
  latitude = 0;

  constructor(geospatial: boolean) {
    super({
      width: 800,
      height: 600,
      projection: {
        forward: ([x, y, z = 0]) => [x * 3, y * 4, z],
        inverse: ([x, y, z = 0]) => [x / 3, y / 4, z]
      },
      getDistanceScale: () => [0.5, 0.5]
    });
    this.isGeospatial = geospatial;
  }
}

for (const geospatial of [false, true]) {
  test(`preprojection preserves meter altitude on CPU, geospatial=${geospatial}`, () => {
    const viewport = new MeterAltitudeViewport(geospatial);
    const position = viewport.preproject!([10, 20, 50]);
    expect(position).toEqual([30, 80, 50]);
    expect(viewport.projectPosition([10, 20, 50])).toEqual([
      30 * normalizationScale,
      80 * normalizationScale,
      50 * normalizationScale
    ]);
    expect(
      getWorldPosition([10, 20, 50], {
        viewport,
        coordinateSystem: 'default',
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
      const position = viewport.preproject!([10, 20, 50]);
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
