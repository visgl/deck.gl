/* eslint-disable no-console, no-invalid-this */
/* global console */
import {Suite} from 'benchmark';
import * as data from '../data';

import {
  ScatterplotLayer,
  PolygonLayer,
  PathLayer,
  ChoroplethLayer,
  ExtrudedChoroplethLayer64
} from 'deck.gl';

import {parseColor} from 'deck.gl/lib/utils/color';

import {testInitializeLayer} from '../test-utils';

const suite = new Suite();
const lines = data.choropleths.features.map(f => ({path: f.geometry.coordinates[0]}));

const COLOR_STRING = '#FFEEBB';
const COLOR_ARRAY = [222, 222, 222];

// add tests
suite
.add('color#parseColor (string)', () => {
  return parseColor(COLOR_STRING);
})
.add('color#parseColor (3 element array)', () => {
  return parseColor(COLOR_ARRAY);
})
.add('ScatterplotLayer#construct', () => {
  return new ScatterplotLayer({data: data.points});
})
.add('ChoroplethLayer#construct', () => {
  return new ChoroplethLayer({data: data.choropleths});
})
.add('PolygonLayer#construct', () => {
  return new PolygonLayer({data: data.choropleths});
})
.add('ScatterplotLayer#initialize', () => {
  const layer = new ChoroplethLayer({data: data.points});
  testInitializeLayer({layer});
})
.add('ChoroplethLayer#initialize', () => {
  const layer = new ChoroplethLayer({data: data.choropleths});
  testInitializeLayer({layer});
})
.add('PathLayer#initialize', () => {
  const layer = new PathLayer({data: lines});
  testInitializeLayer({layer});
})
.add('PolygonLayer#initialize (flat)', () => {
  const layer = new PolygonLayer({data: data.choropleths});
  testInitializeLayer({layer});
})
.add('PolygonLayer#initialize (extruded)', () => {
  const layer = new PolygonLayer({data: data.choropleths, extruded: true});
  testInitializeLayer({layer});
})
.add('PolygonLayer#initialize (wireframe)', () => {
  const layer = new PolygonLayer({data: data.choropleths, extruded: true, wireframe: true});
  testInitializeLayer({layer});
})
// .add('PolygonLayer#initialize from Immutable', () => {
//   const layer = new PolygonLayer({data: data.immutableChoropleths});
//   testInitializeLayer({layer});
// })
.add('ExtrudedChoroplethLayer64#initialize', () => {
  try {
    const layer = new ExtrudedChoroplethLayer64({
      id: 'extrudedChoroplethLayer64',
      data: data.choropleths,
      getColor: f => [128, 0, 0],
      pointLightLocation: [
        37.751537058389985,
        -122.42694203247012,
        1e4
      ],
      opacity: 1.0,
      pickable: true
    });
    testInitializeLayer({layer});
  } catch (error) {
    console.error(error);
  }
})
// .add('ScatterplotLayer#initialize', () => {
//   const layer = new ScatterplotLayer({data: data.points});
//   testInitializeLayer({layer});
// })
// add listeners
.on('start', (event) => {
  console.log('Starting bench...');
})
.on('cycle', (event) => {
  console.log(String(event.target));
})
.on('complete', function t() {
  console.log(`Fastest is ${this.filter('fastest').map('name')}`);
})
.run({});
