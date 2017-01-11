/* load data samples for display */

import {pointGrid} from './utils';

export {default as choropleths} from './data/sf.zip.geo.json';
export {default as hexagons} from './data/hexagons.json';
export {default as points} from './data/sf.bike.parking.json';
export {default as routes} from './data/sfmta.routes.json';

export const positionOrigin = [-122.45, 37.75, 0];

export const meterPoints = pointGrid(1e3, [-5000, -5000, 5000, 5000]);

// time consuming - only generate on demand
let _points100K = null;
export function getPoints100K() {
  _points100K = _points100K || pointGrid(1e5, [-122.6, 37.6, -122.2, 37.9]);
  return _points100K;
}

let _points1M = null;
export function getPoints1M() {
  _points1M = _points1M || pointGrid(1e6, [-122.6, 37.6, -122.2, 37.9]);
  return _points1M;
}

let _points10M = null;
export function getPoints10M() {
  _points10M = _points10M || pointGrid(1e7, [-122.6, 37.6, -122.2, 37.9]);
  return _points10M;
}
