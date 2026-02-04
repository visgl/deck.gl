// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';
import {UNIT} from '@deck.gl/core';

import {PointCloudLayer} from '@deck.gl/layers';

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
        expect(uniforms.sizeUnits, UNIT.meters).toBeTruthy();
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

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: PointCloudLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});
