// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  pointToHexbin,
  pointToHexbinGLSL,
  getHexbinCentroid,
  getHexbinCentroidGLSL
} from '@deck.gl/aggregation-layers/hexagon-layer/hexbin';
import {binOptionsUniforms} from '@deck.gl/aggregation-layers/hexagon-layer/bin-options-uniforms';
import {hexbin} from 'd3-hexbin';
import {device} from '@deck.gl/test-utils';
import {BufferTransform} from '@luma.gl/engine';
import {equals} from '@math.gl/core';

function pointToHexbinCentroidD3(p: [number, number], radius: number): [number, number] {
  const bins = hexbin().radius(radius)([p]);
  return [bins[0].x, bins[0].y];
}

const TestData: {p: [number, number]; radius: number}[] = [
  {p: [0, 0], radius: 1},
  {p: [3.14159, -1.5], radius: 2},
  {p: [0.567, -0.702], radius: 1},
  {p: [1.3333, 2], radius: 1},
  {p: [-124, -613], radius: 0.04},
  {p: [427, 508], radius: 0.04}
];

test('pointToHexbin vs d3-hexbin', t => {
  for (const d of TestData) {
    const bin = pointToHexbin(d.p, d.radius);
    const actual = getHexbinCentroid(bin, d.radius);
    const expected = pointToHexbinCentroidD3(d.p, d.radius);
    t.ok(equals(actual, expected, 1e-7), `point (${d.p}) bin ${bin}`);
  }

  t.end();
});

test('pointToHexbin CPU vs GPU', t => {
  const transform = new BufferTransform(device, {
    vs: `#version 300 es
    out vec2 binId;
    ${pointToHexbinGLSL}
    void main() {
      binId = vec2(pointToHexbin(binOptions.hexOriginCommon, binOptions.radiusCommon));
    }
    `,
    topology: 'point-list',
    varyings: ['binId'],
    modules: [binOptionsUniforms]
  });
  transform.model.setVertexCount(1);
  const outputBuffer = device.createBuffer({
    byteLength: 8
  });
  transform.transformFeedback.setBuffer('binId', outputBuffer);

  for (const d of TestData) {
    const expected = pointToHexbin(d.p, d.radius);
    const binOptions = {hexOriginCommon: d.p, radiusCommon: d.radius};
    transform.model.shaderInputs.setProps({binOptions});
    transform.run({discard: true});
    const result = new Float32Array(outputBuffer.readSyncWebGL().buffer);
    // tape does not consider -0 == 0
    if (equals(result, expected)) {
      t.pass(`point (${d.p}) bin ${result}`);
    } else {
      t.fail(`point (${d.p}) bin ${result}, expecting ${expected}`);
    }
  }

  transform.destroy();
  outputBuffer.destroy();
  t.end();
});

test('getHexbinCentroid CPU vs GPU', t => {
  const transform = new BufferTransform(device, {
    vs: `#version 300 es
    out vec2 position;
    ${getHexbinCentroidGLSL}
    void main() {
      position = hexbinCentroid(binOptions.hexOriginCommon, binOptions.radiusCommon);
    }
    `,
    topology: 'point-list',
    varyings: ['position'],
    modules: [binOptionsUniforms]
  });
  transform.model.setVertexCount(1);
  const outputBuffer = device.createBuffer({
    byteLength: 8
  });
  transform.transformFeedback.setBuffer('position', outputBuffer);

  for (const d of TestData) {
    const bin = pointToHexbin(d.p, d.radius);
    const binOptions = {hexOriginCommon: bin, radiusCommon: d.radius};
    transform.model.shaderInputs.setProps({binOptions});
    transform.run({discard: true});
    const expected = getHexbinCentroid(bin, d.radius);
    const result = new Float32Array(outputBuffer.readSyncWebGL().buffer);
    t.ok(equals(result, expected, 1e-7), `bin ${bin}`);
  }

  transform.destroy();
  outputBuffer.destroy();
  t.end();
});
