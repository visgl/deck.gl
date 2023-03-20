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

test('TextLayer - MultiIconLayer sublayer positions and offsets', t => {
  const getName = d => d.NAME;
  const getEyeColor = d => d.EYE_COLOR;

  const aliceCoordinates2d = [1, 2];
  const aliceCoordinates3d = [...aliceCoordinates2d, 0];

  const bobCoordinates2d = [3, 4];
  const bobCoordinates3d = [...bobCoordinates2d, 0];

  const emptyOffsets = [0, 0];
  const emptyCoordinates3d = [0, 0, 0];

  const testCases = [
    {
      props: {
        data: [
          {
            NAME: 'Alice',
            EYE_COLOR: 'blue',
            COORDINATES: aliceCoordinates2d
          },
          {
            NAME: 'Bob',
            EYE_COLOR: 'brown',
            COORDINATES: bobCoordinates2d
          }
        ],
        getText: getName,
        getPosition: d => d.COORDINATES,
        updateTriggers: {
          getText: [getName]
        }
      },
      onAfterUpdate: ({subLayer}) => {
        const {instancePositions, instanceOffsets} = subLayer.getAttributeManager().getAttributes();

        t.deepEqual(
          instancePositions.state.startIndices,
          [0, 'Alice'.length, ('Alice' + 'Bob').length],
          'sublayer startIndices (pre-update)'
        );

        t.deepEqual(
          instancePositions.value,
          [
            ...aliceCoordinates3d, // A
            ...aliceCoordinates3d, // l
            ...aliceCoordinates3d, // i
            ...aliceCoordinates3d, // c
            ...aliceCoordinates3d, // e

            ...bobCoordinates3d, // B
            ...bobCoordinates3d, // o
            ...bobCoordinates3d, // b

            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d
          ],
          'sublayer instancePositions (pre-update)'
        );

        t.deepEqual(
          instanceOffsets.value,
          [
            -76,
            0, // A
            -38,
            0, // l
            0,
            0, // i
            38,
            0, // c
            76,
            0, // e

            -38,
            0, // B
            0,
            0, // o
            38,
            0, // b

            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets
          ],
          'sublayer instanceOffsets (pre-update)'
        );
      }
    },
    {
      updateProps: {
        getText: getEyeColor,
        updateTriggers: {
          getText: [getEyeColor]
        }
      },
      onAfterUpdate: ({layer, subLayer}) => {
        const {instancePositions, instanceOffsets} = subLayer.getAttributeManager().getAttributes();

        t.deepEqual(
          instancePositions.state.startIndices,
          [0, 'blue'.length, ('blue' + 'brown').length],
          'sublayer startIndices (post-update)'
        );

        t.deepEqual(
          instancePositions.value,
          [
            ...aliceCoordinates3d, // b
            ...aliceCoordinates3d, // l
            ...aliceCoordinates3d, // u
            ...aliceCoordinates3d, // e

            ...bobCoordinates3d, // b
            ...bobCoordinates3d, // r
            ...bobCoordinates3d, // o
            ...bobCoordinates3d, // w
            ...bobCoordinates3d, // n

            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d,
            ...emptyCoordinates3d
          ],
          'sublayer instancePositions (post-update)'
        );

        t.deepEqual(
          instanceOffsets.value,
          [
            -57,
            0, // b
            -19,
            0, // l
            19,
            0, // u
            57,
            0, // e

            -76,
            0, // b
            -38,
            0, // r
            0,
            0, // o
            38,
            0, // w
            76,
            0, // n

            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets,
            ...emptyOffsets
          ],
          'sublayer instanceOffsets (post-update)'
        );
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
