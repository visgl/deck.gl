import {Layer} from '@deck.gl/core';
import {getClosestObject} from '@deck.gl/core/lib/picking/query-object';

const SAMPLE_LAYERS = [new Layer()];
const OBJECT_COLOR = [0, 10, 20, 1];
const NULL_COLOR = [0, 0, 0, 0];

const TEST_CASES = [
  {
    title: 'Solid',
    data: generateSampleData({
      pickingRadius: 10,
      getColor: () => OBJECT_COLOR
    })
  },
  {
    // radius 5 circle centered in 20x20 rect.
    title: 'Circle',
    data: generateSampleData({
      pickingRadius: 10,
      getColor: (x, y) =>
        (10 - x) * (10 - x) + (10 - y) * (10 - y) < 25 ? OBJECT_COLOR : NULL_COLOR
    })
  },
  {
    // half of rect on top left
    title: 'Triangle',
    data: generateSampleData({
      pickingRadius: 10,
      getColor: (x, y) => (x + y <= 10 ? OBJECT_COLOR : NULL_COLOR)
    })
  },
  {
    title: 'Solid - Big',
    data: generateSampleData({
      pickingRadius: 50,
      getColor: () => OBJECT_COLOR
    })
  }
];

export default function pickLayersBench(bench) {
  bench = bench.group('getClosestObject');

  TEST_CASES.forEach(testCase => {
    bench = bench.add(testCase.title, () => getClosestObject(testCase.data));
  });

  return bench;
}

function generateSampleData({pickingRadius, getColor}) {
  const width = pickingRadius * 2;
  const height = pickingRadius * 2;
  const pixels = new Uint8Array(width * height * 4);

  let i = 0;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const color = getColor(col, row);
      pixels[i++] = color[0];
      pixels[i++] = color[1];
      pixels[i++] = color[2];
      pixels[i++] = color[3];
    }
  }

  return {
    pickedColors: pixels,
    layers: SAMPLE_LAYERS,
    deviceX: pickingRadius,
    deviceY: pickingRadius,
    deviceRadius: pickingRadius,
    deviceRect: {x: 0, y: 0, width, height}
  };
}
