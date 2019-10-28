import test from 'tape-catch';

import {
  nextPowOfTwo,
  buildMapping,
  autoWrapping,
  transformParagraph
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
    a: {x: 2, y: 2, width: 1, height: 4, mask: true},
    s: {x: 7, y: 2, width: 2, height: 4, mask: true},
    d: {x: 2, y: 10, width: 3, height: 4, mask: true},
    f: {x: 9, y: 10, width: 4, height: 4, mask: true}
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
      a: {x: 2, y: 2, width: 1, height: 4, mask: true},
      s: {x: 7, y: 2, width: 2, height: 4, mask: true},
      d: {x: 2, y: 10, width: 3, height: 4, mask: true},
      f: {x: 9, y: 10, width: 4, height: 4, mask: true}
    },
    xOffset: 15,
    yOffset: 8
  };

  const {mapping, xOffset, yOffset, canvasHeight} = buildMapping(options);

  t.equal(xOffset, 11, 'xOffset should match.');
  t.equal(yOffset, 16, 'yOffset should match.');
  t.equal(canvasHeight, 32, 'canvasHeight should match.');

  const expected = {
    a: {x: 2, y: 2, width: 1, height: 4, mask: true},
    s: {x: 7, y: 2, width: 2, height: 4, mask: true},
    d: {x: 2, y: 10, width: 3, height: 4, mask: true},
    f: {x: 9, y: 10, width: 4, height: 4, mask: true},
    k: {x: 2, y: 18, width: 1, height: 4, mask: true},
    l: {x: 7, y: 18, width: 2, height: 4, mask: true}
  };

  t.deepEqual(mapping, expected, 'mapping should match.');

  t.end();
});

test('TextLayer - utils#transformParagraph - single line', t => {
  const transformedData = [];
  const text = 'ab';
  const lineHeight = 1.0;

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 2, height: 4}
  };

  const transformCharacter = data => data;

  const expected = [
    {
      text: 'a',
      offsetLeft: 0,
      offsetTop: 0,
      size: [3, 4],
      rowSize: [3, 4]
    },
    {
      text: 'b',
      offsetLeft: 1,
      offsetTop: 0,
      size: [3, 4],
      rowSize: [3, 4]
    }
  ];

  transformParagraph(
    text,
    lineHeight,
    null,
    null,
    iconMapping,
    transformCharacter,
    transformedData
  );

  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#transformParagraph - multiple lines', t => {
  const transformedData = [];
  const text = 'ab\nc';
  const lineHeight = 1.0;

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 3, height: 4},
    c: {width: 2, height: 4}
  };

  const transformCharacter = data => data;

  const expected = [
    {
      text: 'a',
      offsetLeft: 0,
      offsetTop: 0,
      size: [4, 8],
      rowSize: [4, 4]
    },
    {
      text: 'b',
      offsetLeft: 1,
      offsetTop: 0,
      size: [4, 8],
      rowSize: [4, 4]
    },
    {
      text: 'c',
      offsetLeft: 0,
      offsetTop: 4,
      size: [4, 8],
      rowSize: [2, 4]
    }
  ];

  transformParagraph(
    text,
    lineHeight,
    null,
    null,
    iconMapping,
    transformCharacter,
    transformedData
  );
  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#transformParagraph - multiple lines with line height', t => {
  const transformedData = [];
  const text = 'ab\nc';
  const lineHeight = 1.5;

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 3, height: 4},
    c: {width: 2, height: 4}
  };

  const transformCharacter = data => data;

  const expected = [
    {
      text: 'a',
      offsetLeft: 0,
      offsetTop: 0,
      size: [4, 12],
      rowSize: [4, 6]
    },
    {
      text: 'b',
      offsetLeft: 1,
      offsetTop: 0,
      size: [4, 12],
      rowSize: [4, 6]
    },
    {
      text: 'c',
      offsetLeft: 0,
      offsetTop: 6,
      size: [4, 12],
      rowSize: [2, 6]
    }
  ];

  transformParagraph(
    text,
    lineHeight,
    null,
    null,
    iconMapping,
    transformCharacter,
    transformedData
  );
  t.deepEqual(transformedData, expected);

  t.end();
});

test('TextLayer - utils#transformParagraph - transformedData not empty', t => {
  const lineHeight = 1.0;
  const transformedData = [
    {
      text: 'a',
      offsetLeft: 0,
      offsetTop: 0,
      size: [3, 4],
      rowSize: [3, 4]
    },
    {
      text: 'b',
      offsetLeft: 1,
      offsetTop: 0,
      size: [3, 4],
      rowSize: [3, 4]
    }
  ];

  const text = 'ab\nc';

  const iconMapping = {
    a: {width: 1, height: 4},
    b: {width: 3, height: 4},
    c: {width: 2, height: 4}
  };

  const transformCharacter = data => data;

  const expected = [
    {
      text: 'a',
      offsetLeft: 0,
      offsetTop: 0,
      size: [3, 4],
      rowSize: [3, 4]
    },
    {
      text: 'b',
      offsetLeft: 1,
      offsetTop: 0,
      size: [3, 4],
      rowSize: [3, 4]
    },
    {
      text: 'a',
      offsetLeft: 0,
      offsetTop: 0,
      size: [4, 8],
      rowSize: [4, 4]
    },
    {
      text: 'b',
      offsetLeft: 1,
      offsetTop: 0,
      size: [4, 8],
      rowSize: [4, 4]
    },
    {
      text: 'c',
      offsetLeft: 0,
      offsetTop: 4,
      size: [4, 8],
      rowSize: [2, 4]
    }
  ];

  transformParagraph(
    text,
    lineHeight,
    null,
    null,
    iconMapping,
    transformCharacter,
    transformedData
  );
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

  let expected = {
    rows: ['Amy: ', 'Hello, ', 'Ben.'],
    lastRowStartCharIndex: 12,
    lastRowOffsetLeft: 7
  };
  let actual = autoWrapping(text, 'break-word', 15, iconMapping);
  t.deepEqual(actual, expected, 'Should match break word.');

  expected = {
    rows: ['Amy:', ' ', 'Hell', 'o, ', 'Ben.'],
    lastRowStartCharIndex: 12,
    lastRowOffsetLeft: 7
  };
  actual = autoWrapping(text, 'break-word', 10, iconMapping);
  t.deepEqual(actual, expected, 'Should break the word when it is longer than maxWidth.');

  expected = {rows: ['Amy: H', 'ello, Be', 'n.'], lastRowStartCharIndex: 14, lastRowOffsetLeft: 4};
  actual = autoWrapping(text, 'break-all', 15, iconMapping);
  t.deepEqual(actual, expected, 'Should match break all.');

  expected = {
    rows: ['A', 'm', 'y', ':', ' ', 'H', 'e', 'l', 'l', 'o', ',', ' ', 'B', 'e', 'n', '.'],
    lastRowStartCharIndex: 15,
    lastRowOffsetLeft: 1
  };
  actual = autoWrapping(text, 'break-word', 1, iconMapping);
  t.deepEqual(
    actual,
    expected,
    "Should break all when maxWidth is smaller than a single char's width."
  );

  t.end();
});
