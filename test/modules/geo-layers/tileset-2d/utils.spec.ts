// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  getTileIndices,
  tileToBoundingBox,
  urlType,
  getURLFromTemplate
} from '@deck.gl/geo-layers/tileset-2d';
import {Matrix4} from '@math.gl/core';
import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
import {createTestViewport} from '../../core/viewports/test-crs';

import {
  WebMercatorViewport,
  OrthographicView,
  GlobeView,
  _CustomProjectionView as CustomProjectionView
} from '@deck.gl/core';

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

test('getTileIndices', () => {
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
    expect(getTileIds(result), testCase.title).toEqual(testCase.output);
  }
});

const UTM_15N = 'EPSG:32615';
const SOUTH_POLAR_STEREOGRAPHIC =
  '+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +datum=WGS84 +units=m';

async function makeCustomProjectionViewport(
  crs: string,
  viewState: {center: [number, number, number]; zoom: number; pitch?: number; bearing?: number},
  width = 800,
  height = 400
) {
  const view = new CustomProjectionView({crs});
  await view.initialize();
  return view.makeViewport({width, height, viewState})!;
}

/** Returns true if a position of the tile is on screen. Samples a grid of positions in the tile. */
function isTileOnScreen(viewport, {x, y, z}, samples = 16): boolean {
  for (let i = 0; i <= samples; i++) {
    for (let j = 0; j <= samples; j++) {
      const {west, north} = tileToBoundingBox(viewport, x + i / samples, y + j / samples, z);
      const normalized = viewport.crs.converter.WGS84.normalize([west, north]);
      if (Math.abs(normalized[0] - west) > 1e-9 || Math.abs(normalized[1] - north) > 1e-9) {
        // The position is outside the area of use of the CRS
        continue;
      }
      const pixel = viewport.project([west, north]);
      if (pixel[0] > 0 && pixel[0] < viewport.width && pixel[1] > 0 && pixel[1] < viewport.height) {
        return true;
      }
    }
  }
  return false;
}

/** Returns the ids of the tiles of one level that are on screen. Does not use getTileIndices. */
function getTilesOnScreen(viewport, z: number, margin = 3): string[] {
  const count = 2 ** z;
  let range = [0, 0, count - 1, count - 1];
  if (z > 5) {
    // Examine only the tiles near the corners of the screen
    const [west, south, east, north] = viewport.getBounds();
    const toY = lat => ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * count;
    range = [
      Math.floor(((west + 180) / 360) * count) - margin,
      Math.floor(toY(north)) - margin,
      Math.floor(((east + 180) / 360) * count) + margin,
      Math.floor(toY(south)) + margin
    ];
  }
  const ids: string[] = [];
  for (let x = Math.max(0, range[0]); x <= Math.min(count - 1, range[2]); x++) {
    for (let y = Math.max(0, range[1]); y <= Math.min(count - 1, range[3]); y++) {
      if (isTileOnScreen(viewport, {x, y, z})) {
        ids.push(`${x},${y},${z}`);
      }
    }
  }
  return ids;
}

test('getTileIndices#CustomProjectionView agrees with MapView in Web Mercator', async () => {
  for (const viewState of [
    {center: [-90, 45, 0], zoom: 2.6},
    {center: [-93.2, 45, 0], zoom: 10.2},
    {center: [12, -33, 0], zoom: 6, pitch: 30, bearing: -25}
  ] as const) {
    const [longitude, latitude] = viewState.center;
    const mapViewIds = getTileIds(
      getTileIndices({
        viewport: new WebMercatorViewport({
          width: 800,
          height: 400,
          ...viewState,
          longitude,
          latitude
        }),
        zRange: null
      })
    );
    const viewport = await makeCustomProjectionViewport('EPSG:3857', {
      ...viewState,
      center: [longitude, latitude, 0]
    });
    const ids = getTileIds(getTileIndices({viewport, zRange: null}));
    const title = `zoom ${viewState.zoom}`;
    expect(ids.length, `${title}: selects tiles`).toBeGreaterThan(0);
    // MapView also selects tiles that only touch the frustum planes
    expect(
      ids.filter(id => !mapViewIds.includes(id)),
      `${title}: selects no other tiles than MapView`
    ).toEqual([]);
    expect(
      mapViewIds
        .filter(id => !ids.includes(id))
        .filter(id => {
          const [x, y, z] = id.split(',').map(Number);
          return isTileOnScreen(viewport, {x, y, z});
        }),
      `${title}: selects each MapView tile that is on screen`
    ).toEqual([]);
  }
});

