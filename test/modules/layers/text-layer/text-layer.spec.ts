// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {TextLayer} from '@deck.gl/layers';
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

test('TextLayer - getLetterSpacing and getTextAlign', () => {
  const data = [{text: 'ab\nc', position: [0, 0]}];
  const getLayout = layer => {
    const objectInfo = {index: 0, data, target: []};
    // Layout in font atlas pixels, without anchor or alignment
    const {x, rowWidth, size} = layer.transformParagraph(data[0], objectInfo);
    const offsets = layer.getIconOffsets(data[0], objectInfo);
    return {x, rowWidth, width: size[0], offsets: offsets.filter((_, i) => i % 2 === 0)};
  };
  let baseline;

  const testCases = [
    {
      props: {data, getTextAnchor: 'middle'},
      onAfterUpdate: ({layer}) => {
        baseline = getLayout(layer);
        // 'auto' centers each row on the anchor
        baseline.offsets.forEach((offset, i) => {
          if (i !== 2) {
            expect(offset).toBeCloseTo(baseline.x[i] - baseline.rowWidth[i] / 2);
          }
        });
      }
    },
    {
      updateProps: {getLetterSpacing: 0.25},
      onAfterUpdate: ({layer}) => {
        const {fontSize} = layer.state.fontAtlasManager.props;
        const spacing = 0.25 * fontSize;
        const {x, rowWidth, width} = getLayout(layer);
        // Spacing follows each character of a row but the last
        expect(x[0]).toBeCloseTo(baseline.x[0]);
        expect(x[1]).toBeCloseTo(baseline.x[1] + spacing);
        expect(x[3]).toBeCloseTo(baseline.x[3]);
        expect(rowWidth[0]).toBeCloseTo(baseline.rowWidth[0] + spacing);
        expect(rowWidth[3]).toBeCloseTo(baseline.rowWidth[3]);
        expect(width).toBeCloseTo(Math.max(rowWidth[0], rowWidth[3]));
      }
    },
    {
      updateProps: {getLetterSpacing: 0, getTextAnchor: 'start', getTextAlign: 'right'},
      onAfterUpdate: ({layer}) => {
        const {x, rowWidth, width, offsets} = getLayout(layer);
        // The block starts at the anchor and each row ends at its right edge
        offsets.forEach((offset, i) => {
          if (i !== 2) {
            expect(offset).toBeCloseTo(width - rowWidth[i] + x[i]);
          }
        });
      }
    },
    {
      updateProps: {getTextAnchor: 'end', getTextAlign: 'left'},
      onAfterUpdate: ({layer}) => {
        const {x, width, offsets} = getLayout(layer);
        // The block ends at the anchor and each row starts at its left edge
        offsets.forEach((offset, i) => {
          if (i !== 2) {
            expect(offset).toBeCloseTo(x[i] - width);
          }
        });
      }
    },
    {
      updateProps: {getTextAnchor: 'start', getTextAlign: 'center'},
      onAfterUpdate: ({layer}) => {
        const {x, rowWidth, width, offsets} = getLayout(layer);
        offsets.forEach((offset, i) => {
          if (i !== 2) {
            expect(offset).toBeCloseTo((width - rowWidth[i]) / 2 + x[i]);
          }
        });
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TextLayer - constant getLetterSpacing and getTextAlign update the layout', () => {
  const data = [{text: 'ab\nc', position: [0, 0]}];
  let previous;
  const getAttribute = (layer, subLayerId, name) => {
    const subLayer = layer.getSubLayers().find(l => l.id.endsWith(subLayerId));
    return Array.from(subLayer.getAttributeManager().getAttributes()[name].value);
  };
  const getState = layer => ({
    iconDefs: getAttribute(layer, 'characters', 'instanceIconDefs'),
    rects: getAttribute(layer, 'background', 'instanceRects')
  });

  const testCases = [
    {
      props: {data, background: true},
      onAfterUpdate: ({layer}) => {
        previous = getState(layer);
      }
    },
    {
      updateProps: {getLetterSpacing: 0.5},
      onAfterUpdate: ({layer}) => {
        const state = getState(layer);
        expect(state.iconDefs, 'characters are spaced').not.toEqual(previous.iconDefs);
        expect(state.rects, 'background is widened').not.toEqual(previous.rects);
        previous = state;
      }
    },
    {
      updateProps: {getTextAlign: 'left'},
      onAfterUpdate: ({layer}) => {
        const state = getState(layer);
        expect(state.iconDefs, 'rows are aligned').not.toEqual(previous.iconDefs);
        expect(state.rects, 'background is unchanged').toEqual(previous.rects);
        previous = state;
      }
    },
    {
      updateProps: {getTextAnchor: 'start', getAlignmentBaseline: 'top'},
      onAfterUpdate: ({layer}) => {
        const state = getState(layer);
        expect(state.iconDefs, 'characters are anchored').not.toEqual(previous.iconDefs);
        expect(state.rects, 'background is anchored').not.toEqual(previous.rects);
        previous = state;
      }
    },
    {
      updateProps: {getLetterSpacing: () => 0, updateTriggers: {getLetterSpacing: 0.5}},
      onAfterUpdate: ({layer}) => {
        const state = getState(layer);
        expect(state.iconDefs, 'function accessor').not.toEqual(previous.iconDefs);
        previous = state;
      }
    },
    {
      // The update trigger of the function accessor equals the new constant value
      updateProps: {getLetterSpacing: 0.5, updateTriggers: {getLetterSpacing: 1}},
      onAfterUpdate: ({layer}) => {
        const state = getState(layer);
        expect(state.iconDefs, 'function to constant accessor').not.toEqual(previous.iconDefs);
      }
    }
  ];

  testLayer({Layer: TextLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
