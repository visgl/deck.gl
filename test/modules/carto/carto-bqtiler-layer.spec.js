import test from 'tape-catch';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoBQTilerLayer} from '@deck.gl/carto';
import {mockFetchMapsV2, restoreFetch} from './mock-fetch';
import {makeSpy} from '@probe.gl/test-utils';
import {log} from '@deck.gl/core';

test('CartoBQTilerLayer', t => {
  const fetchMock = mockFetchMapsV2();

  const testCases = generateLayerTests({
    Layer: CartoBQTilerLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});

  restoreFetch(fetchMock);
  t.end();
});

test('CartoBQTilerLayer#should throw warning message', t => {
  const fetchMock = mockFetchMapsV2();
  makeSpy(log, 'warn');

  const testCases = [
    {
      props: {
        data: 'a.b.c'
      },
      onAfterUpdate: () => {
        t.ok(log.warn.called, 'should produce a warning message');
      }
    }
  ];

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});

  log.warn.restore();
  restoreFetch(fetchMock);
  t.end();
});
