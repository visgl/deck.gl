import test from 'tape-promise/tape';
import {Fp64Extension} from '@deck.gl/extensions';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

test('Fp64Extension', t => {
  const testCases = [
    {
      props: {
        id: 'fp64-test',
        data: [
          {position: [-122.453, 37.782], timestamp: 120, entry: 13567, exit: 4802},
          {position: [-122.454, 37.781], timestamp: 140, entry: 14475, exit: 5493}
        ],
        getPosition: d => d.position
      }
    },
    {
      updateProps: {
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        extensions: [new Fp64Extension()]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.ok(uniforms.viewProjectionMatrix, 'has fp64 uniforms');
        t.ok(uniforms.viewProjectionMatrix64Low, 'has fp64 uniforms');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
