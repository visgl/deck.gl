// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {
  nextPowOfTwo,
  buildMapping,
  autoWrapping,
  transformParagraph,
  getTextFromBuffer
} from '@deck.gl/layers/text-layer/utils';

test('TextLayer - utils#nextPowOfTwo', () => {
  const testCases = [0, 1, 2, 5];

  const results = testCases.map(number => nextPowOfTwo(number));
  const expected = [0, 1, 2, 8];

  expect(results, 'Should match expectations.').toEqual(expected);
});

test('TextLayer - utils#buildMapping', () => {
  const options = {
    characterSet: 'abcd',
    getFontWidth: char => char.charCodeAt(0) - 96,
    fontHeight: 4,
    buffer: 2,
    maxCanvasWidth: 16
  };

  const {mapping, xOffset, yOffset, canvasHeight} = buildMapping(options);

  expect(xOffset, 'xOffset should match.').toBe(15);
  expect(yOffset, 'yOffset should match.').toBe(8);
  expect(canvasHeight, 'canvasHeight should match.').toBe(16);

  /*
    ------+---------+---------
           |         |
       a   |    b    |
           |         |
    -----------+-----------+---
               |           |
         c     |     d     |
               |           |
    -----------+---------------
   */
  const expected = {
    a: {x: 2, y: 2, width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
    b: {x: 7, y: 2, width: 2, height: 8, layoutWidth: 2, layoutHeight: 4},
    c: {x: 2, y: 10, width: 3, height: 8, layoutWidth: 3, layoutHeight: 4},
    d: {x: 9, y: 10, width: 4, height: 8, layoutWidth: 4, layoutHeight: 4}
  };

  expect(mapping, 'mapping should match.').toEqual(expected);
});

test('TextLayer - utils#buildMapping with cache', () => {
  const options = {
    characterSet: 'pq',
    getFontWidth: char => char.charCodeAt(0) - 111,
    fontHeight: 4,
    buffer: 2,
    maxCanvasWidth: 16,
    mapping: {
      a: {x: 2, y: 2, width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
      s: {x: 7, y: 2, width: 2, height: 8, layoutWidth: 2, layoutHeight: 4},
      d: {x: 2, y: 10, width: 3, height: 8, layoutWidth: 3, layoutHeight: 4},
      f: {x: 9, y: 10, width: 4, height: 8, layoutWidth: 4, layoutHeight: 4}
    },
    xOffset: 15,
    yOffset: 8
  };

  const {mapping, xOffset, yOffset, canvasHeight} = buildMapping(options);

  expect(xOffset, 'xOffset should match.').toBe(11);
  expect(yOffset, 'yOffset should match.').toBe(16);
  expect(canvasHeight, 'canvasHeight should match.').toBe(32);

  const expected = {
    a: {x: 2, y: 2, width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
    s: {x: 7, y: 2, width: 2, height: 8, layoutWidth: 2, layoutHeight: 4},
    d: {x: 2, y: 10, width: 3, height: 8, layoutWidth: 3, layoutHeight: 4},
    f: {x: 9, y: 10, width: 4, height: 8, layoutWidth: 4, layoutHeight: 4},
    p: {x: 2, y: 18, width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
    q: {x: 7, y: 18, width: 2, height: 8, layoutWidth: 2, layoutHeight: 4}
  };

  expect(mapping, 'mapping should match.').toEqual(expected);
});

test('TextLayer - utils#transformParagraph - single line', () => {
  const text = 'ab';
  const lineHeight = 1.0;

  const iconMapping = {
    a: {width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
    b: {width: 2, height: 8, layoutWidth: 2, layoutHeight: 4}
  };

  const expected = {
    x: [0.5, 2],
    y: [2, 2],
    rowWidth: [3, 3],
    size: [3, 4]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);

  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#transformParagraph - multiple lines', () => {
  const text = 'ab\nc';
  const lineHeight = 1.0;

  const iconMapping = {
    a: {width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
    b: {width: 3, height: 8, layoutWidth: 3, layoutHeight: 4},
    c: {width: 2, height: 8, layoutWidth: 2, layoutHeight: 4}
  };

  const expected = {
    x: [0.5, 2.5, 0, 1],
    y: [2, 2, 0, 6],
    rowWidth: [4, 4, 0, 2],
    size: [4, 8]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);
  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#transformParagraph - unicode', () => {
  const text = '\u{F0004}\n\u{F0005}';
  const lineHeight = 1.0;

  const iconMapping = {
    ['\u{F0004}']: {width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
    ['\u{F0005}']: {width: 2, height: 8, layoutWidth: 2, layoutHeight: 4}
  };

  const expected = {
    x: [0.5, 0, 1],
    y: [2, 0, 6],
    rowWidth: [1, 0, 2],
    size: [2, 8]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);

  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#transformParagraph - multiple lines with line height', () => {
  const text = 'ab\nc';
  const lineHeight = 1.5;

  const iconMapping = {
    a: {width: 1, height: 8, layoutWidth: 1, layoutHeight: 4},
    b: {width: 3, height: 8, layoutWidth: 3, layoutHeight: 4},
    c: {width: 2, height: 8, layoutWidth: 2, layoutHeight: 4}
  };

  const expected = {
    x: [0.5, 2.5, 0, 1],
    y: [2, 2, 0, 8],
    rowWidth: [4, 4, 0, 2],
    size: [4, 12]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);
  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#autoWrapping', () => {
  const text = 'Amy: Hello, Ben.';

  const iconMapping = {
    ' ': {width: 1, layoutWidth: 1},
    A: {width: 4, layoutWidth: 4},
    m: {width: 3, layoutWidth: 3},
    y: {width: 2, layoutWidth: 2},
    ':': {width: 1, layoutWidth: 1},
    H: {width: 4, layoutWidth: 4},
    e: {width: 2, layoutWidth: 2},
    l: {width: 2, layoutWidth: 2},
    o: {width: 1, layoutWidth: 1},
    ',': {width: 2, layoutWidth: 2},
    B: {width: 1, layoutWidth: 1},
    n: {width: 3, layoutWidth: 3},
    '.': {width: 1, layoutWidth: 1}
  };

  const getStartIndices = parts => {
    const indices = [];
    let index = 0;
    for (let i = 0; i < parts.length - 1; i++) {
      index += parts[i].length;
      indices[i] = index;
    }
    return indices;
  };

  let expected = getStartIndices(['Amy: ', 'Hello, ', 'Ben.']);
  let actual = autoWrapping(text, 'break-word', 15, iconMapping);
  expect(actual, 'Should match break word.').toEqual(expected);

  expected = getStartIndices(['Amy:', ' ', 'Hell', 'o, ', 'Ben.']);
  actual = autoWrapping(text, 'break-word', 10, iconMapping);
  expect(actual, 'Should break the word when it is longer than maxWidth.').toEqual(expected);

  expected = getStartIndices(['Amy: H', 'ello, Be', 'n.']);
  actual = autoWrapping(text, 'break-all', 15, iconMapping);
  expect(actual, 'Should match break all.').toEqual(expected);

  expected = getStartIndices([
    'A',
    'm',
    'y',
    ':',
    ' ',
    'H',
    'e',
    'l',
    'l',
    'o',
    ',',
    ' ',
    'B',
    'e',
    'n',
    '.'
  ]);
  actual = autoWrapping(text, 'break-word', 1, iconMapping);
  expect(actual, "Should break all when maxWidth is smaller than a single char's width.").toEqual(
    expected
  );
});

test('TextLayer - utils#transformParagraph - autoWrapping', () => {
  const text = 'ab cd e';
  const lineHeight = 1.5;

  const iconMapping = {
    a: {width: 5, height: 8, layoutWidth: 1, layoutHeight: 4},
    b: {width: 7, height: 8, layoutWidth: 3, layoutHeight: 4},
    c: {width: 6, height: 8, layoutWidth: 2, layoutHeight: 4},
    d: {width: 14, height: 8, layoutWidth: 10, layoutHeight: 4},
    e: {width: 6, height: 8, layoutWidth: 2, layoutHeight: 4},
    ' ': {width: 5, height: 8, layoutWidth: 1, layoutHeight: 4}
  };

  const expected = {
    x: [0.5, 2.5, 4.5, 1, 7, 0.5, 2],
    y: [2, 2, 2, 8, 8, 14, 14],
    rowWidth: [5, 5, 5, 12, 12, 3, 3],
    size: [12, 18]
  };

  const transformedData = transformParagraph(text, lineHeight, 'break-word', 12, iconMapping);
  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#getTextFromBuffer', () => {
  const value = new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33]);

  let result = getTextFromBuffer({value, length: 2, startIndices: [0, 6]});
  expect(result.texts, 'binary converted to text strings').toEqual(['Hello ', 'world!']);
  expect(result.characterCount, 'returns correct character count').toBe(12);

  result = getTextFromBuffer({value, length: 2, offset: 1, startIndices: [0, 6]});
  expect(result.texts, 'binary converted to text strings').toEqual(['ello w', 'orld!']);
  expect(result.characterCount, 'returns correct character count').toBe(11);

  result = getTextFromBuffer({value, length: 2, stride: 2, offset: 1, startIndices: [0, 3]});
  expect(result.texts, 'binary converted to text strings').toEqual(['el ', 'ol!']);
  expect(result.characterCount, 'returns correct character count').toBe(6);
});
