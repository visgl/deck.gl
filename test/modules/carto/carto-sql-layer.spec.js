import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoSQLLayer} from '@deck.gl/carto';
import {mockFetchWithTileJSON, restoreFetch} from './mock-fetch';

test('CartoSQLLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoSQLLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoSQLLayer#updateTileJSON', t => {
  const fetch = mockFetchWithTileJSON();
  const testCases = [
    {
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.notOk(spies.updateTileJSON.called, 'no data, no map instantiation');
        t.ok(spies.updateTileJSON.callCount === 0);
      }
    },
    {
      updateProps: {data: 'table_name'},
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(spies.updateTileJSON.called, 'initial data triggers map instantiation');
        t.ok(spies.updateTileJSON.callCount === 1);
      }
    },
    {
      updateProps: {data: 'table_name'},
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies.updateTileJSON.callCount === 0,
          'same data does not trigger a new map instantiation'
        );
      }
    },
    {
      updateProps: {data: 'ANOTHER_TABLE'},
      spies: ['updateTileJSON'],
      onAfterUpdate({spies}) {
        t.ok(
          spies.updateTileJSON.callCount === 1,
          'different data triggers a new map instantiation'
        );
      }
    }
  ];

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();

  restoreFetch(fetch);
});
