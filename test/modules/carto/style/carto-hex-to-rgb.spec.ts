import test from 'tape-catch';
import {hexToRgb} from '@deck.gl/carto/style/palette';

const OK_TEST_CASES = [
  {
    title: 'Evaluate #ABC',
    argument: '#AAA',
    result: [170, 170, 170, 255]
  },
  {
    title: 'Evaluate #ABCDEF',
    argument: '#FFEE11',
    result: [255, 238, 17, 255]
  },
  {
    title: 'Evaluate #ABCDEFAF',
    argument: '#00FF0080',
    result: [0, 255, 0, 128]
  }
];

const ERROR_TEST_CASES = [
  {
    argument: '#notAColor'
  },
  {
    argument: 'notAColor'
  }
];

test('hexToRgb#tests', t => {
  for (const tc of OK_TEST_CASES) {
    const func = hexToRgb(tc.argument);
    t.deepEqual(func, tc.result, `${tc.title} returned expected result`);
  }

  t.end();
});

test('hexToRgb#invalidData', t => {
  for (const tc of ERROR_TEST_CASES) {
    t.throws(() => hexToRgb(tc.argument), `throws on invalid hexadecimal color ${tc.argument}`);
  }

  t.end();
});
