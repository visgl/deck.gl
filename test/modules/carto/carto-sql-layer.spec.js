import test from 'tape-catch';
import {testLayer, testLayerAsync, generateLayerTests} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';
import {setConfig, CartoSQLLayer, API_VERSIONS} from '@deck.gl/carto';
import {MVTLayer} from '@deck.gl/geo-layers';
import {log} from '@deck.gl/core';
import {mockFetchMapsV2, restoreFetch} from './mock-fetch';

test('CartoSQLLayer', t => {
  setConfig({
    apiVersion: API_VERSIONS.V2
  });

  const fetchMock = mockFetchMapsV2();

  const testCases = generateLayerTests({
    Layer: CartoSQLLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});

  restoreFetch(fetchMock);

  t.end();
});

test('CartoSQLLayer#should throws an error due to invalid apiVersion config param', t => {
  makeSpy(log, 'assert');

  const testCases = [
    {
      props: {
        data: 'SELECT * FROM table'
      },
      onBeforeUpdate: () => {
        t.throws(
          () =>
            setConfig({
              apiVersion: 'not-allowed'
            }),
          `throws on invalid apiVersion not-allowed`
        );
      },
      onAfterUpdate: () => {
        t.ok(log.assert.called, 'should produce an assert message if apiVersion is not allowed');
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
          apiVersion: API_VERSIONS.V2
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
