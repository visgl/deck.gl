// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {ArcLayer} from '@deck.gl/layers';
import {preprocess} from '@luma.gl/shadertools';
import arcVertexShader from '@deck.gl/layers/arc-layer/arc-layer-vertex.glsl';
import arcFragmentShader from '@deck.gl/layers/arc-layer/arc-layer-fragment.glsl';
import {shaderWGSL} from '@deck.gl/layers/arc-layer/arc-layer.wgsl';
import {arcUniforms} from '@deck.gl/layers/arc-layer/arc-layer-uniforms';

const ARC_DATA = [{sourcePosition: [-122.45, 37.78], targetPosition: [-122.44, 37.79]}];

test('ArcLayer#antialiasing shader variants', () => {
  let previousModel: object | undefined;

  testLayer({
    Layer: ArcLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {data: ARC_DATA},
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
        }
      }
    ]
  });
});

test('ArcLayer#default shader preserves the pre-antialiasing fast path', () => {
  const defaultVertexShader = preprocess(arcVertexShader);
  const defaultFragmentShader = preprocess(arcFragmentShader);
  const antialiasingVertexShader = preprocess(arcVertexShader, {defines: {ANTIALIASING: 1}});
  const antialiasingFragmentShader = preprocess(arcFragmentShader, {
    defines: {ANTIALIASING: 1}
  });
  const defaultShaderWGSL = preprocess(shaderWGSL);
  const antialiasingShaderWGSL = preprocess(shaderWGSL, {defines: {ANTIALIASING: 1}});

  expect(defaultVertexShader).not.toContain('coverageScale');
  expect(defaultFragmentShader).not.toContain('fwidth');
  expect(defaultShaderWGSL).not.toContain('coverageScale');
  expect(defaultShaderWGSL).not.toContain('fwidth');
  expect(arcUniforms.uniformTypes).not.toHaveProperty('antialiasing');

  expect(antialiasingVertexShader).toContain('coverageScale');
  expect(antialiasingFragmentShader).toContain('fwidth');
  expect(antialiasingFragmentShader).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
  expect(antialiasingShaderWGSL).toContain('coverageScale');
  expect(antialiasingShaderWGSL).toContain('fwidth');
  expect(antialiasingShaderWGSL).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
});
