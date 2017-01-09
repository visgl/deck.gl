/* load data samples for display */

import {loadJson, pointGrid} from './utils';

const CHOROPLETHS_FILE = './data/sf.zip.geo.json';
const HEXAGONS_FILE = './data/hexagons.json';
const POINTS_FILE = './data/sf.bike.parking.json';
const ROUTES_FILE = './data/sfmta.routes.json';

const dataSamples = {
  choropleths: null,
  getChoropleths: cb => {
    if (dataSamples.choropleths === null) {
      loadJson(CHOROPLETHS_FILE).then(data => {
        dataSamples.choropleths = data;
        cb();
      });
      dataSamples.choropleths = false;
    }
    return dataSamples.choropleths;
  },

  hexagons: null,
  getHexagons: cb => {
    if (dataSamples.hexagons === null) {
      loadJson(HEXAGONS_FILE).then(data => {
        dataSamples.hexagons = data;
        cb();
      });
      dataSamples.hexagons = false;
    }
    return dataSamples.hexagons;
  },

  points: null,
  getPoints: cb => {
    if (dataSamples.points === null) {
      loadJson(POINTS_FILE).then(data => {
        dataSamples.points = data;
        cb();
      });
      dataSamples.points = false;
    }
    return dataSamples.points;
  },

  routes: null,
  getRoutes: cb => {
    if (dataSamples.routes === null) {
      loadJson(ROUTES_FILE).then(data => {
        dataSamples.routes = data.features;
        cb();
      });
      dataSamples.routes = false;
    }
    return dataSamples.routes;
  },

  meterPoints: null,
  getMeterPoints: () => {
    dataSamples.meterPoints = dataSamples.meterPoints || pointGrid(1e4, [-5000, -5000, 5000, 5000]);
    return dataSamples.meterPoints;
  },

  points100K: null,
  get100KPoints: () => {
    dataSamples.points100K = dataSamples.points100K || pointGrid(1e5, [-122.6, 37.6, -122.2, 37.9]);
    return dataSamples.points100K;
  },

  points1M: null,
  get1MPoints: () => {
    dataSamples.points1M = dataSamples.points1M || pointGrid(1e6, [-122.6, 37.6, -122.2, 37.9]);
    return dataSamples.points1M;
  },

  points10M: null,
  get10MPoints: () => {
    dataSamples.points10M = dataSamples.points10M || pointGrid(1e7, [-122.6, 37.6, -122.2, 37.9]);
    return dataSamples.points10M;
  }
};

export default dataSamples;