test('getTileIndices#CustomProjectionView selects the tiles on screen', async () => {
  const testCases = [
    {
      title: 'UTM zone',
      viewport: await makeCustomProjectionViewport(UTM_15N, {center: [-93.2, 45, 0], zoom: 10.3}),
      // The projected CRS has no Web Mercator scale factor: 10.3 + log2(cos(45 deg)) = 9.8
      z: 10
    },
    {
      title: 'UTM zone, rotated',
      viewport: await makeCustomProjectionViewport(UTM_15N, {
        center: [-93.2, 45, 0],
        zoom: 12.3,
        bearing: 40
      }),
      z: 12
    },
    {
      title: 'edge of the UTM zone',
      viewport: await makeCustomProjectionViewport(UTM_15N, {center: [-90, 45, 0], zoom: 10.3}),
      z: 10
    },
    {
      title: 'polar stereographic',
      viewport: await makeCustomProjectionViewport(SOUTH_POLAR_STEREOGRAPHIC, {
        center: [0, -80, 0],
        zoom: 6.2
      }),
      // 6.2 + log2(cos(80 deg)), and the scale factor of the projection at this latitude
      z: 4
    }
  ];

  for (const {title, viewport, z} of testCases) {
    const result = getTileIndices({viewport, zRange: null});
    const ids = getTileIds(result);
    expect(ids.length, `${title}: selects tiles`).toBeGreaterThan(0);
    expect(
      result.every(tile => tile.z === z),
      `${title}: tile level`
    ).toBe(true);

    const expected = getTilesOnScreen(viewport, z);
    expect(expected.length, `${title}: tiles are on screen`).toBeGreaterThan(0);
    expect(
      expected.filter(id => !ids.includes(id)),
      `${title}: no tile on screen is missing`
    ).toEqual([]);
    // A selected tile can be next to the screen. Permit a border of tiles.
    expect(ids.length, `${title}: no excess tiles`).toBeLessThanOrEqual(expected.length * 2 + 4);
  }
});

test('getTileIndices#CustomProjectionView omits tiles outside the area of use', async () => {
  // The east half of the screen is outside UTM zone 15, which ends at longitude -90
  for (const bearing of [0, 40]) {
    const viewport = await makeCustomProjectionViewport(UTM_15N, {
      center: [-90, 45, 0],
      zoom: 10.3,
      bearing
    });
    const result = getTileIndices({viewport, zRange: null});
    expect(result.length, `bearing ${bearing}`).toBeGreaterThan(0);
    for (const {x, y, z} of result) {
      const {west} = tileToBoundingBox(viewport, x, y, z) as {west: number};
      // A tile that touches the edge of the zone has reference points in the area of use
      expect(west, `bearing ${bearing}: tile ${x},${y},${z}`).toBeLessThanOrEqual(-90);
    }
  }
});

const CONUS_ALBERS =
  '+proj=aea +lat_0=23 +lon_0=-96 +lat_1=29.5 +lat_2=45.5 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs';

