import test from 'tape-promise/tape';
import {MaskExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test('MaskExtension', t => {
  const testCases = [
    {
      props: {
        id: 'mask-extension-test',
        data: [],
        stroked: true,
        filled: true,
        extensions: [new MaskExtension()],

        // simulate MaskEffect parameters
        maskMap: {},
        maskBounds: [0, 10, 5, 20]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].getUniforms();
        t.ok(uniforms.mask_enabled, 'mask_enabled in uniforms');
        t.ok(uniforms.mask_maskByInstance, 'mask_maskByInstance in uniforms');
        t.ok(uniforms.mask_bounds.every(Number.isFinite), 'mask_bounds in uniforms');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
