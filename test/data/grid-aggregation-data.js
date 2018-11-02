import {WebMercatorViewport} from 'deck.gl';
import * as dataSamples from '../../examples/layer-browser/src/data-samples';
import {fp64} from 'luma.gl';

const {fp64LowPart} = fp64;
const viewportProps = {
  longitude: -119.3,
  latitude: 35.6,
  zoom: 4,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
  width: 500,
  height: 500
};
const viewport = new WebMercatorViewport(viewportProps);
const viewportUpdated = new WebMercatorViewport(
  Object.assign({}, viewportProps, {zoom: viewportProps.zoom - 3})
);

let positions = [
  // Inside the current viewport bounds
  -120.4193,
  34.7751,

  // Merged to same grid
  -118.67079,
  34.03948,

  -118.67079,
  34.03948,

  // Outside the current viewport bounds
  -122.4193,
  10
];

let positions64xyLow = positions.map(pos => fp64LowPart(pos));
const fixture = {
  positions,
  positions64xyLow,
  weights: {
    weight1: {
      values: [
        // Inside the current viewport bounds
        2,
        11,
        101,

        // Merged to same grid
        1,
        22,
        303,
        3,
        31,
        401,

        // Outside the current viewport bounds
        33,
        1,
        500 // gets aggregated when viewport is zoomed out
      ],
      size: 3,
      needMin: true,
      needMax: true
    }
  },
  windowSize: [500, 500],
  cellSize: [25, 25],
  gridSize: [20, 20],
  changeFlags: {
    dataChanged: true
  },
  viewport,
  projectPoints: true
};

const positionsUpdated = [
  // Outside the current viewport bounds
  -125.4193,
  3,

  // Inside the current viewport bounds, merged to same grid cell
  -120.5, // -120.4193,
  34.9, // 34.7751,

  -120.5, // -120.4193,
  34.9, // 34.7751,

  // inside the viewport bounds
  -118.67079,
  34.03948,

  // inside the viewport bounds
  -117,
  32,

  // Outside the viewport bounds
  -122.5,
  10
];

const weightsUpdated = {
  weight1: {
    values: [
      // Outside the current viewport bounds
      1,
      11,
      101,

      // Inside the current viewport bounds, merged to same grid cell
      4,
      20,
      201,
      2,
      30,
      300,

      // inside the viewport bounds
      9,
      55,
      701,

      // inside the viewport bounds
      1,
      99,
      22,

      // Outside the viewport bounds
      10,
      51,
      500
    ],
    size: 3,
    needMin: true,
    needMax: true
  }
};

// data updated relative to `fixture`
const fixtureUpdated = Object.assign({}, fixture, {
  positions: positionsUpdated,
  weights: weightsUpdated,
  viewport: viewportUpdated
});

function generateRandomGridPoints(pointCount) {
  const topLeft = {
    lng: -128.0, // -124.506026,
    lat: 40.0 // 38.203636
  };
  const bottomRight = {
    lng: -110.0, // -116.068526,
    lat: 30.0 // 32.842653
  };

  const opts = {
    x: topLeft.lng,
    y: topLeft.lat,
    width: bottomRight.lng - topLeft.lng,
    height: bottomRight.lat - topLeft.lat,
    count: pointCount
  };
  const pos = new Array(opts.count * 2);
  const posLow = new Array(opts.count * 2);
  const weightValues = [];
  for (let i = 0; i < opts.count; i++) {
    pos[i * 2] = Math.floor(Math.random() * opts.width) + opts.x;
    pos[i * 2 + 1] = Math.floor(Math.random() * opts.height) + opts.y;
    posLow[i * 2] = fp64LowPart(pos[i * 2]);
    posLow[i * 2 + 1] = fp64LowPart(pos[i * 2 + 1]);
    // floor to avoid gpu precession issues
    const weights = [Math.random(), Math.random(), Math.random()].map(x => Math.floor(x * 10));
    weightValues.push(...weights);
  }
  const weights = {
    weight1: {
      values: weightValues,
      size: 3,
      needMin: true,
      needMax: true
    }
  };
  return {positions: pos, positions64xyLow: posLow, weights};
}

const X = 0;
const Y = 0;
const DX = 0.00575;
const DY = 0.00455;

positions = [
  // cell-0
  X,
  Y,

  X + DX / 2,
  Y + DY / 2,

  // cell -1
  X + 1.1 * DX,
  0.8 * Y,

  // cell -2
  X + 2.1 * DX,
  0.9 * Y,

  X + 2.5 * DX,
  Y,

  // cell -5
  X + 2.1 * DX,
  Y + 2.9 * DY,

  X + 2.15 * DX,
  Y + 2.05 * DY,

  X + 2.4 * DX,
  Y + 2.4 * DY,

  // cell - n
  X + 3.1 * DX,
  Y + 3.9 * DY,

  X + 3.01 * DX,
  Y + 3.02 * DY,

  X + 3.98 * DX,
  Y + 3.99 * DY
];
positions64xyLow = positions.map(pos => fp64LowPart(pos));

const viewport2 = new WebMercatorViewport({
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 0,
  bearing: 0,
  width: 500,
  height: 500
});

const positions2 = dataSamples.points.reduce((acc, point) => {
  acc.push(...point.COORDINATES);
  return acc;
}, []);

const positions64xyLow2 = positions2.map(pos => fp64LowPart(pos));
const weights2 = dataSamples.points.map(_ => 1.0);
const fixture2 = {
  positions: positions2,
  positions64xyLow: positions64xyLow2,
  weights: weights2,
  windowSize: [800, 450],
  cellSize: [40, 40],
  gridSize: [20, 12],
  changeFlags: {
    dataChanged: true
  },
  viewport: viewport2
};

const fixtureWorldSpace = {
  positions,
  positions64xyLow,
  cellSize: [DX, DY],
  width: DX * 5,
  height: DY * 5,
  projectPoints: false,
  weights: {
    weight1: {
      values: [
        10,
        0,
        0,
        0.1,
        0,
        0,
        1,
        0,
        0,
        4,
        0,
        0,
        5,
        0,
        0,
        6,
        0,
        0,
        2,
        0,
        0,
        3,
        0,
        0,
        111,
        0,
        0,
        44,
        0,
        0,
        123,
        0,
        0
      ],
      size: 3,
      needMin: true,
      needMax: true
    }
  }
};

export const GridAggregationData = {
  viewport,
  fixture,
  fixture2,
  fixtureUpdated,
  generateRandomGridPoints,
  fixtureWorldSpace
};
