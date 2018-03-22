import {WebMercatorViewport} from 'deck.gl';
const POINT_COUNT = 500000;
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

const fixture = {
  positions: [
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
  ],
  windowSize: [500, 500],
  cellSize: [25, 25],
  gridSize: [20, 20],
  viewport
};
const positions = generateRandomPoints(POINT_COUNT);
const fixture2 = Object.assign({}, fixture, {positions});
function generateRandomPoints(pointCount) {
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
  const points = new Array(opts.count * 2);
  for (let i = 0; i < opts.count; i++) {
    points[i * 2] = Math.floor(Math.random() * opts.width) + opts.x;
    points[i * 2 + 1] = Math.floor(Math.random() * opts.height) + opts.y;
  }
  return points;
}

export const ScreenGridAggregatorData = {
  viewport,
  fixture,
  fixture2,
  generateRandomPoints
};
