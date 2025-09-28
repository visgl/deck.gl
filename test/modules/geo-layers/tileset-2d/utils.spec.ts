// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  getTileIndices,
  tileToBoundingBox,
  urlType,
  getURLFromTemplate
} from '@deck.gl/geo-layers/tileset-2d';
import {Matrix4} from '@math.gl/core';

import {WebMercatorViewport, OrthographicView, _GlobeView as GlobeView} from '@deck.gl/core';

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
    output: ['0,2,3', '0,3,3', '1,2,3', '1,3,3', '2,1,3', '2,2,3', '2,3,3', '3,2,3', '3,3,3']
  },
  {
    title: 'tilted viewport with extent',
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
    extent: [-90, 30, 0, 60],
    output: ['2,2,3', '2,3,3', '3,2,3', '3,3,3']
  },
  {
    title: 'extreme pitch',
    viewport: new WebMercatorViewport({
      width: 800,
      height: 400,
      pitch: 75,
      bearing: 0,
      longitude: 0,
      latitude: 0,
      zoom: 4
    }),
    minZoom: undefined,
    maxZoom: undefined,
    output: [
      '0,0,2',
      '1,0,2',
      '2,0,2',
      '2,2,3',
      '2,3,3',
      '3,0,2',
      '3,2,3',
      '4,2,3',
      '5,2,3',
      '5,3,3',
      '6,6,4',
      '6,7,4',
      '7,6,4',
      '7,7,4',
      '7,8,4',
      '8,6,4',
      '8,7,4',
      '8,8,4',
      '9,6,4',
      '9,7,4'
    ]
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
      zoom: 3,
      repeat: true
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
  },
  {
    title: 'non-geospatial with zoom offset',
    viewport: new OrthographicView().makeViewport({
      width: 800,
      height: 400,
      viewState: {
        target: [100, 100],
        zoom: 4
      }
    }),
    zoomOffset: 1,
    output: [
      '4,5,5',
      '4,6,5',
      '4,7,5',
      '5,5,5',
      '5,6,5',
      '5,7,5',
      '6,5,5',
      '6,6,5',
      '6,7,5',
      '7,5,5',
      '7,6,5',
      '7,7,5'
    ]
  },
  {
    title: 'non-geospatial with tile size',
    viewport: new OrthographicView().makeViewport({
      width: 800,
      height: 400,
      viewState: {
        target: [100, 100],
        zoom: 3
      }
    }),
    tileSize: 256,
    output: ['1,2,3', '1,3,3', '2,2,3', '2,3,3', '3,2,3', '3,3,3', '4,2,3', '4,3,3']
  },
  {
    title: 'non-geospatial modelMatrix identity',
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {
        target: [512, 512],
        zoom: 0
      }
    }),
    tileSize: 512,
    modelMatrix: new Matrix4().identity(),
    modelMatrixInverse: new Matrix4().identity().invert(),
    output: ['0,0,0', '0,1,0', '1,0,0', '1,1,0']
  },
  {
    title: 'non-geospatial modelMatrix scaling',
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {
        target: [512, 512],
        zoom: 0
      }
    }),
    tileSize: 512,
    modelMatrix: new Matrix4().scale(2),
    modelMatrixInverse: new Matrix4().scale(2).invert(),
    output: ['0,0,0']
  },
  {
    title: 'non-geospatial modelMatrix translation',
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {
        target: [512, 512],
        zoom: 0
      }
    }),
    tileSize: 512,
    modelMatrix: new Matrix4().translate([300, 300, 0]),
    modelMatrixInverse: new Matrix4().translate([300, 300, 0]).invert(),
    output: ['0,0,0']
  },
  {
    title: 'non-geospatial modelMatrix translation & scaling',
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {
        target: [512, 512],
        zoom: 0
      }
    }),
    tileSize: 512,
    modelMatrix: new Matrix4().translate([1024, 1024, 0]).scale(2),
    modelMatrixInverse: new Matrix4().translate([1024, 1024, 0]).scale(2).invert(),
    output: ['-1,-1,0']
  },
  {
    title: 'non-geospatial modelMatrix with extent prop',
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {
        target: [512, 512],
        zoom: 0
      }
    }),
    tileSize: 512,
    extent: [0, 0, 2048, 2048],
    modelMatrix: new Matrix4().translate([1024, 1024, 0]).scale(2),
    modelMatrixInverse: new Matrix4().translate([1024, 1024, 0]).scale(2).invert(),
    output: []
  },
  {
    title: 'globe',
    viewport: new GlobeView().makeViewport({
      width: 400,
      height: 400,
      viewState: {
        longitude: -6,
        latitude: 58,
        zoom: 2
      }
    }),
    tileSize: 512,
    output: ['0,1,1', '0,1,2', '1,0,2', '1,1,1', '1,1,2', '2,0,2', '2,1,2', '3,1,2']
  }
];

