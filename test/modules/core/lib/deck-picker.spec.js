import test from 'tape-catch';
import DeckPicker from '@deck.gl/core/lib/deck-picker';
import {gl} from '@deck.gl/test-utils';

const DEVICE_RECT_TEST_CASES = [
  {
    title: 'at center with radius',
    input: {deviceX: 5, deviceY: 5, deviceRadius: 1, deviceWidth: 10, deviceHeight: 10},
    output: {x: 4, y: 4, width: 3, height: 3}
  },
  {
    title: 'at center without radius',
    input: {deviceX: 5, deviceY: 5, deviceRadius: 0, deviceWidth: 10, deviceHeight: 10},
    output: {x: 5, y: 5, width: 1, height: 1}
  },
  {
    title: 'clipped by bounds',
    input: {deviceX: 0, deviceY: 10, deviceRadius: 1, deviceWidth: 10, deviceHeight: 10},
    output: {x: 0, y: 9, width: 2, height: 1}
  },
  {
    title: 'x out of bounds',
    input: {deviceX: -1, deviceY: 1, deviceRadius: 0, deviceWidth: 1, deviceHeight: 1},
    output: null
  },
  {
    title: 'y out of bounds',
    input: {deviceX: 0, deviceY: 2, deviceRadius: 0, deviceWidth: 1, deviceHeight: 1},
    output: null
  }
];

test('DeckPicker#getPickingRect', t => {
  const deckPicker = new DeckPicker(gl);

  for (const testCase of DEVICE_RECT_TEST_CASES) {
    t.deepEqual(
      deckPicker._getPickingRect(testCase.input),
      testCase.output,
      `${testCase.title}: returns correct result`
    );
  }

  t.end();
});
