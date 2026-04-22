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

test('TextLayer - layout updates when anchor or baseline changes', () => {
  let initialOffsets;
  let baselineOffsets;

  const testCases = [
    {
      props: {
        data: [{position: [-122.4, 37.8], text: 'collision'}],
        getText: d => d.text,
        getPosition: d => d.position,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center'
      },
      onAfterUpdate: ({subLayer}) => {
        const {instanceIconDefs} = subLayer.getAttributeManager().getAttributes();
        initialOffsets = Array.from(instanceIconDefs.value.slice(0, 2));
      }
    },
    {
      updateProps: {
        getAlignmentBaseline: 'top'
      },
      onAfterUpdate: ({subLayer}) => {
        const {instanceIconDefs} = subLayer.getAttributeManager().getAttributes();
        baselineOffsets = Array.from(instanceIconDefs.value.slice(0, 2));
        expect(
          baselineOffsets,
          'character offsets update when alignment baseline changes'
        ).not.toEqual(initialOffsets);
      }
    },
    {
      updateProps: {
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center'
      },
      onAfterUpdate: ({subLayer}) => {
        const {instanceIconDefs} = subLayer.getAttributeManager().getAttributes();
        const anchorOffsets = Array.from(instanceIconDefs.value.slice(0, 2));
        expect(anchorOffsets, 'character offsets update when text anchor changes').not.toEqual(
          initialOffsets
        );
        expect(
          anchorOffsets,
          'anchor change produces a distinct text layout from baseline change'
        ).not.toEqual(baselineOffsets);
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - collision filter forwards pixel offset to sublayers', () => {
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
        expect(
          subLayers.length,
          'renders background, character and collision marker sublayers'
        ).toBe(3);
        expect(subLayers[0].props.getPixelOffset, 'background inherits pixel offset').toEqual([
          40, 18
        ]);
        expect(subLayers[1].props.getPixelOffset, 'characters inherit pixel offset').toEqual([
          40, 18
        ]);
        expect(
          subLayers[0].props.collisionDrawMode,
          'background only samples collisions when marker layer is active'
        ).toBe('sample-only');
        expect(
          subLayers[1].props.collisionDrawMode,
          'characters only sample collisions when marker layer is active'
        ).toBe('sample-only');
        expect(
          subLayers[2].id.includes('collision-marker'),
          'marker layer is created'
        ).toBeTruthy();
        expect(subLayers[2].props.collisionDrawMode, 'marker only writes to collision map').toBe(
          'map-only'
        );
        expect(subLayers[2].props.getSize, 'marker uses text size for collision offset').toBe(
          subLayers[1].props.getSize
        );
        expect(
          subLayers[2].props.getCollisionOffset,
          'marker uses the same collision sample point as characters'
        ).toBe(subLayers[1].props.getCollisionOffset);
        expect(
          subLayers[2].props.sizeScale,
          'marker inherits text scale for collision offset'
        ).toBe(subLayers[1].props.sizeScale);
        expect(subLayers[2].props.sizeUnits, 'marker inherits text size units').toBe(
          subLayers[1].props.sizeUnits
        );
        expect(
          subLayers.every(layer =>
            layer.props.extensions?.some(
              extension => extension.constructor.extensionName === 'CollisionFilterExtension'
            )
          ),
          'collision extension is forwarded to both sublayers'
        ).toBeTruthy();
      }
    },
    {
      updateProps: {
        getPixelOffset: [0, 0],
        getTextAnchor: 'start'
      },
      onAfterUpdate: ({subLayers}) => {
        expect(subLayers.length, 'non-default text anchor still renders marker layer').toBe(3);
        expect(
          subLayers[2].id.includes('collision-marker'),
          'marker layer is created for text anchor'
        ).toBeTruthy();
      }
    },
    {
      updateProps: {
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'top'
      },
      onAfterUpdate: ({subLayers}) => {
        expect(subLayers.length, 'non-default alignment baseline still renders marker layer').toBe(
          3
        );
        expect(
          subLayers[2].id.includes('collision-marker'),
          'marker layer is created for alignment baseline'
        ).toBeTruthy();
      }
    },
    {
      updateProps: {
        getAlignmentBaseline: 'center'
      },
      onAfterUpdate: ({subLayers}) => {
        expect(subLayers.length, 'default anchor and baseline do not render marker layer').toBe(2);
        expect(
          subLayers.some(layer => layer.id.includes('collision-marker')),
          'marker layer is omitted for default anchor and baseline'
        ).toBeFalsy();
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - collision picking colors expand to every glyph', () => {
  const data = [{position: [-122.4, 37.8], text: 'ab'}];

  testLayer({
    Layer: TextLayer,
    testCases: [
      {
        props: {
          data,
          getText: d => d.text,
          getPosition: d => d.position,
          extensions: [new CollisionFilterExtension()],
          collisionEnabled: true
        },
        onAfterUpdate: ({subLayers}) => {
          const charactersLayer = subLayers.find(layer => layer.id.includes('characters'));
          expect(charactersLayer, 'characters sublayer is created').toBeTruthy();
          const {instancePickingColors} = charactersLayer!.getAttributeManager().getAttributes();
          const pickingColors = Array.from(instancePickingColors.value.slice(0, 6));

          expect(
            pickingColors.slice(0, 3),
            'first glyph stores the object picking color for collision matching'
          ).toEqual([1, 0, 0]);
          expect(
            pickingColors.slice(3, 6),
            'second glyph reuses the same object picking color'
          ).toEqual([1, 0, 0]);
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});