function getTileIds(tiles) {
  const ids = [];
  for (const tile of tiles) {
    ids.push(`${tile.x},${tile.y},${tile.z}`);
  }
  return ids.sort();
}

function mergeBoundingBox(boundingBoxes) {
  if (boundingBoxes.length === 0) {
    return null;
  }
  const isGeospatial = 'north' in boundingBoxes[0];
  const result = [Infinity, Infinity, -Infinity, -Infinity];
  for (const bbox of boundingBoxes) {
    if (isGeospatial) {
      // geospatial
      result[0] = Math.min(result[0], bbox.west);
      result[1] = Math.min(result[1], bbox.south);
      result[2] = Math.max(result[2], bbox.east);
      result[3] = Math.max(result[3], bbox.north);
    } else {
      // non-geospatial
      result[0] = Math.min(result[0], bbox.left);
      result[1] = Math.min(result[1], bbox.top);
      result[2] = Math.max(result[2], bbox.right);
      result[3] = Math.max(result[3], bbox.bottom);
    }
  }
  return result;
}

test('getTileIndices', t => {
  for (const testCase of TEST_CASES) {
    const {
      viewport,
      maxZoom,
      minZoom,
      zRange,
      tileSize,
      modelMatrix,
      extent,
      modelMatrixInverse,
      zoomOffset
    } = testCase;
    const result = getTileIndices({
      viewport,
      maxZoom,
      minZoom,
      zRange,
      tileSize,
      modelMatrix,
      modelMatrixInverse,
      extent,
      zoomOffset
    });
    t.deepEqual(getTileIds(result), testCase.output, testCase.title);
  }

  t.end();
});

test('tileToBoundingBox', t => {
  for (const testCase of TEST_CASES) {
    if (testCase.output.length && !testCase.viewport.resolution) {
      const {viewport, minZoom, maxZoom, tileSize, zRange} = testCase;
      const boundingBoxes = getTileIndices({viewport, maxZoom, minZoom, zRange, tileSize}).map(
        tile => tileToBoundingBox(viewport, tile.x, tile.y, tile.z)
      );
      const result = mergeBoundingBox(boundingBoxes);
      const corners = [
        [result[0], result[1]],
        [result[0], result[3]],
        [result[2], result[1]],
        [result[2], result[3]]
      ].map(p => viewport.project(p));

      t.ok(
        corners.every(
          p => p[0] <= 0 || p[0] >= viewport.width || p[1] <= 0 || p[1] >= viewport.height
        ),
        'corners are outside of the viewport'
      );
    }
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
    tileToBoundingBox(viewport, 0, 0, 1),
    {left: 0, top: 0, right: 256, bottom: 256},
    '0,0,1 Should match the results.'
  );

  t.deepEqual(
    tileToBoundingBox(viewport, 0, 0, 0, 256),
    {left: 0, top: 0, right: 256, bottom: 256},
    '0,0,0 with custom tileSize Should match the results.'
  );

  t.deepEqual(
    tileToBoundingBox(viewport, 4, -1, 2),
    {left: 512, top: -128, right: 640, bottom: 0},
    '4,-1,2 Should match the results.'
  );

  t.deepEqual(
    tileToBoundingBox(viewport, 4, -1, 3),
    {left: 256, top: -64, right: 320, bottom: 0},
    '4,-1,3 Should match the results.'
  );

  t.deepEqual(
    tileToBoundingBox(viewport, 4, -1, 2, 256),
    {left: 256, top: -64, right: 320, bottom: 0},
    '4,-1,2 with custom tileSize Should match the results.'
  );

  t.end();
});

