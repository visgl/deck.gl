import test from 'tape-catch';
import {testLayer, testLayerAsync, generateLayerTests} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';
import {setConfig, CartoSQLLayer} from '@deck.gl/carto';
import {MVTLayer} from '@deck.gl/geo-layers';
import {log} from '@deck.gl/core';
import {mockFetchMapsV2, restoreFetch} from './mock-fetch';

test('CartoSQLLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoSQLLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
  t.end();
});

test('CartoSQLLayer#should throws an error due to invalid mode param', t => {
  makeSpy(log, 'assert');

  const testCases = [
    {
      props: {
        mode: 'not-allowed-mode',
        data: 'SELECT * FROM table'
      },
      onAfterUpdate: () => {
        t.ok(
          log.assert.called,
          'should produce an assert message if CartoSQLLayer mode is not allowed'
        );
      }
    }
  ];

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.ok});

  log.assert.restore();

  t.end();
});

test('CartoSQLLayer#should render a MVTLayer as sublayer', async t => {
  makeSpy(log, 'warn');
  const fetchMock = mockFetchMapsV2();

  const testCases = [
    {
      props: {
        data: 'SELECT * FROM table'
      },
      onBeforeUpdate: () => {
        setConfig({
          mode: 'carto',
          mapsUrl: 'whatever-map-url',
          accessToken: 'whatever-access-token'
        });
      },
      onAfterUpdate: ({layer, subLayer, subLayers}) => {
        t.ok(log.warn.called, 'should produce an assert message regarding the layer deprecation.');

        if (subLayer) {
          t.ok(subLayer instanceof MVTLayer, 'should be a MVTLayer layer');
        }
      }
    }
  ];

  await testLayerAsync({Layer: CartoSQLLayer, testCases, onError: t.notOk});

  log.warn.restore();
  restoreFetch(fetchMock);

  t.end();
});
