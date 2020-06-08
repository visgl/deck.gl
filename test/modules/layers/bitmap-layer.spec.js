import test from 'tape-catch';

import {BitmapLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';
import createMesh from '@deck.gl/layers/bitmap-layer/create-mesh';

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

test('createMesh', t => {
  const bounds = [[0, 0, 0], [0, 2, 1], [2, 3, 0], [2, 1, 1]];

  const result1 = createMesh(bounds);
  t.is(result1.vertexCount, 6, 'returns 1 quad');
  t.is(result1.positions.length, 3 * 4, 'returns 4 vertices');

  const result2 = createMesh(bounds);
  t.is(result1.indices, result2.indices, 'reuses indices array');
  t.is(result1.texCoords, result2.texCoords, 'reuses texCoords array');

  const result3 = createMesh(bounds, 1);
  t.is(result3.vertexCount, 6 * 4, 'returns 4 quads');
  t.is(result3.positions.length, 3 * 9, 'returns 9 vertices');

  t.end();
});