test('urlType', t => {
  t.ok(urlType.validate('https://server.com/{z}/{x}/{y}.png', urlType), 'string is validated');
  t.ok(
    urlType.validate(['https://server.com/{z}/{x}/{y}.png'], urlType),
    'array of string is validated'
  );
  t.notOk(urlType.validate(urlType.value, urlType), 'unspecified value is not valid');
  t.ok(
    urlType.validate(urlType.value, {...urlType, optional: true}),
    'unspecified value is valid if optional:true'
  );
  t.notOk(urlType.validate(['https://server.com/{z}/{x}/{y}.png', null], urlType), 'is not valid');

  t.ok(urlType.equal('', ''), 'should be equal');
  t.ok(
    urlType.equal('https://server.com/{z}/{x}/{y}.png', 'https://server.com/{z}/{x}/{y}.png'),
    'should be equal'
  );
  t.ok(
    urlType.equal(['https://server.com/{z}/{x}/{y}.png'], ['https://server.com/{z}/{x}/{y}.png']),
    'should be equal'
  );
  t.notOk(
    urlType.equal('https://server.com/{z}/{x}/{y}.png', [
      'https://server.com/ep1/{z}/{x}/{y}.png',
      'https://server.com/ep2/{z}/{x}/{y}.png'
    ]),
    'should not be equal'
  );
  t.notOk(
    urlType.equal(
      ['https://server.com/{z}/{x}/{y}.png'],
      ['https://server.com/ep1/{z}/{x}/{y}.png', 'https://server.com/ep2/{z}/{x}/{y}.png']
    ),
    'should not be equal'
  );
  t.notOk(
    urlType.equal(
      [
        'https://anotherserver.com/ep1/{z}/{x}/{y}.png',
        'https://anotherserver.com/ep2/{z}/{x}/{y}.png'
      ],
      ['https://server.com/ep1/{z}/{x}/{y}.png', 'https://server.com/ep2/{z}/{x}/{y}.png']
    ),
    'should not be equal'
  );

  t.end();
});

test('getURLFromTemplate', t => {
  const TEST_TEMPLATE = 'https://server.com/{z}/{x}/{y}.png';
  const TEST_TEMPLATE2 = 'https://server.com/{z}/{x}/{y}/{x}-{y}-{z}.png';
  const TEST_TEMPLATE_ARRAY = [
    'https://server.com/ep1/{x}/{y}.png',
    'https://server.com/ep2/{x}/{y}.png'
  ];
  t.is(
    getURLFromTemplate(TEST_TEMPLATE, {index: {x: 1, y: 2, z: 0}}),
    'https://server.com/0/1/2.png',
    'single string template'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE2, {index: {x: 1, y: 2, z: 0}}),
    'https://server.com/0/1/2/1-2-0.png',
    'single string template with multiple occurance'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 1, y: 2, z: 0}, id: '1-2-0'}),
    'https://server.com/ep2/1/2.png',
    'array of templates'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 2, y: 2, z: 0}, id: '2-2-0'}),
    'https://server.com/ep1/2/2.png',
    'array of templates'
  );
  t.is(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 17, y: 11, z: 5}, id: '17-11-5'}),
    'https://server.com/ep2/17/11.png',
    'array of templates'
  );
  t.is(getURLFromTemplate(null, {index: {x: 1, y: 2, z: 0}}), null, 'invalid template');
  t.is(getURLFromTemplate([], {index: {x: 1, y: 2, z: 0}}), null, 'empty array');
  t.end();
});
