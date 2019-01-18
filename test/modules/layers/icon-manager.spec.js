import test from 'tape';
import {buildMapping} from '@deck.gl/layers/icon-layer/icon-manager';

test('IconManager#buildMapping', t => {
  const data = [
    {
      icon: {
        width: 12,
        height: 12,
        anchorY: 12,
        url: '/icon/0'
      }
    },
    {
      icon: {
        width: 24,
        height: 24,
        anchorY: 24,
        url: '/icon/1'
      }
    },
    {
      icon: {
        width: 36,
        height: 36,
        anchorY: 36,
        url: '/icon/2'
      }
    },
    {
      icon: {
        width: 16,
        height: 16,
        anchorY: 16,
        url: '/icon/3'
      }
    },
    {
      icon: {
        width: 28,
        height: 28,
        anchorY: 28,
        url: '/icon/4'
      }
    }
  ];

  /*
   *   +-----------+----------------+----------------+
   *   | /icon/0   | /icon/1        |                |
   *   |           |                |                |
   *   |           |                |                |
   *   |           |                |                |
   *   |           |                |                |
   *   |           |                |                |
   *   +-----------+----------------+-----------+----+
   *   | /icon/2                    | /icon/3   |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   |                            |           |    |
   *   +---------------------+------+-----------+----+
   *   | /icon/4             |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   |                     |                       |
   *   +---------------------+-----------------------+
  */

  const expected = {
    '/icon/0': Object.assign({}, data[0].icon, {x: 0, y: 0}),
    '/icon/1': Object.assign({}, data[1].icon, {x: 14, y: 0}),
    '/icon/2': Object.assign({}, data[2].icon, {x: 0, y: 26}),
    '/icon/3': Object.assign({}, data[3].icon, {x: 38, y: 26}),
    '/icon/4': Object.assign({}, data[4].icon, {x: 0, y: 64})
  };

  const {mapping, canvasHeight} = buildMapping({
    icons: data.map(d => d.icon),
    buffer: 2,
    maxCanvasWidth: 64
  });

  t.deepEqual(mapping, expected, 'Should generate mapping as expectation.');
  t.equal(canvasHeight, 128, 'Canvas height should match expectation.');

  t.end();
});
