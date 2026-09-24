// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Viewport, project} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {getWorldPosition} from '@deck.gl/core/shaderlib/project/project-functions';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';

// Exercise both the initial uniform scale and the geospatial Cartesian override.
class MeterAltitudeViewport extends Viewport {
  longitude = 0;
  latitude = 0;

  constructor(geospatial: boolean) {
    super({
      width: 800,
      height: 600,
      distanceScales: {unitsPerMeter: [2, 2, 2], metersPerUnit: [0.5, 0.5, 0.5]}
    });
    this.isGeospatial = geospatial;
    this.preproject = ([x, y, z = 0]) => [x * 3, y * 4, z];
    this.postUnproject = ([x, y, z]) => [x / 3, y / 4, z];
  }

  getDistanceScales() {
    return {...this.distanceScales, unitsPerMeter2: [0, 0, 0]};
  }

  projectFlat(position: number[]): [number, number] {
    return [position[0], position[1]];
  }

  unprojectFlat(position: number[]): [number, number] {
    return [position[0], position[1]];
  }
}

for (const geospatial of [false, true]) {
  test(`preprojection preserves meter altitude on CPU, geospatial=${geospatial}`, () => {
    const viewport = new MeterAltitudeViewport(geospatial);
    const position = viewport.preproject!([10, 20, 50]);
    expect(position).toEqual([30, 80, 50]);
    expect(viewport.projectPosition(position)).toEqual([30, 80, 100]);
    expect(
      getWorldPosition([10, 20, 50], {
        viewport,
        coordinateSystem: 'cartesian',
        coordinateOrigin: [0, 0, 0]
      })
    ).toEqual([30, 80, 100]);
    expect(project.getUniforms({viewport}).commonUnitsPerWorldUnit).toEqual([1, 1, 2]);
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
      [30, 80, 100].forEach((value, i) => expect(result[i]).toBeCloseTo(value));
    }
  );
}
