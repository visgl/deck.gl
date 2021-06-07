import test from 'tape-catch';
import {log} from '@deck.gl/core';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoSQLLayer} from '@deck.gl/carto';
import {mockFetchMapsV2, restoreFetch} from './mock-fetch';
import {makeSpy} from '@probe.gl/test-utils';

test('CartoSQLLayer', t => {
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

test('CartoSQLLayer#should throw warning message', t => {
  const fetchMock = mockFetchMapsV2();
  makeSpy(log, 'warn');

  const testCases = [
    {
      props: {
        data: 'SELECT * FROM table'
      },
      onAfterUpdate: () => {
        t.ok(log.warn.called, 'should produce a warning message');
      }
    }
  ];

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});

  log.warn.restore();
  restoreFetch(fetchMock);
  t.end();
});