test('Tileset2D#CustomProjectionView does not cull tiles when a screen corner has no position', async () => {
  // The screen shows the complete conic projection. Its corners are outside the projection.
  const viewport = await makeCustomProjectionViewport(
    CONUS_ALBERS,
    {center: [-96, 40, 0], zoom: -1},
    800,
    600
  );
  expect(viewport.unproject([0, 0]).slice(0, 2).every(Number.isFinite), 'corner').toBe(false);

  const tileset = new Tileset2D({getTileData: () => null, onTileLoad: () => {}, zoomOffset: 2});
  // A tile is visible only after its data loads
  tileset.update(viewport);
  await vi.waitFor(() => {
    expect(tileset.selectedTiles!.every(tile => tile.isLoaded)).toBe(true);
  });
  tileset.update(viewport);
  const tiles = tileset.selectedTiles!;
  expect(tiles.length, 'selects tiles').toBeGreaterThan(0);
  expect(
    tiles.every(tile => tileset.isTileVisible(tile)),
    'tiles are visible without culling'
  ).toBe(true);
  const cullRect = {x: 0, y: 0, width: 800, height: 600};
  expect(
    tiles.filter(tile => !tileset.isTileVisible(tile, cullRect)).map(tile => tile.id),
    'no selected tile is culled'
  ).toEqual([]);

  // A culling rectangle that shows only a part of the screen still culls
  const smallRect = {x: 390, y: 290, width: 20, height: 20};
  expect(
    tiles.filter(tile => tileset.isTileVisible(tile, smallRect)).length,
    'a small rectangle culls tiles'
  ).toBeLessThan(tiles.length);
  tileset.finalize();
});

test('getTileIndices#CustomProjectionView accepts a CRS that cannot convert a position', () => {
  // This CRS has degrees as its units, and converts only the positions near its central meridian.
  // The view of deck.gl throws when it projects a position that is not a number.
  const makeViewport = (forward: (p: number[]) => number[]) =>
    createTestViewport({
      width: 800,
      height: 400,
      center: [40, 40, 0],
      zoom: 3,
      converter: {forward, inverse: p => p.slice()},
      bounds: [-180, -90, 180, 90],
      metersPerUnit: [111319.49, 111319.49, 1]
    });
  const viewports = {
    'the conversion throws': makeViewport(p => {
      if (Math.abs(p[0]) > 60 || Math.abs(p[1]) > 80) throw new Error('outside the projection');
      return p.slice();
    }),
    'the conversion returns NaN': makeViewport(p =>
      Math.abs(p[0]) > 60 || Math.abs(p[1]) > 80 ? [NaN, NaN, NaN] : p.slice()
    )
  };
  for (const [title, viewport] of Object.entries(viewports)) {
    let result: {x: number; y: number; z: number}[] = [];
    expect(() => {
      result = getTileIndices({viewport, zRange: null, zoomOffset: 2});
    }, title).not.toThrow();
    expect(result.length, `${title}: selects tiles`).toBeGreaterThan(0);
    for (const {x, y, z} of result) {
      const {west, east} = tileToBoundingBox(viewport, x, y, z) as {west: number; east: number};
      expect(west < 60 && east > -60, `${title}: tile ${x},${y},${z} is in the projection`).toBe(
        true
      );
    }
  }
});

test('getTileIndices#CustomProjectionView keeps a tile that is larger than the area of use', async () => {
  // UTM zone 14 is between the longitudes -102 and -96.
  // No corner and no center of these tiles is in the zone.
  const viewport = await makeCustomProjectionViewport('EPSG:32614', {
    center: [-99, 40, 0],
    zoom: 10.3
  });
  for (const [maxZoom, expected] of [
    [0, ['0,0,0']],
    [1, ['0,0,1']],
    [2, ['0,1,2']]
  ] as const) {
    expect(
      getTileIds(getTileIndices({viewport, zRange: null, maxZoom})),
      `maxZoom ${maxZoom}`
    ).toEqual(expected);
  }
});

test('getTileIndices#CustomProjectionView uses the elevation range in meters', async () => {
  const viewState = {center: [12, -33, 0], zoom: 10, pitch: 45} as const;
  const zRange: [number, number] = [0, 30000];
  const viewport = await makeCustomProjectionViewport('EPSG:3857', viewState);
  const mapViewport = new WebMercatorViewport({
    width: 800,
    height: 400,
    longitude: 12,
    latitude: -33,
    zoom: 10,
    pitch: 45
  });
  const groundIds = getTileIds(getTileIndices({viewport, zRange: null}));
  const ids = getTileIds(getTileIndices({viewport, zRange}));
  const mapViewIds = getTileIds(getTileIndices({viewport: mapViewport, zRange}));
  // A high tile that is in front of the bottom of the screen comes into view
  expect(ids.length, 'the elevation adds tiles').toBeGreaterThan(groundIds.length);
  expect(
    ids.filter(id => !mapViewIds.includes(id)),
    'selects no other tiles than MapView'
  ).toEqual([]);
});

