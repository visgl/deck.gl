import test from 'tape-catch';
import {getTileIndices, tileToBoundingBox} from '@deck.gl/geo-layers/tile-layer/utils';
import {WebMercatorViewport, OrthographicView} from '@deck.gl/core';

const TEST_CASES = [
  {
    title: 'flat viewport (fractional)',
    viewport: new WebMercatorViewport({
      width: 800,
      height: 400,
      longitude: -90,
      latitude: 45,
      zoom: 2.5
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: ['0,2,3', '0,3,3', '1,2,3', '1,3,3', '2,2,3', '2,3,3', '3,2,3', '3,3,3']
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
      zoom: 2.5
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: [
      '0,1,3',
      '0,2,3',
      '0,3,3',
      '1,1,3',
      '1,2,3',
      '1,3,3',
      '2,1,3',
      '2,2,3',
      '2,3,3',
      '3,1,3',
      '3,2,3',
      '3,3,3'
    ]
  },
  {
    title: 'flat viewport (exact)',
    viewport: new WebMercatorViewport({
      width: 1024,
      height: 1024,
      longitude: 0,
      latitude: 0,
      orthographic: true,
      zoom: 2
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: ['1,1,2', '1,2,2', '2,1,2', '2,2,2']
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
      height: 200,
      longitude: -90,
      latitude: 0,
      zoom: 0
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: ['0,0,0']
  },
  {
    title: 'near 180 meridian',
    viewport: new WebMercatorViewport({
      width: 800,
      height: 200,
      longitude: -152,
      latitude: 0,
      zoom: 3
    }),
    maxZoom: 2,
    output: ['0,1,2', '0,2,2', '3,1,2', '3,2,2']
  },
  {
    title: 'non-geospatial',
    viewport: new OrthographicView().makeViewport({
      width: 800,
      height: 400,
      viewState: {
        target: [100, 100],
        zoom: 4
      }
    }),
    output: ['2,2,4', '2,3,4', '3,2,4', '3,3,4']
  }
];

function getTileIds(tiles) {
  const ids = [];
  for (const tile of tiles) {
    ids.push(`${tile.x},${tile.y},${tile.z}`);
  }
  return ids.sort();
}

test('getTileIndices', t => {
  for (const testCase of TEST_CASES) {
    const result = getTileIndices(testCase.viewport, testCase.maxZoom, testCase.minZoom);
    t.deepEqual(getTileIds(result), testCase.output, testCase.title);
  }

  t.end();
});

test('tileToBoundingBox#Geospatial', t => {
  const viewport = new WebMercatorViewport({
    width: 800,
    height: 400,
    longitude: -90,
    latitude: 45,
    zoom: 2.5
  });

  t.deepEqual(
    tileToBoundingBox(viewport, 0, 0, 0),
    {
      west: -180,
      north: 85.0511287798066,
      east: 180,
      south: -85.0511287798066
    },
    '0, 0, 0 should match the results'
  );

  t.deepEqual(
    tileToBoundingBox(viewport, 8, 5, 4),
    {
      east: 22.5,
      north: 55.77657301866769,
      south: 40.97989806962013,
      west: 0
    },
    '8,5,4 Should match the results.'
  );

  t.end();
});

test('tileToBoundingBox#Infovis', t => {
  const viewport = new OrthographicView().makeViewport({
    width: 800,
    height: 400,
    viewState: {
      target: [0, 0, 0],
      zoom: 1
    }
  });

  t.deepEqual(
    tileToBoundingBox(viewport, 0, 0, 0),
    {left: 0, top: 0, right: 512, bottom: 512},
    '0,0,0 Should match the results.'
  );

  t.deepEqual(
    tileToBoundingBox(viewport, 4, -1, 2),
    {left: 512, top: -128, right: 640, bottom: 0},
    '4,-1,2 Should match the results.'
  );

  t.end();
});
