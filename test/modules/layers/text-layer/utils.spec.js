import test from 'tape-catch';

import {
  nextPowOfTwo,
  buildMapping,
  autoWrapping,
  transformParagraph,
  getTextFromBuffer
} from '@deck.gl/layers/text-layer/utils';

test('TextLayer - utils#nextPowOfTwo', t => {
  const testCases = [0, 1, 2, 5];

  const results = testCases.map(number => nextPowOfTwo(number));
  const expected = [0, 1, 2, 8];

  t.deepEqual(results, expected, 'Should match expectations.');

  t.end();
});

test('TextLayer - utils#buildMapping', t => {
  const options = {
    characterSet: 'asdf',
    getFontWidth: (char, i) => i + 1,
    fontHeight: 4,
    buffer: 2,
    maxCanvasWidth: 16
  };

  const {mapping, xOffset, yOffset, canvasHeight} = buildMapping(options);

  t.equal(xOffset, 15, 'xOffset should match.');
  t.equal(yOffset, 8, 'yOffset should match.');
  t.equal(canvasHeight, 16, 'canvasHeight should match.');

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
    a: {x: 2, y: 2, width: 1, height: 4},
    s: {x: 7, y: 2, width: 2, height: 4},
    d: {x: 2, y: 10, width: 3, height: 4},
    f: {x: 9, y: 10, width: 4, height: 4}
  };

  t.deepEqual(mapping, expected, 'mapping should match.');

  t.end();
});

test('TextLayer - utils#buildMapping with cache', t => {
  const options = {
    characterSet: 'kl',
    getFontWidth: (char, i) => i + 1,
    fontHeight: 4,
    buffer: 2,
    maxCanvasWidth: 16,
    mapping: {
      a: {x: 2, y: 2, width: 1, height: 4},
      s: {x: 7, y: 2, width: 2, height: 4},
      d: {x: 2, y: 10, width: 3, height: 4},
      f: {x: 9, y: 10, width: 4, height: 4}
    },
    xOffset: 15,
    yOffset: 8
  };

  const {mapping, xOffset, yOffset, canvasHeight} = buildMapping(options);

  t.equal(xOffset, 11, 'xOffset should match.');
  t.equal(yOffset, 16, 'yOffset should match.');
  t.equal(canvasHeight, 32, 'canvasHeight should match.');

  const expected = {
    a: {x: 2, y: 2, width: 1, height: 4},
    s: {x: 7, y: 2, width: 2, height: 4},
    d: {x: 2, y: 10, width: 3, height: 4},
    f: {x: 9, y: 10, width: 4, height: 4},
    k: {x: 2, y: 18, width: 1, height: 4},
    l: {x: 7, y: 18, width: 2, height: 4}
  };

  t.deepEqual(mapping, expected, 'mapping should match.');

  t.end();
});

test('TextLayer - utils#transformParagraph - single line', t => {
  const text = 'ab';
  const lineHeight = 1.0;

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 2, height: 4}
  };

  const expected = {
    x: [0.5, 2],
    y: [2, 2],
    rowWidth: [3, 3],
    size: [3, 4]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);

  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#transformParagraph - multiple lines', t => {
  const text = 'ab\nc';
  const lineHeight = 1.0;

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 3, height: 4},
    c: {width: 2, height: 4}
  };

  const expected = {
    x: [0.5, 2.5, 0, 1],
    y: [2, 2, 0, 6],
    rowWidth: [4, 4, 0, 2],
    size: [4, 8]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);
  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#transformParagraph - unicode', t => {
  const text = '\u{F0004}\n\u{F0005}';
  const lineHeight = 1.0;

  const iconMapping = {
    ['\u{F0004}']: {width: 1, height: 4},
    ['\u{F0005}']: {width: 2, height: 4}
  };

  const expected = {
    x: [0.5, 0, 1],
    y: [2, 0, 6],
    rowWidth: [1, 0, 2],
    size: [2, 8]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);

  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#transformParagraph - multiple lines with line height', t => {
  const text = 'ab\nc';
  const lineHeight = 1.5;

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 3, height: 4},
    c: {width: 2, height: 4}
  };

  const expected = {
    x: [0.5, 2.5, 0, 1],
    y: [2, 2, 0, 8],
    rowWidth: [4, 4, 0, 2],
    size: [4, 12]
  };

  const transformedData = transformParagraph(text, lineHeight, null, null, iconMapping);
  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#autoWrapping', t => {
  const text = 'Amy: Hello, Ben.';

  const iconMapping = {
    ' ': {width: 1},
    A: {width: 4},
    m: {width: 3},
    y: {width: 2},
    ':': {width: 1},
    H: {width: 4},
    e: {width: 2},
    l: {width: 2},
    o: {width: 1},
    ',': {width: 2},
    B: {width: 1},
    n: {width: 3},
    '.': {width: 1}
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
  t.deepEqual(actual, expected, 'Should match break word.');

  expected = getStartIndices(['Amy:', ' ', 'Hell', 'o, ', 'Ben.']);
  actual = autoWrapping(text, 'break-word', 10, iconMapping);
  t.deepEqual(actual, expected, 'Should break the word when it is longer than maxWidth.');

  expected = getStartIndices(['Amy: H', 'ello, Be', 'n.']);
  actual = autoWrapping(text, 'break-all', 15, iconMapping);
  t.deepEqual(actual, expected, 'Should match break all.');

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
  t.deepEqual(
    actual,
    expected,
    "Should break all when maxWidth is smaller than a single char's width."
  );

  t.end();
});

test('TextLayer - utils#transformParagraph - autoWrapping', t => {
  const text = 'ab cd e';
  const lineHeight = 1.5;

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 3, height: 4},
    c: {width: 2, height: 4},
    d: {width: 10, height: 4},
    e: {width: 2, height: 4},
    ' ': {width: 1, height: 4}
  };

  const expected = {
    x: [0.5, 2.5, 4.5, 1, 7, 0.5, 2],
    y: [2, 2, 2, 8, 8, 14, 14],
    rowWidth: [5, 5, 5, 12, 12, 3, 3],
    size: [12, 18]
  };

  const transformedData = transformParagraph(text, lineHeight, 'break-word', 12, iconMapping);
  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#getTextFromBuffer', t => {
  const value = new Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33]);

  let result = getTextFromBuffer({value, length: 2, startIndices: [0, 6]});
  t.deepEqual(result.texts, ['Hello ', 'world!'], 'binary converted to text strings');
  t.is(result.characterCount, 12, 'returns correct character count');

  result = getTextFromBuffer({value, length: 2, offset: 1, startIndices: [0, 6]});
  t.deepEqual(result.texts, ['ello w', 'orld!'], 'binary converted to text strings');
  t.is(result.characterCount, 11, 'returns correct character count');

  result = getTextFromBuffer({value, length: 2, stride: 2, offset: 1, startIndices: [0, 3]});
  t.deepEqual(result.texts, ['el ', 'ol!'], 'binary converted to text strings');
  t.is(result.characterCount, 6, 'returns correct character count');

  t.end();
});