test('getTileIndices#CustomProjectionView finds an area of use that is small on screen', async () => {
  // UTM zone 15 is approximately 12 pixels wide in this view
  const viewport = await makeCustomProjectionViewport(UTM_15N, {center: [-90, 45, 0], zoom: 2});
  const [x, y] = viewport.project([-93, 75]);
  expect(x > 0 && x < 800 && y > 0 && y < 400, 'the north of the zone is on screen').toBe(true);
  // The tile 0,0,2 contains the position [-93, 75]
  expect(getTileIds(getTileIndices({viewport, zRange: null}))).toEqual([
    '0,0,2',
    '0,1,2',
    '1,0,2',
    '1,1,2'
  ]);
});

test('getTileIndices#CustomProjectionView covers the ground of a view with a high pitch', async () => {
  const viewport = await makeCustomProjectionViewport(SOUTH_POLAR_STEREOGRAPHIC, {
    center: [120, -65, 0],
    zoom: 7,
    pitch: 75
  });
  const boxes = getTileIndices({viewport, zRange: null, maxZoom: 5}).map(({x, y, z}) =>
    tileToBoundingBox(viewport, x, y, z)
  ) as {west: number; north: number; east: number; south: number}[];
  expect(boxes.length).toBeGreaterThan(0);

  // Each ground position on screen is in a selected tile
  const missing: string[] = [];
  let groundCount = 0;
  for (let x = 10; x < 800; x += 20) {
    for (let y = 10; y < 400; y += 20) {
      const [lng, lat] = viewport.unproject([x, y]);
      const pixel = viewport.project([lng, lat, 0]);
      // Ignore a pixel that shows no ground: above the horizon, or behind the far plane
      const isGround =
        Math.abs(pixel[0] - x) < 1e-3 &&
        Math.abs(pixel[1] - y) < 1e-3 &&
        pixel[2] >= 0 &&
        pixel[2] <= 1 &&
        Math.abs(lat) < 85;
      groundCount += isGround ? 1 : 0;
      if (
        isGround &&
        !boxes.some(b => lng >= b.west && lng <= b.east && lat >= b.south && lat <= b.north)
      ) {
        missing.push(`${x},${y}`);
      }
    }
  }
  expect(groundCount, 'pixels that show the ground').toBeGreaterThan(400);
  expect(missing).toEqual([]);
});

const OBLIQUE_STEREOGRAPHIC = '+proj=stere +lat_0=-60 +lon_0=-30 +k=1 +datum=WGS84 +units=m';

test('getTileIndices#CustomProjectionView keeps a tile whose curved edge is on screen', async () => {
  // A rotated view lets each frustum plane reject a box that does not enclose the tile
  const testCases = [
    {
      // The tile 1,3,2 is between the longitudes -90 and 0. Its north edge is an arc that bows out
      // beyond the box of its corners and center.
      title: 'polar stereographic',
      crs: SOUTH_POLAR_STEREOGRAPHIC,
      viewState: {center: [-45, -70, 0], zoom: 12, bearing: 45}
    },
    {
      title: 'polar stereographic, other rotation',
      crs: SOUTH_POLAR_STEREOGRAPHIC,
      viewState: {center: [-45, -68, 0], zoom: 11, bearing: -45}
    },
    {
      // Near this view, points at each quarter of the edges of a tile do not enclose the edges
      title: 'margin between the points of an edge',
      crs: OBLIQUE_STEREOGRAPHIC,
      viewState: {center: [-118.125, -0.01, 0], zoom: 13, bearing: 120}
    },
    {
      // Far from the center of the projection, the edges of a tile bend too much
      title: 'edge that bends too much',
      crs: CONUS_ALBERS,
      viewState: {center: [81.5625, -79.1613, 0], zoom: 13, bearing: 30}
    }
  ] as {
    title: string;
    crs: string;
    viewState: {center: [number, number, number]; zoom: number; bearing: number};
  }[];

  for (const {title, crs, viewState} of testCases) {
    const viewport = await makeCustomProjectionViewport(crs, viewState);
    const result = getTileIndices({viewport, zRange: null});
    expect(result.length, `${title}: selects tiles`).toBeGreaterThan(0);
    const ids = getTileIds(result);
    const expected = getTilesOnScreen(viewport, result[0].z);
    expect(expected.length, `${title}: tiles are on screen`).toBeGreaterThan(0);
    expect(
      expected.filter(id => !ids.includes(id)),
      `${title}: no tile on screen is missing`
    ).toEqual([]);
  }
});

