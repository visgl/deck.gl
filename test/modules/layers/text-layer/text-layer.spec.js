import test from 'tape-catch';

import {TextLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

test('TextLayer', t => {
  const testCases = generateLayerTests({
    Layer: TextLayer,
    sampleProps: {
      data: FIXTURES.points,
      getText: d => d.ADDRESS,
      getPosition: d => d.COORDINATES
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      if (layer.props.data.length) {
        t.ok(layer.state.data.length, 'Creates sublayer data');
        t.ok(subLayer, 'Renders sublayer');
      }
      if (Object.prototype.hasOwnProperty.call(layer.props, '_dataDiff') && layer.props._dataDiff) {
        t.ok(Array.isArray(layer.state.dataDiff), 'created diff for sublayer');
      }
    }
  });
  testLayer({Layer: TextLayer, testCases, onError: t.notOk});

  t.end();
});
