import test from 'tape-catch';

import {BitmapLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test('BitmapLayer#constructor', t => {
  const positionsWithZ = new Float32Array([2, 4, 1, 2, 8, 1, 16, 8, 1, 16, 4, 1]);
  const positions = new Float32Array([2, 4, 0, 2, 8, 0, 16, 8, 0, 16, 4, 0]);

  testLayer({
    Layer: BitmapLayer,
    onError: t.notOk,
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
          bounds: [[2, 4, 1], [2, 8, 1], [16, 8, 1], [16, 4, 1]]
        },
        onAfterUpdate({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.deepEqual(
            layer.getAttributeManager().attributes.positions.value,
            positionsWithZ,
            'should update positions'
          );
        }
      },
      {
        updateProps: {
          bounds: [2, 4, 16, 8]
        },
        onAfterUpdate({layer, oldState}) {
          t.ok(layer.state, 'should update layer state');
          t.deepEqual(
            layer.getAttributeManager().attributes.positions.value,
            positions,
            'should update positions'
          );
        }
      }
    ]
  });

  t.end();
});
