import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoBQTilerLayer} from '@deck.gl/carto';
import {mockedV2Test} from './mock-fetch';
import {makeSpy} from '@probe.gl/test-utils';
import {log} from '@deck.gl/core';

mockedV2Test('CartoBQTilerLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoBQTilerLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoBQTilerLayer, testCases, onError: t.notOk});
});

mockedV2Test('CartoBQTilerLayer#should throw warning message', t => {
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
});
