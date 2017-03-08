import Immutable from 'immutable';

import * as jsDataSamples from './data-samples';

// Enable switching of data between JS and Immutable
const convertSamples = {
  choropleths: true,
  geojson: true,
  hexagons: true,
  routes: true,
  trips: true,
  iconAtlas: true,
  points: true,
  worldGrid: true,
  zigzag: true,
  polygons: true
};

const immutableDataSamples = {};
for (const key in jsDataSamples) {
  if (key in convertSamples) {
    immutableDataSamples[key] = Immutable.fromJS(jsDataSamples[key]);
  }
}

// Data samples will contain either JS or immutable
const dataSamples = Object.assign({}, jsDataSamples);

// Enables simple switching of data between JS and Immutable
export function setImmutableDataSamples(immutable) {
  Object.assign(dataSamples, immutable ? immutableDataSamples : jsDataSamples);
}

export default dataSamples;
