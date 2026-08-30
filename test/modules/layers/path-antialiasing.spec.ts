// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {device, testLayer} from '@deck.gl/test-utils/vitest';
import {PathLayer} from '@deck.gl/layers';
import {BufferTransform} from '@luma.gl/engine';
import {preprocess} from '@luma.gl/shadertools';
import pathVertexShader from '@deck.gl/layers/path-layer/path-layer-vertex.glsl';
import pathFragmentShader from '@deck.gl/layers/path-layer/path-layer-fragment.glsl';
import {shaderWGSL} from '@deck.gl/layers/path-layer/path-layer.wgsl';
import {pathUniforms} from '@deck.gl/layers/path-layer/path-layer-uniforms';

const PATH_DATA = [
  {
    path: [
      [-122.45, 37.78],
      [-122.44, 37.79],
      [-122.43, 37.78]
    ]
  }
];

test('PathLayer#antialiasing shader variants', () => {
  let previousModel: object | undefined;

  testLayer({
    Layer: PathLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {
          data: PATH_DATA,
          getPath: d => d.path
        },
        onAfterUpdate: ({layer}) => {
          previousModel = layer.getModels()[0];
          expect(layer.getShaders().defines.ANTIALIASING).toBeUndefined();
        }
      },
      {
        updateProps: {antialiasing: true},
        onAfterUpdate: ({layer}) => {
          const model = layer.getModels()[0];
          expect(model, 'model is recreated for the enabled variant').not.toBe(previousModel);
          expect(layer.getShaders().defines.ANTIALIASING).toBe(1);
          previousModel = model;
        }
      },
      {
        updateProps: {antialiasing: false},
        onAfterUpdate: ({layer}) => {
          const model = layer.getModels()[0];
          expect(model, 'model is recreated for the disabled variant').not.toBe(previousModel);
          expect(layer.getShaders().defines.ANTIALIASING).toBeUndefined();
        }
      }
    ]
  });
});

test('PathLayer#default shader preserves the pre-antialiasing fast path', () => {
  const defaultVertexShader = preprocess(pathVertexShader);
  const defaultFragmentShader = preprocess(pathFragmentShader);
  const antialiasingVertexShader = preprocess(pathVertexShader, {defines: {ANTIALIASING: 1}});
  const antialiasingFragmentShader = preprocess(pathFragmentShader, {
    defines: {ANTIALIASING: 1}
  });
  const dashVertexShader = preprocess(pathVertexShader, {defines: {DASH_ENABLED: 1}});
  const defaultShaderWGSL = preprocess(shaderWGSL);
  const antialiasingShaderWGSL = preprocess(shaderWGSL, {defines: {ANTIALIASING: 1}});
  const dashShaderWGSL = preprocess(shaderWGSL, {defines: {DASH_ENABLED: 1}});

  expect(defaultVertexShader).not.toContain('coverageScale');
  expect(defaultFragmentShader).not.toContain('fwidth');
  expect(defaultShaderWGSL).not.toContain('coverageScale');
  expect(defaultShaderWGSL).not.toContain('fwidth');
  expect(defaultShaderWGSL).toContain('return deckgl_premultiplied_alpha(varyings.vColor);');
  expect(pathUniforms.uniformTypes).not.toHaveProperty('antialiasing');

  for (const shader of [
    defaultVertexShader,
    antialiasingVertexShader,
    defaultShaderWGSL,
    antialiasingShaderWGSL
  ]) {
    expect(shader).not.toContain('sourcePathLength');
    expect(shader).not.toContain('currLength2D');
    expect(shader).not.toContain('arcLengthRatio');
    expect(shader).not.toContain('currentDeltaCommon');
    expect(shader).not.toContain('billboardPathLength');
    expect(shader).not.toContain('getClippedPathRange');
    expect(shader).not.toContain('sourcePathRange');
    expect(shader).not.toContain('pathPositionOffset');
  }

  for (const shader of [dashVertexShader, dashShaderWGSL]) {
    expect(shader).toContain('sourcePathLength');
    expect(shader).toContain('currLength2D');
    expect(shader).toContain('arcLengthRatio');
    expect(shader).toContain('currentDeltaCommon');
    expect(shader).toContain('billboardPathLength');
    expect(shader).toContain('getClippedPathRange');
    expect(shader).toContain('sourcePathRange');
    expect(shader).toContain('pathPositionOffset');
    expect(shader).toContain(
      'visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x)'
    );
    expect(shader).toContain('pathPositionOffset = sourcePathLength * sourcePathRange.x');
    expect(shader).toContain('pathLength = sourcePathLength');
    expect(shader).toContain(
      'pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio'
    );
  }

  expect(antialiasingVertexShader).toContain('coverageScale');
  expect(antialiasingFragmentShader).toContain('fwidth');
  expect(antialiasingFragmentShader).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
  expect(antialiasingShaderWGSL).toContain('coverageScale');
  expect(antialiasingShaderWGSL).toContain('fwidth');
  expect(antialiasingShaderWGSL).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
});

const webglTest = BufferTransform.isSupported(device) ? test : test.skip;

webglTest('PathLayer#dash clipping preserves the visible source interval', () => {
  const helperMatch = preprocess(pathVertexShader, {defines: {DASH_ENABLED: 1}}).match(
    /vec2 getClippedPathRange[\s\S]*?\n}\n/
  );
  expect(helperMatch, 'compiled dash shader contains the clipping helper').toBeTruthy();
  const clippingHelper = helperMatch?.[0] || '';
  const clipStartW = device.createBuffer({data: new Float32Array([-1, 1, 1, -2])});
  const clipEndW = device.createBuffer({data: new Float32Array([1, -1, 2, -1])});
  const clippedPathRange = device.createBuffer({byteLength: 4 * 2 * 4});
  const transform = new BufferTransform(device, {
    vs: `#version 300 es
const float EPSILON = 0.001;
${clippingHelper}
in float clipStartW;
in float clipEndW;
out vec2 clippedPathRange;
void main() {
  clippedPathRange = getClippedPathRange(clipStartW, clipEndW);
  gl_Position = vec4(0.0);
}
`,
    varyings: ['clippedPathRange'],
    bufferLayout: [
      {name: 'clipStartW', format: 'float32'},
      {name: 'clipEndW', format: 'float32'}
    ]
  });

  try {
    transform.model.setVertexCount(4);
    transform.run({
      inputBuffers: {clipStartW, clipEndW},
      outputBuffers: {clippedPathRange}
    });

    const actual = new Float32Array(clippedPathRange.readSyncWebGL().buffer);
    const expected = new Float32Array([0.5005, 1, 0, 0.4995, 0, 1, 0, 0]);
    for (let index = 0; index < expected.length; index++) {
      expect(actual[index], `range value ${index}`).toBeCloseTo(expected[index], 6);
    }
  } finally {
    transform.destroy();
    clipStartW.destroy();
    clipEndW.destroy();
    clippedPathRange.destroy();
  }
});