test('getTileIndices#CustomProjectionView selects no tile next to the screen', async () => {
  // The tiles are almost square in this view. Their boxes follow the edges of the tiles.
  const viewport = await makeCustomProjectionViewport(UTM_15N, {
    center: [-93.2, 45, 0],
    zoom: 10.3
  });
  const ids = getTileIds(getTileIndices({viewport, zRange: null}));
  expect(ids.sort()).toEqual(getTilesOnScreen(viewport, 10).sort());
});

test('getTileIndices#CustomProjectionView respects extent and maxZoom', async () => {
  const viewport = await makeCustomProjectionViewport(UTM_15N, {
    center: [-93.2, 45, 0],
    zoom: 10.3
  });
  expect(getTileIds(getTileIndices({viewport, zRange: null, maxZoom: 5}))).toEqual(['7,11,5']);
  expect(
    getTileIds(getTileIndices({viewport, zRange: null, extent: [-93.2, 45, -93, 45.1]}))
  ).toEqual(['246,367,10', '246,368,10', '247,367,10', '247,368,10']);
  expect(
    getTileIndices({viewport, zRange: null, extent: [10, 45, 11, 46]}),
    'extent outside the view'
  ).toEqual([]);
});

test('tileToBoundingBox', () => {
  for (const testCase of TEST_CASES) {
    if (testCase.output.length && testCase.viewport.crs?.coordinateFrame !== 'geocentric') {
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

      expect(
        corners.every(
          p => p[0] <= 0 || p[0] >= viewport.width || p[1] <= 0 || p[1] >= viewport.height
        ),
        'corners are outside of the viewport'
      ).toBeTruthy();
    }
  }
});

test('tileToBoundingBox#Geospatial', () => {
  const viewport = new WebMercatorViewport({
    width: 800,
    height: 400,
    longitude: -90,
    latitude: 45,
    zoom: 2.5
  });

  expect(tileToBoundingBox(viewport, 0, 0, 0), '0, 0, 0 should match the results').toEqual({
    west: -180,
    north: 85.0511287798066,
    east: 180,
    south: -85.0511287798066
  });

  expect(tileToBoundingBox(viewport, 8, 5, 4), '8,5,4 Should match the results.').toEqual({
    east: 22.5,
    north: 55.77657301866769,
    south: 40.97989806962013,
    west: 0
  });
});

test('tileToBoundingBox#Infovis', () => {
  const viewport = new OrthographicView().makeViewport({
    width: 800,
    height: 400,
    viewState: {
      target: [0, 0, 0],
      zoom: 1
    }
  });

  expect(tileToBoundingBox(viewport, 0, 0, 0), '0,0,0 Should match the results.').toEqual({
    left: 0,
    top: 0,
    right: 512,
    bottom: 512
  });

  expect(tileToBoundingBox(viewport, 0, 0, 1), '0,0,1 Should match the results.').toEqual({
    left: 0,
    top: 0,
    right: 256,
    bottom: 256
  });

  expect(
    tileToBoundingBox(viewport, 0, 0, 0, 256),
    '0,0,0 with custom tileSize Should match the results.'
  ).toEqual({left: 0, top: 0, right: 256, bottom: 256});

  expect(tileToBoundingBox(viewport, 4, -1, 2), '4,-1,2 Should match the results.').toEqual({
    left: 512,
    top: -128,
    right: 640,
    bottom: 0
  });

  expect(tileToBoundingBox(viewport, 4, -1, 3), '4,-1,3 Should match the results.').toEqual({
    left: 256,
    top: -64,
    right: 320,
    bottom: 0
  });

  expect(
    tileToBoundingBox(viewport, 4, -1, 2, 256),
    '4,-1,2 with custom tileSize Should match the results.'
  ).toEqual({left: 256, top: -64, right: 320, bottom: 0});
});

