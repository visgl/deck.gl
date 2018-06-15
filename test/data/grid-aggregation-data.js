import {WebMercatorViewport} from 'deck.gl';
import {fp64} from 'luma.gl';

const {fp64LowPart} = fp64;

const viewport = new WebMercatorViewport({
  longitude: -119.3,
  latitude: 35.6,
  zoom: 4,
  maxZoom: 20,
  pitch: 0,
  bearing: 0,
  width: 500,
  height: 500
});

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
  weights: [
    // Inside the current viewport bounds
    1,

    // Merged to same grid
    1,
    3,

    // Outside the current viewport bounds
    10
  ],
  windowSize: [500, 500],
  cellSize: [25, 25],
  gridSize: [20, 20],
  changeFlags: {
    dataChanged: true
  },
  viewport
};
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
  const weights = new Array(opts.count).fill(2);
  for (let i = 0; i < opts.count; i++) {
    pos[i * 2] = Math.floor(Math.random() * opts.width) + opts.x;
    pos[i * 2 + 1] = Math.floor(Math.random() * opts.height) + opts.y;
    posLow[i * 2] = fp64LowPart(pos[i * 2]);
    posLow[i * 2 + 1] = fp64LowPart(pos[i * 2 + 1]);
  }
  return {positions: pos, positions64xyLow: posLow, weights};
}

const X =  0;
const Y = 0;
const DX =  0.00575;
const DY =  0.00455;

positions = [
  // cell-0
  X,
  Y,

  X + DX / 2,
  Y + DY / 2,

  // cell -1
  X + (1.1 * DX),
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

const fixtureWorldSpace = {
  positions,
  positions64xyLow,
  cellSize : [DX, DY],
  width: DX*5,
  height: DY*5,
  weights: [ 10, 0.1, 1, 4, 5, 6, 2, 3, 111, 44 ,123]
}
export const GridAggregationData = {
  viewport,
  fixture,
  generateRandomGridPoints,
  fixtureWorldSpace
};
