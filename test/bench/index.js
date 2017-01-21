/* eslint-disable no-console, no-invalid-this */
/* global console */
import {Suite} from 'benchmark';
import * as data from '../data';
import {ScatterplotLayer, ChoroplethLayer} from 'deck.gl';

import {createGLContext} from 'luma.gl';

export function testInitializeLayer({gl, layer}) {
  const oldContext = {gl};
  const context = {gl};
  let failures = 0;
  try {
    layer.context = context;

    layer.initializeLayer({
      oldProps: {},
      props: layer.props,
      oldContext,
      context,
      changeFlags: layer.diffProps({}, layer.props, context)
    });

    layer.updateLayer({
      oldProps: {},
      props: layer.props,
      oldContext,
      context,
      changeFlags: layer.diffProps({}, layer.props, context)
    });
  } catch (error) {
    failures++;
  }
  return failures;
}

const gl = createGLContext();

const suite = new Suite();

// add tests
suite
.add('ScatterplotLayer#construct', () => {
  return new ScatterplotLayer({data: data.choropleths});
})
.add('ChoroplethLayer#construct', () => {
  return new ChoroplethLayer({data: data.choropleths});
})
.add('ChoroplethLayer#initialize', () => {
  const layer = new ChoroplethLayer({data: data.choropleths});
  testInitializeLayer({gl, layer});
})
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
// run async
.run({delay: 0.1});
