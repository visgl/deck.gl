import {log} from '@deck.gl/core';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {CartoSQLLayer} from '@deck.gl/carto';
import {mockedV2Test} from './mock-fetch';
import {makeSpy} from '@probe.gl/test-utils';

mockedV2Test('CartoSQLLayer', t => {
  const testCases = generateLayerTests({
    Layer: CartoSQLLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: CartoSQLLayer, testCases, onError: t.notOk});
});

mockedV2Test('CartoSQLLayer#should throw warning message', t => {
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
});
