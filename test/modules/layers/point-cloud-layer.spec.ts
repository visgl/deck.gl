// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';
import {UNIT} from '@deck.gl/core';
import {preprocess} from '@luma.gl/shadertools';

import {PointCloudLayer} from '@deck.gl/layers';
import pointCloudVertexShader from '@deck.gl/layers/point-cloud-layer/point-cloud-layer-vertex.glsl';
import pointCloudFragmentShader from '@deck.gl/layers/point-cloud-layer/point-cloud-layer-fragment.glsl';
import pointCloudShaderWGSL from '@deck.gl/layers/point-cloud-layer/point-cloud-layer.wgsl';
import {pointCloudUniforms} from '@deck.gl/layers/point-cloud-layer/point-cloud-layer-uniforms';

test('PointCloudLayer#loaders.gl support', () => {
  const testCases = [
    {
      props: {
        data: null
      },
      onAfterUpdate: ({layer}) => {
        expect(layer.getNumInstances(), 'returns correct instance count').toBe(0);
      }
    },
    {
      props: {
        data: {
          header: {vertexCount: 10},
          attributes: {
            POSITION: {size: 3, value: new Float32Array(30)},
            NORMAL: {size: 3, value: new Float32Array(30)},
            COLOR_0: {size: 4, value: new Uint8ClampedArray(40)}
          }
        }
      },
      onAfterUpdate: ({layer}) => {
        expect(layer.getNumInstances(), 'returns correct instance count').toBe(10);
        expect(
          layer.getAttributeManager().getAttributes().instancePositions.value,
          'used external attribute'
        ).toBe(layer.props.data.attributes.POSITION.value);
      }
    },
    {
      updateProps: {
        sizeUnits: 'meters'
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.sizeUnits, 'sizeUnits uniform "meters"').toBe(UNIT.meters);
      }
    },
    {
      updateProps: {
        sizeUnits: 'pixels'
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.sizeUnits, 'sizeUnits uniform "pixels"').toBe(UNIT.pixels);
      }
    }
  ];

  testLayer({Layer: PointCloudLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PointCloudLayer#antialiasing shader variants', () => {
  let previousModel: object | undefined;

  testLayer({
    Layer: PointCloudLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {data: []},
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

test('PointCloudLayer#default shader preserves the pre-antialiasing fast path', () => {
  const defaultVertexShader = preprocess(pointCloudVertexShader);
  const defaultFragmentShader = preprocess(pointCloudFragmentShader);
  const antialiasingVertexShader = preprocess(pointCloudVertexShader, {
    defines: {ANTIALIASING: 1}
  });
  const antialiasingFragmentShader = preprocess(pointCloudFragmentShader, {
    defines: {ANTIALIASING: 1}
  });
  const defaultShaderWGSL = preprocess(pointCloudShaderWGSL);
  const antialiasingShaderWGSL = preprocess(pointCloudShaderWGSL, {
    defines: {ANTIALIASING: 1}
  });

  expect(defaultVertexShader).not.toContain('coverageScale');
  expect(defaultFragmentShader).not.toContain('fwidth');
  expect(defaultShaderWGSL).not.toContain('coverageScale');
  expect(defaultShaderWGSL).not.toContain('fwidth');
  expect(pointCloudUniforms.uniformTypes).not.toHaveProperty('antialiasing');

  expect(antialiasingVertexShader).toContain('coverageScale');
  expect(antialiasingFragmentShader).toContain('fwidth');
  expect(antialiasingFragmentShader).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
  expect(antialiasingShaderWGSL).toContain('coverageScale');
  expect(antialiasingShaderWGSL).toContain('fwidth');
  expect(antialiasingShaderWGSL).toContain('edgePixels <= -SMOOTH_EDGE_RADIUS');
});
