import test from 'tape-promise/tape';
import {testLayer} from '@deck.gl/test-utils';
import {UNIT} from '@deck.gl/core';

import {PointCloudLayer} from '@deck.gl/layers';

test('PointCloudLayer#loaders.gl support', t => {
  const testCases = [
    {
      props: {
        data: null
      },
      onAfterUpdate: ({layer}) => {
        t.is(layer.getNumInstances(), 0, 'returns correct instance count');
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
        t.is(layer.getNumInstances(), 10, 'returns correct instance count');
        t.is(
          layer.getAttributeManager().getAttributes().instancePositions.value,
          layer.props.data.attributes.POSITION.value,
          'used external attribute'
        );
      }
    },
    {
      updateProps: {
        sizeUnits: 'meters'
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.state.model.getUniforms();
        t.ok(uniforms.sizeUnits, UNIT.meters, 'sizeUnits uniform "meters"');
      }
    },
    {
      updateProps: {
        sizeUnits: 'pixels'
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.state.model.getUniforms();
        t.is(uniforms.sizeUnits, UNIT.pixels, 'sizeUnits uniform "pixels"');
      }
    }
  ];

  testLayer({Layer: PointCloudLayer, testCases, onError: t.notOk});

  t.end();
});
