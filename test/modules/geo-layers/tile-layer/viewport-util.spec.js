import test from 'tape-catch';
import {getTileIndices} from '@deck.gl/geo-layers/tile-layer/utils/viewport-util';
import {WebMercatorViewport} from '@deck.gl/core';

const TEST_CASES = [
  {
    title: 'flat viewport (fractional)',
    viewport: new WebMercatorViewport({
      width: 800,
      height: 400,
      longitude: -90,
      latitude: 45,
      zoom: 3.5
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: ['1,2,3', '1,3,3', '2,2,3', '2,3,3']
  },
  {
    title: 'tilted viewport',
    viewport: new WebMercatorViewport({
      width: 800,
      height: 400,
      pitch: 30,
      bearing: -25,
      longitude: -90,
      latitude: 45,
      zoom: 3.5
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: ['0,1,3', '0,2,3', '0,3,3', '1,1,3', '1,2,3', '1,3,3', '2,1,3', '2,2,3', '2,3,3']
  },
  {
    title: 'flat viewport (exact)',
    viewport: new WebMercatorViewport({
      width: 1024,
      height: 1024,
      longitude: 0,
      latitude: 0,
      zoom: 4
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: ['6,6,4', '6,7,4', '6,8,4', '7,6,4', '7,7,4', '7,8,4', '8,6,4', '8,7,4', '8,8,4']
  },
  {
    title: 'under zoom',
    viewport: new WebMercatorViewport({longitude: -90, latitude: 45, zoom: 3}),
    minZoom: 4,
    maxZoom: undefined,
    output: []
  },
  {
    title: 'over zoom',
    viewport: new WebMercatorViewport({
      width: 800,
      height: 400,
      longitude: -90,
      latitude: 45,
      zoom: 5
    }),
    minZoom: 0,
    maxZoom: 3,
    output: ['1,2,3', '2,2,3']
  },
  {
    title: 'z0 repeat',
    viewport: new WebMercatorViewport({
      width: 800,
      height: 400,
      longitude: -90,
      latitude: 0,
      zoom: 0
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: ['0,0,0']
  }
];

function getTileIds(tiles) {
  const set = new Set();
  for (const tile of tiles) {
    set.add(`${tile.x},${tile.y},${tile.z}`);
  }
  return Array.from(set).sort();
}

test('getTileIndices', t => {
  for (const testCase of TEST_CASES) {
    const result = getTileIndices(testCase.viewport, testCase.maxZoom, testCase.minZoom);
    t.deepEqual(getTileIds(result), testCase.output, testCase.title);
  }

  t.end();
});
