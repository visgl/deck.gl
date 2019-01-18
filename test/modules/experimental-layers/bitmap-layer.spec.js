import test from 'tape-catch';

import BitmapLayer from '@deck.gl/experimental-layers/bitmap-layer/bitmap-layer';
import {testLayer} from '@deck.gl/test-utils';

test('BitmapLayer#constructor', t => {
  const positionsWithZ = new Float32Array([2, 4, 1, 2, 8, 1, 16, 8, 1, 16, 4, 1]);
  const positions = new Float32Array([2, 4, 0, 2, 8, 0, 16, 8, 0, 16, 4, 0]);

  testLayer({
    Layer: BitmapLayer,
    testCases: [
      {
        title: 'Empty layer',
        props: {id: 'empty'}
      },
      {
        title: 'Null layer',
        props: {id: 'null', data: null}
      },
      {
        updateProps: {
          bitmapBounds: [[2, 4, 1], [2, 8, 1], [16, 8, 1], [16, 4, 1]]
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.deepEqual(
            layer.getAttributeManager().attributes.positions.value,
            positionsWithZ,
            'should update positions'
          );
          t.ok(
            layer.getAttributeManager().attributes.positions64xyLow,
            'should add positions64xyLow'
          );
        }
      },
      {
        updateProps: {
          bitmapBounds: [2, 4, 16, 8]
        },
        assert({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.deepEqual(
            layer.getAttributeManager().attributes.positions.value,
            positions,
            'should update positions'
          );
          t.ok(
            layer.getAttributeManager().attributes.positions64xyLow,
            'should add positions64xyLow'
          );
        }
      }
    ]
  });

  t.end();
});
