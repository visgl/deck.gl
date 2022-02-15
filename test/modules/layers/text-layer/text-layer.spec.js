import test from 'tape-promise/tape';

import {TextLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

test('TextLayer', t => {
  const testCases = generateLayerTests({
    Layer: TextLayer,
    sampleProps: {
      data: FIXTURES.points,
      background: true,
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

test('TextLayer - sdf', t => {
  const testCases = [
    {
      props: {
        data: FIXTURES.points,
        getText: d => d.ADDRESS,
        getPosition: d => d.COORDINATES
      },
      onAfterUpdate: ({subLayer}) => {
        t.notOk(subLayer.props.sdf, 'sublayer props.sdf');
        t.is(subLayer.props.alphaCutoff, 0.001, 'sublayer props.alphaCutoff');
      }
    },
    {
      updateProps: {
        fontSettings: {
          sdf: true,
          buffer: 10
        }
      },
      onAfterUpdate: ({subLayer}) => {
        t.ok(subLayer.props.sdf, 'sublayer props.sdf');
      }
    }
  ];
  testLayer({Layer: TextLayer, testCases, onError: t.notOk});

  t.end();
});

test('TextLayer - special texts', t => {
  const testCases = [
    {
      props: {
        data: ['\u{F0004}', null, '\u{F0004}+\u{F0005}'],
        characterSet: 'auto',
        getText: d => d,
        getPosition: d => [0, 0]
      },
      onAfterUpdate: ({layer, subLayer}) => {
        t.is(subLayer.props.numInstances, 4, 'sublayer has correct prop');
        t.deepEqual(subLayer.props.startIndices, [0, 1, 1, 4], 'sublayer has correct prop');
        t.ok(layer.state.characterSet.has('\u{F0005}'), 'characterSet is auto populated');
      }
    }
  ];

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

test('TextLayer - binary unicode characters', t => {
  const value = new Uint32Array([7200, 983044, 983045, 43, 983044]);
  const startIndices = [0, 3];

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
        characterSet: 'auto',
        getPosition: d => [0, 0]
      },
      onAfterUpdate: ({layer, subLayer}) => {
        t.is(subLayer.props.numInstances, 5, 'sublayer has correct prop');
        t.is(subLayer.props.startIndices, startIndices, 'sublayer has correct prop');
        t.ok(layer.state.characterSet.has('\u{F0005}'), 'characterSet is auto populated');
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: t.notOk});

  t.end();
});

test('TextLayer - binary picking colors', t => {
  const p1 = [1, 2, 3];
  const p2 = [4, 5, 6];
  const c1 = [7, 8, 9];
  const c2 = [10, 11, 12];
  const testCases = [
    {
      props: {
        data: {
          length: 2,
          attributes: {
            getPosition: {value: new Float32Array([...p1, ...p2]), size: 3},
            instancePickingColors: {value: new Uint8ClampedArray([...c1, ...c2]), size: 3}
          }
        },
        getText: d => 'TEXT'
      },
      onAfterUpdate: ({layer, subLayer}) => {
        t.is(subLayer.props.numInstances, 8, 'sublayer has correct numInstances');
        t.deepEqual(subLayer.props.startIndices, [0, 4, 8], 'sublayer has correct startIndices');

        const attributeManager = subLayer.getAttributeManager();
        const {instancePositions, instancePickingColors} = attributeManager.attributes;
        t.deepEqual(
          [...instancePositions.value].slice(0, 24),
          [...p1, ...p1, ...p1, ...p1, ...p2, ...p2, ...p2, ...p2],
          'sublayer has correct instancePositions attribute'
        );
        t.deepEqual(
          [...instancePickingColors.value].slice(0, 24),
          [...c1, ...c1, ...c1, ...c1, ...c2, ...c2, ...c2, ...c2],
          'sublayer has correct instancePickingColors attribute'
        );
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: t.notOk});

  t.end();
});

test('TextLayer - fontAtlasCacheLimit', t => {
  TextLayer.fontAtlasCacheLimit = 5;

  const testCases = generateLayerTests({
    Layer: TextLayer,
    sampleProps: {
      data: FIXTURES.points,
      background: true,
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