test('urlType', () => {
  expect(
    urlType.validate('https://server.com/{z}/{x}/{y}.png', urlType),
    'string is validated'
  ).toBeTruthy();
  expect(
    urlType.validate(['https://server.com/{z}/{x}/{y}.png'], urlType),
    'array of string is validated'
  ).toBeTruthy();
  expect(urlType.validate(urlType.value, urlType), 'unspecified value is not valid').toBeFalsy();
  expect(
    urlType.validate(urlType.value, {...urlType, optional: true}),
    'unspecified value is valid if optional:true'
  ).toBeTruthy();
  expect(
    urlType.validate(['https://server.com/{z}/{x}/{y}.png', null], urlType),
    'is not valid'
  ).toBeFalsy();

  expect(urlType.equal('', ''), 'should be equal').toBeTruthy();
  expect(
    urlType.equal('https://server.com/{z}/{x}/{y}.png', 'https://server.com/{z}/{x}/{y}.png'),
    'should be equal'
  ).toBeTruthy();
  expect(
    urlType.equal(['https://server.com/{z}/{x}/{y}.png'], ['https://server.com/{z}/{x}/{y}.png']),
    'should be equal'
  ).toBeTruthy();
  expect(
    urlType.equal('https://server.com/{z}/{x}/{y}.png', [
      'https://server.com/ep1/{z}/{x}/{y}.png',
      'https://server.com/ep2/{z}/{x}/{y}.png'
    ]),
    'should not be equal'
  ).toBeFalsy();
  expect(
    urlType.equal(
      ['https://server.com/{z}/{x}/{y}.png'],
      ['https://server.com/ep1/{z}/{x}/{y}.png', 'https://server.com/ep2/{z}/{x}/{y}.png']
    ),
    'should not be equal'
  ).toBeFalsy();
  expect(
    urlType.equal(
      [
        'https://anotherserver.com/ep1/{z}/{x}/{y}.png',
        'https://anotherserver.com/ep2/{z}/{x}/{y}.png'
      ],
      ['https://server.com/ep1/{z}/{x}/{y}.png', 'https://server.com/ep2/{z}/{x}/{y}.png']
    ),
    'should not be equal'
  ).toBeFalsy();
});

test('getURLFromTemplate', () => {
  const TEST_TEMPLATE = 'https://server.com/{z}/{x}/{y}.png';
  const TEST_TEMPLATE2 = 'https://server.com/{z}/{x}/{y}/{x}-{y}-{z}.png';
  const TEST_TEMPLATE_ARRAY = [
    'https://server.com/ep1/{x}/{y}.png',
    'https://server.com/ep2/{x}/{y}.png'
  ];
  expect(
    getURLFromTemplate(TEST_TEMPLATE, {index: {x: 1, y: 2, z: 0}}),
    'single string template'
  ).toBe('https://server.com/0/1/2.png');
  expect(
    getURLFromTemplate(TEST_TEMPLATE2, {index: {x: 1, y: 2, z: 0}}),
    'single string template with multiple occurance'
  ).toBe('https://server.com/0/1/2/1-2-0.png');
  expect(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 1, y: 2, z: 0}, id: '1-2-0'}),
    'array of templates'
  ).toBe('https://server.com/ep2/1/2.png');
  expect(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 2, y: 2, z: 0}, id: '2-2-0'}),
    'array of templates'
  ).toBe('https://server.com/ep1/2/2.png');
  expect(
    getURLFromTemplate(TEST_TEMPLATE_ARRAY, {index: {x: 17, y: 11, z: 5}, id: '17-11-5'}),
    'array of templates'
  ).toBe('https://server.com/ep2/17/11.png');
  expect(getURLFromTemplate(null, {index: {x: 1, y: 2, z: 0}}), 'invalid template').toBe(null);
  expect(getURLFromTemplate([], {index: {x: 1, y: 2, z: 0}}), 'empty array').toBe(null);
});
