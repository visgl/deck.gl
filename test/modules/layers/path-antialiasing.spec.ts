// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {PathLayer} from '@deck.gl/layers';
import {preprocess} from '@luma.gl/shadertools';
import pathVertexShader from '@deck.gl/layers/path-layer/path-layer-vertex.glsl';
import pathFragmentShader from '@deck.gl/layers/path-layer/path-layer-fragment.glsl';
import {getShaderWGSL} from '@deck.gl/layers/path-layer/path-layer.wgsl';
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

  expect(defaultVertexShader).not.toContain('coverageScale');
  expect(defaultFragmentShader).not.toContain('fwidth');
  expect(getShaderWGSL(false)).not.toContain('coverageScale');
  expect(getShaderWGSL(false)).not.toContain('fwidth');
  expect(getShaderWGSL(false)).toContain('return deckgl_premultiplied_alpha(varyings.vColor);');
  expect(pathUniforms.uniformTypes).not.toHaveProperty('antialiasing');

  expect(antialiasingVertexShader).toContain('coverageScale');
  expect(antialiasingFragmentShader).toContain('fwidth');
  expect(getShaderWGSL(true)).toContain('coverageScale');
  expect(getShaderWGSL(true)).toContain('fwidth');
});
