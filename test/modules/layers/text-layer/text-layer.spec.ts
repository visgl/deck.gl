// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';

test('TextLayer', () => {
  const testCases = generateLayerTests({
    Layer: TextLayer,
    sampleProps: {
      data: FIXTURES.points,
      background: true,
      getText: d => d.ADDRESS,
      getPosition: d => d.COORDINATES
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      expect(subLayer, 'Renders sublayer').toBeTruthy();
    }
  });
  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - sdf', () => {
  const testCases = [
    {
      props: {
        data: FIXTURES.points,
        getText: d => d.ADDRESS,
        getPosition: d => d.COORDINATES
      },
      onAfterUpdate: ({subLayer}) => {
        expect(subLayer.props.sdf, 'sublayer props.sdf').toBeFalsy();
        expect(subLayer.props.alphaCutoff, 'sublayer props.alphaCutoff').toBe(0.001);
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
        expect(subLayer.props.sdf, 'sublayer props.sdf').toBeTruthy();
      }
    }
  ];
  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - MultiIconLayer sublayer positions', () => {
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

        expect(instancePositions.state.startIndices, 'sublayer startIndices (pre-update)').toEqual([
          0,
          'Alice'.length,
          ('Alice' + 'Bob').length
        ]);

        expect(
          instancePositions.value.slice(0, 3 * ('Alice' + 'Bob').length),
          'sublayer instancePositions (pre-update)'
        ).toEqual([
          ...aliceCoordinates3d, // A
          ...aliceCoordinates3d, // l
          ...aliceCoordinates3d, // i
          ...aliceCoordinates3d, // c
          ...aliceCoordinates3d, // e

          ...bobCoordinates3d, // B
          ...bobCoordinates3d, // o
          ...bobCoordinates3d // b
        ]);
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

        expect(instancePositions.state.startIndices, 'sublayer startIndices (post-update)').toEqual(
          [0, 'blue'.length, ('blue' + 'brown').length]
        );

        expect(
          instancePositions.value.slice(0, 3 * ('blue' + 'brown').length),
          'sublayer instancePositions (post-update)'
        ).toEqual([
          ...aliceCoordinates3d, // b
          ...aliceCoordinates3d, // l
          ...aliceCoordinates3d, // u
          ...aliceCoordinates3d, // e

          ...bobCoordinates3d, // b
          ...bobCoordinates3d, // r
          ...bobCoordinates3d, // o
          ...bobCoordinates3d, // w
          ...bobCoordinates3d // n
        ]);
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - special texts', () => {
  const testCases = [
    {
      props: {
        data: ['\u{F0004}', null, '\u{F0004}+\u{F0005}'],
        characterSet: 'auto',
        getText: d => d,
        getPosition: d => [0, 0]
      },
      onAfterUpdate: ({layer, subLayer}) => {
        expect(subLayer.props.numInstances, 'sublayer has correct prop').toBe(4);
        expect(subLayer.props.startIndices, 'sublayer has correct prop').toEqual([0, 1, 1, 4]);
        expect(
          layer.state.characterSet.has('\u{F0005}'),
          'characterSet is auto populated'
        ).toBeTruthy();
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - binary', () => {
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
        expect(subLayer.props.numInstances, 'sublayer has correct prop').toBe(12);
        expect(subLayer.props.startIndices, 'sublayer has correct prop').toBe(startIndices);
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
        expect(subLayer.props.numInstances, 'sublayer has correct prop').toBe(6);
        expect(subLayer.props.startIndices, 'sublayer has correct prop').toBe(startIndices2);
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - binary unicode characters', () => {
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
        expect(subLayer.props.numInstances, 'sublayer has correct prop').toBe(5);
        expect(subLayer.props.startIndices, 'sublayer has correct prop').toBe(startIndices);
        expect(
          layer.state.characterSet.has('\u{F0005}'),
          'characterSet is auto populated'
        ).toBeTruthy();
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - fontAtlasCacheLimit', () => {
  TextLayer.fontAtlasCacheLimit = 5;

  const testCases = generateLayerTests({
    Layer: TextLayer,
    sampleProps: {
      data: FIXTURES.points,
      background: true,
      getText: d => d.ADDRESS,
      getPosition: d => d.COORDINATES
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      expect(subLayer, 'Renders sublayer').toBeTruthy();
    }
  });
  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - collision layout and accessor updates', () => {
  const data = [
    {text: 'Hello\nworld', position: [0, 0]},
    {text: '   ', position: [0, 0]}
  ];
  const layouts: number[][] = [];
  testLayer({
    Layer: TextLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props: {data, extensions: [new CollisionFilterExtension()]},
        onAfterUpdate: ({layer}) => {
          const [background, characters] = layer.getSubLayers();
          expect(background.id).toBe(`${layer.id}-background`);
          const rect = background.props.getBoundingRect(data[0], {index: 0});
          layouts.push(rect);
          expect(rect[2]).toBeGreaterThan(0);
          expect(rect[3]).toBeGreaterThan(0);
          expect(background.props.getBoundingRect(data[1], {index: 1})).toEqual([0, 0, 0, 0]);
          expect(characters.props.getCollisionRect(data[0], {index: 0})).toEqual(rect);
          for (const renderPass of ['screen', 'picking:hover', 'collision']) {
            expect(layer.filterSubLayer({layer: background, renderPass})).toBe(
              renderPass === 'collision'
            );
            expect(layer.filterSubLayer({layer: characters, renderPass})).toBe(
              renderPass !== 'collision'
            );
          }
        }
      },
      {
        updateProps: {getTextAnchor: 'end', getAlignmentBaseline: 'bottom'},
        onAfterUpdate: ({layer}) => {
          const [background, characters] = layer.getSubLayers();
          const rect = background.props.getBoundingRect(data[0], {index: 0});
          expect(rect[0]).toBeLessThan(layouts[0][0]);
          expect(rect[1]).toBeLessThan(layouts[0][1]);
          const attributes = characters.getAttributeManager().getAttributes();
          const offset = characters.props.getCollisionRect(data[0], {index: 0});
          Array.from(attributes.instanceCollisionRects.value.slice(0, 4)).forEach(
            (value, index) => {
              expect(value).toBeCloseTo(offset[index], 4);
            }
          );
          layouts.push(rect);
        }
      },
      {
        updateProps: {background: true},
        onAfterUpdate: ({layer}) => {
          const [background] = layer.getSubLayers();
          expect(layer.filterSubLayer({layer: background, renderPass: 'screen'})).toBe(true);
          expect(background.props.getBoundingRect(data[1], {index: 1})[2]).toBeGreaterThan(0);
        }
      },
      {
        updateProps: {collisionEnabled: false, background: false},
        onAfterUpdate: ({layer}) => {
          expect(layer.getSubLayers()).toHaveLength(1);
          expect(layer.getSubLayers()[0].id).toBe(`${layer.id}-characters`);
        }
      }
    ]
  });
});
