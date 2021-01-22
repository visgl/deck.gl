import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoBQTilerLayer} from '@deck.gl/carto';
import {mockFetchMapsV2, restoreFetch} from './mock-fetch';

test('CartoBQTilerLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoBQTilerLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoBQTilerLayer#updateTileJSON', t => {
  const fetchMock = mockFetchMapsV2();
  const testCases = [
    {
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.notOk(spies.updateTileJSON.called, 'no data, no map instantiation');
        t.ok(spies.updateTileJSON.callCount === 0);
      }
    },
    {
      updateProps: {data: 'project.dataset.tileset_table_name'},
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(spies.updateTileJSON.called, 'initial data triggers map instantiation');
        t.ok(spies.updateTileJSON.callCount === 1);
      }
    },
    {
      updateProps: {data: 'project.dataset.tileset_table_name'},
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies.updateTileJSON.callCount === 0,
          'same data does not trigger a new map instantiation'
        );
      }
    },
    {
      updateProps: {data: 'project.dataset.ANOTHER_tileset_table_name'},
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies.updateTileJSON.callCount === 1,
          'different data triggers a new map instantiation'
        );
      }
    }
  ];

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});
  t.end();

  restoreFetch(fetchMock);
});
