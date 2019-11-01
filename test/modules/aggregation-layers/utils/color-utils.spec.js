import test from 'tape-catch';
import {colorRangeToFlatArray} from '@deck.gl/aggregation-layers/utils/color-utils';

test('color-utils#colorRangeToFlatArray', t => {
  const TESTS = [
    {
      title: 'flat array',
      colorRange: [255, 0, 0, 0, 255, 255, 0, 255],
      normalize: false,
      output: [255, 0, 0, 0, 255, 255, 0, 255]
    },
    {
      title: 'flat array normalized',
      colorRange: [255, 0, 0, 0, 255, 255, 0, 255],
      normalize: true,
      output: [1, 0, 0, 0, 1, 1, 0, 1]
    },
    {
      title: 'nested array',
      colorRange: [[255, 0, 0, 0], [255, 255, 0]],
      normalize: false,
      output: [255, 0, 0, 0, 255, 255, 0, 255]
    },
    {
      title: 'nested array normalized',
      colorRange: [[255, 0, 0, 0], [255, 255, 0]],
      normalize: true,
      output: [1, 0, 0, 0, 1, 1, 0, 1]
    }
  ];

  for (const testCase of TESTS) {
    t.deepEqual(
      colorRangeToFlatArray(testCase.colorRange, testCase.normalize),
      testCase.output,
      testCase.title
    );
  }

  t.end();
});
