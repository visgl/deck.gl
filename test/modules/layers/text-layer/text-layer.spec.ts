// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
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

test('TextLayer - MultiIconLayer sublayer positions', t => {
  const getName = d => d.NAME;
  const getEyeColor = d => d.EYE_COLOR;

  const aliceCoordinates2d = [1, 2];
  const aliceCoordinates3d = [...aliceCoordinates2d, 0];

  const bobCoordinates2d = [3, 4];
  const bobCoordinates3d = [...bobCoordinates2d, 0];

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
        const {instancePositions} = subLayer.getAttributeManager().getAttributes();

        t.deepEqual(
          instancePositions.state.startIndices,
          [0, 'Alice'.length, ('Alice' + 'Bob').length],
          'sublayer startIndices (pre-update)'
        );

        t.deepEqual(
          instancePositions.value.slice(0, 3 * ('Alice' + 'Bob').length),
          [
            ...aliceCoordinates3d, // A
            ...aliceCoordinates3d, // l
            ...aliceCoordinates3d, // i
            ...aliceCoordinates3d, // c
            ...aliceCoordinates3d, // e

            ...bobCoordinates3d, // B
            ...bobCoordinates3d, // o
            ...bobCoordinates3d // b
          ],
          'sublayer instancePositions (pre-update)'
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
        const {instancePositions} = subLayer.getAttributeManager().getAttributes();

        t.deepEqual(
          instancePositions.state.startIndices,
          [0, 'blue'.length, ('blue' + 'brown').length],
          'sublayer startIndices (post-update)'
        );

        t.deepEqual(
          instancePositions.value.slice(0, 3 * ('blue' + 'brown').length),
          [
            ...aliceCoordinates3d, // b
            ...aliceCoordinates3d, // l
            ...aliceCoordinates3d, // u
            ...aliceCoordinates3d, // e

            ...bobCoordinates3d, // b
            ...bobCoordinates3d, // r
            ...bobCoordinates3d, // o
            ...bobCoordinates3d, // w
            ...bobCoordinates3d // n
          ],
          'sublayer instancePositions (post-update)'
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

test('TextLayer - collision filter forwards pixel offset to sublayers', t => {
  const testCases = [
    {
      props: {
        data: [{position: [-122.4, 37.8], text: 'collision'}],
        background: true,
        getText: d => d.text,
        getPosition: d => d.position,
        getPixelOffset: [40, 18],
        extensions: [new CollisionFilterExtension()],
        collisionEnabled: true
      },
      onAfterUpdate: ({subLayers}) => {
        t.equal(
          subLayers.length,
          3,
          'renders background, character and collision marker sublayers'
        );
        t.deepEqual(
          subLayers[0].props.getPixelOffset,
          [40, 18],
          'background inherits pixel offset'
        );
        t.deepEqual(subLayers[1].props.getPixelOffset, [40, 18], 'characters inherit pixel offset');
        t.ok(subLayers[2].id.includes('collision-marker'), 'marker layer is created');
        t.equal(
          subLayers[2].props.collisionDrawMode,
          'map-only',
          'marker only writes to collision map'
        );
        t.ok(
          subLayers.every(layer =>
            layer.props.extensions?.some(
              extension => extension.constructor.extensionName === 'CollisionFilterExtension'
            )
          ),
          'collision extension is forwarded to both sublayers'
        );
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: t.notOk});

  t.end();
});
