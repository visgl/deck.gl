// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport, project} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';
import {getWorldPosition} from '@deck.gl/core/shaderlib/project/project-functions';

const gpuTest = device.type === 'webgl' ? test : test.skip;

gpuTest('CustomProjectionViewport projects meter altitude on CPU and GPU', async () => {
  const viewport = new CustomProjectionViewport({
    projection: {forward: p => p.slice(), inverse: p => p.slice()},
    outputBounds: [0, 0, 1024, 1024],
    getUnitsPerMeter: () => [2, 3, 4]
  });
  const input = [200, 300, 50];
  const position = viewport.preproject!(input);
  expect(position).toEqual([100, 150, 50]);
  const common = viewport.projectPosition(position);
  expect(common).toEqual([100, 150, 100]);
  expect(
    getWorldPosition(input, {
      viewport,
      coordinateSystem: 'cartesian',
      coordinateOrigin: [0, 0, 0]
    })
  ).toEqual(common);
  const result = await runOnGPU({
    vs: `#version 300 es
      out vec3 result;
      void main() { result = project_position(test.uPos, test.uPos64Low) + project.commonOrigin; }`,
    modules: [project, testUniforms],
    vertexCount: 1,
    varying: 'result',
    shaderInputProps: {project: {viewport}, test: {uPos: position, uPos64Low: [0, 0, 0]}}
  });
  common.forEach((value, i) => expect(result[i]).toBeCloseTo(value));
});
