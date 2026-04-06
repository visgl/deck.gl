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
    characterSet: new Set('abcd'),
    measureText: char => ({
      advance: char.charCodeAt(0) - 96,
      width: char.charCodeAt(0) - 96,
      ascent: 3,
      descent: 1
    }),
    buffer: 2,
    maxCanvasWidth: 16
  };

  const {mapping, xOffset, yOffsetMin, yOffsetMax, canvasHeight} = buildMapping(options);

  expect(xOffset, 'xOffset should match.').toBe(15);
  expect(yOffsetMin, 'yOffsetMin should match.').toBe(8);
  expect(yOffsetMax, 'yOffsetMax should match.').toBe(16);
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
    a: {x: 2, y: 2, width: 1, height: 4, advance: 1, anchorX: 0.5, anchorY: 3},
    b: {x: 7, y: 2, width: 2, height: 4, advance: 2, anchorX: 1, anchorY: 3},
    c: {x: 2, y: 10, width: 3, height: 4, advance: 3, anchorX: 1.5, anchorY: 3},
    d: {x: 9, y: 10, width: 4, height: 4, advance: 4, anchorX: 2, anchorY: 3}
  };

  expect(mapping, 'mapping should match.').toEqual(expected);
});

test('TextLayer - utils#buildMapping with cache', () => {
  const options = {
    characterSet: new Set('pq'),
    measureText: char => ({
      advance: char.charCodeAt(0) - 111,
      width: char.charCodeAt(0) - 111,
      ascent: 3,
      descent: 1
    }),
    buffer: 2,
    maxCanvasWidth: 16,
    mapping: {
      a: {x: 2, y: 2, width: 1, height: 4, advance: 1, anchorX: 0.5, anchorY: 3},
      s: {x: 7, y: 2, width: 2, height: 4, advance: 2, anchorX: 1, anchorY: 3},
      d: {x: 2, y: 10, width: 3, height: 4, advance: 3, anchorX: 1.5, anchorY: 3},
      f: {x: 9, y: 10, width: 4, height: 4, advance: 4, anchorX: 2, anchorY: 3}
    },
    xOffset: 15,
    yOffsetMin: 8,
    yOffsetMax: 16
  };

  const {mapping, xOffset, yOffsetMin, yOffsetMax, canvasHeight} = buildMapping(options);

  expect(xOffset, 'xOffset should match.').toBe(11);
  expect(yOffsetMin, 'yOffsetMin should match.').toBe(16);
  expect(yOffsetMax, 'yOffsetMax should match.').toBe(24);
  expect(canvasHeight, 'canvasHeight should match.').toBe(32);

  const expected = {
    a: {x: 2, y: 2, width: 1, height: 4, advance: 1, anchorX: 0.5, anchorY: 3},
    s: {x: 7, y: 2, width: 2, height: 4, advance: 2, anchorX: 1, anchorY: 3},
    d: {x: 2, y: 10, width: 3, height: 4, advance: 3, anchorX: 1.5, anchorY: 3},
    f: {x: 9, y: 10, width: 4, height: 4, advance: 4, anchorX: 2, anchorY: 3},
    p: {x: 2, y: 18, width: 1, height: 4, advance: 1, anchorX: 0.5, anchorY: 3},
    q: {x: 7, y: 18, width: 2, height: 4, advance: 2, anchorX: 1, anchorY: 3}
  };

  expect(mapping, 'mapping should match.').toEqual(expected);
});

test('TextLayer - utils#transformParagraph - single line', () => {
  const text = 'ab';
  const lineHeight = 4;
  const baselineOffset = 1;

  const iconMapping = {
    a: {width: 1, height: 4, advance: 2, anchorX: 0.5, anchorY: 3},
    b: {width: 2, height: 4, advance: 3, anchorX: 1, anchorY: 3}
  };

  const expected = {
    x: [0.5, 3],
    y: [3, 3],
    rowWidth: [5, 5],
    size: [5, 4]
  };

  const transformedData = transformParagraph(
    text,
    baselineOffset,
    lineHeight,
    null,
    null,
    iconMapping
  );

  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#transformParagraph - multiple lines', () => {
  const text = 'ab\nc';
  const lineHeight = 4;
  const baselineOffset = 1;

  const iconMapping = {
    a: {width: 1, height: 4, advance: 2, anchorX: 0.5, anchorY: 3},
    b: {width: 3, height: 4, advance: 4, anchorX: 1.5, anchorY: 3},
    c: {width: 2, height: 4, advance: 3, anchorX: 1, anchorY: 3}
  };

  const expected = {
    x: [0.5, 3.5, 0, 1],
    y: [3, 3, 0, 7],
    rowWidth: [6, 6, 0, 3],
    size: [6, 8]
  };

  const transformedData = transformParagraph(
    text,
    baselineOffset,
    lineHeight,
    null,
    null,
    iconMapping
  );
  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#transformParagraph - unicode', () => {
  const text = '\u{F0004}\n\u{F0005}';
  const lineHeight = 4;
  const baselineOffset = 1;

  const iconMapping = {
    ['\u{F0004}']: {width: 1, height: 4, advance: 2, anchorX: 0.5, anchorY: 3},
    ['\u{F0005}']: {width: 2, height: 4, advance: 3, anchorX: 1, anchorY: 3}
  };

  const expected = {
    x: [0.5, 0, 1],
    y: [3, 0, 7],
    rowWidth: [2, 0, 3],
    size: [3, 8]
  };

  const transformedData = transformParagraph(
    text,
    baselineOffset,
    lineHeight,
    null,
    null,
    iconMapping
  );

  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#transformParagraph - multiple lines with line height', () => {
  const text = 'ab\nc';
  const lineHeight = 6;
  const baselineOffset = 1;

  const iconMapping = {
    a: {width: 1, height: 4, advance: 2, anchorX: 0.5, anchorY: 3},
    b: {width: 3, height: 4, advance: 4, anchorX: 1.5, anchorY: 3},
    c: {width: 2, height: 4, advance: 3, anchorX: 1, anchorY: 3}
  };

  const expected = {
    x: [0.5, 3.5, 0, 1],
    y: [4, 4, 0, 10],
    rowWidth: [6, 6, 0, 3],
    size: [6, 12]
  };

  const transformedData = transformParagraph(
    text,
    baselineOffset,
    lineHeight,
    null,
    null,
    iconMapping
  );
  expect(transformedData).toEqual(expected);
});

test('TextLayer - utils#transformParagraph - autoWrapping', () => {
  const text = 'ab cd e';
  const lineHeight = 6;
  const baselineOffset = 1;

  const iconMapping = {
    a: {width: 1, height: 4, advance: 2, anchorX: 0.5, anchorY: 3},
    b: {width: 2, height: 4, advance: 3, anchorX: 1, anchorY: 3},
    c: {width: 3, height: 4, advance: 4, anchorX: 1.5, anchorY: 3},
    d: {width: 4, height: 4, advance: 5, anchorX: 2, anchorY: 3},
    e: {width: 5, height: 4, advance: 6, anchorX: 2.5, anchorY: 3},
    ' ': {width: 1, height: 4, advance: 1, anchorX: 0.5, anchorY: 3}
  };

  const expected = {
    x: [0.5, 3, 5.5, 1.5, 6, 9.5, 2.5],
    y: [4, 4, 4, 10, 10, 10, 16],
    rowWidth: [6, 6, 6, 10, 10, 10, 6],
    size: [10, 18]
  };

  const transformedData = transformParagraph(
    text,
    baselineOffset,
    lineHeight,
    'break-word',
    12,
    iconMapping
  );
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
