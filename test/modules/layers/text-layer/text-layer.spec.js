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
      t.ok(subLayer, 'Renders sublayer');
    }
  });
  testLayer({Layer: TextLayer, testCases, onError: t.notOk});

  t.end();
});

test('TextLayer - binary', t => {
  const value = new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33]);
  const startIndices = [0, 6];
  const startIndices2 = [0, 3];

  const testCases = [
    {
      props: {
        data: {
          length: 2,
          startIndices,
          attributes: {
            getText: value
          }
        },
        getPosition: d => [0, 0]
      },
      onAfterUpdate: ({layer, subLayer}) => {
        t.is(subLayer.props.numInstances, 12, 'sublayer has correct prop');
        t.is(subLayer.props.startIndices, startIndices, 'sublayer has correct prop');
      }
    },
    {
      updateProps: {
        data: {
          length: 2,
          startIndices: startIndices2,
          attributes: {
            getText: {value, stride: 2, offset: 1}
          }
        }
      },
      onAfterUpdate: ({layer, subLayer}) => {
        t.is(subLayer.props.numInstances, 6, 'sublayer has correct prop');
        t.is(subLayer.props.startIndices, startIndices2, 'sublayer has correct prop');
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: t.notOk});

  t.end();
});
