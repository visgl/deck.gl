// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {LineLayer} from '@deck.gl/layers';
import {preprocess} from '@luma.gl/shadertools';
import lineVertexShader from '@deck.gl/layers/line-layer/line-layer-vertex.glsl';
import lineFragmentShader from '@deck.gl/layers/line-layer/line-layer-fragment.glsl';
import {getShaderWGSL} from '@deck.gl/layers/line-layer/line-layer.wgsl';
import {lineUniforms} from '@deck.gl/layers/line-layer/line-layer-uniforms';

const LINE_DATA = [{sourcePosition: [-122.45, 37.78], targetPosition: [-122.44, 37.79]}];

test('LineLayer#antialiasing shader variants', () => {
  let previousModel: object | undefined;

  testLayer({
    Layer: LineLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {data: LINE_DATA},
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
        // wrapLongitude issues a second draw call with useShortestPath: -1. It must keep using the
        // same antialiasing shader variant.
        updateProps: {wrapLongitude: true},
        onAfterUpdate: ({layer}) => {
          expect(layer.getModels()[0]).toBe(previousModel);
          expect(layer.getShaders().defines.ANTIALIASING).toBe(1);
        }
      }
    ]
  });
});

test('LineLayer#default shader preserves the pre-antialiasing fast path', () => {
  const defaultVertexShader = preprocess(lineVertexShader);
  const defaultFragmentShader = preprocess(lineFragmentShader);
  const antialiasingVertexShader = preprocess(lineVertexShader, {defines: {ANTIALIASING: 1}});
  const antialiasingFragmentShader = preprocess(lineFragmentShader, {
    defines: {ANTIALIASING: 1}
  });

  expect(defaultVertexShader).not.toContain('coverageScale');
  expect(defaultFragmentShader).not.toContain('fwidth');
  expect(getShaderWGSL(false)).not.toContain('coverageScale');
  expect(getShaderWGSL(false)).not.toContain('fwidth');
  expect(lineUniforms.uniformTypes).not.toHaveProperty('antialiasing');

  expect(antialiasingVertexShader).toContain('coverageScale');
  expect(antialiasingFragmentShader).toContain('fwidth');
  expect(antialiasingFragmentShader).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
  expect(getShaderWGSL(true)).toContain('coverageScale');
  expect(getShaderWGSL(true)).toContain('fwidth');
  expect(getShaderWGSL(true)).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
});
