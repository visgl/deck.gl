import test from 'tape-catch';
import {testLayer, testLayerAsync, generateLayerTests} from '@deck.gl/test-utils';
import {CartoSQLLayer} from '@deck.gl/carto';
import {mockFetchMapsV1, mockFetchMapsV2, restoreFetch} from './mock-fetch';
import {makeSpy} from '@probe.gl/test-utils';
import {MVTLayer} from '@deck.gl/geo-layers';

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
  const fetch = mockFetchMapsV2();

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

test('CartoSQLLayer#Maps API', async t => {
  const fetchMock = mockFetchMapsV1();

  const spy = makeSpy(MVTLayer.prototype, 'getTileData');
  spy.returns([]);

  const onAfterUpdate = ({layer, subLayers, subLayer}) => {
    const {tilejson} = layer.state;
    if (!tilejson) {
      t.is(subLayers.length, 0, 'should no render subLayers');
    } else {
      t.is(subLayers.length, 1, 'should render a subLayer');
      t.ok(Array.isArray(tilejson.tiles), 'tiles should be an array');
      t.ok(subLayer instanceof MVTLayer, 'subLayer should be a MVT layer ');
      t.is(subLayer.props.data, tilejson, 'data should be a tileJSON');
    }
  };

  const testCases = [
    {
      props: {
        data: 'table',
        credentials: {
          mapsUrl: 'https://server/api/v1/map'
        }
      },
      onBeforeUpdate: () => {
        t.comment('Maps API V1');
      },
      onAfterUpdate
    },
    {
      updateProps: {
        data: 'table2',
        credentials: null
      },
      onBeforeUpdate: () => {
        t.comment('Maps API V2');
      },
      onAfterUpdate
    }
  ];

  await testLayerAsync({Layer: CartoSQLLayer, testCases, onError: t.notOk});

  spy.restore();
  t.end();

  restoreFetch(fetchMock);
});

test('CartoSQLLayer#onDataLoad', async t => {
  const fetchMock = mockFetchMapsV2();

  const spy = makeSpy(MVTLayer.prototype, 'getTileData');
  spy.returns([]);

  let counter = 0;
  const onDataLoad = () => {
    counter++;
  };

  const testCases = [
    {
      props: {
        data: 'table',
        onDataLoad
      },
      onAfterUpdate: ({layer}) => {
        if (layer.isLoaded) t.is(counter, 1, 'should call once to onDataLoad');
      }
    }
  ];

  await testLayerAsync({Layer: CartoSQLLayer, testCases, onError: t.notOk});

  spy.restore();
  t.end();

  restoreFetch(fetchMock);
});
