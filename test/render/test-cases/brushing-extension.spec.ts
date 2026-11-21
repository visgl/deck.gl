// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer} from '@deck.gl/layers';
import {BrushingExtension} from '@deck.gl/extensions';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {WIDTH, HEIGHT} from '../constants';
import type {TestCase} from '../deck-test-utils';

/**
 * BrushingExtension render cases. The pointer is placed at the center of the canvas, so only
 * the points within `brushingRadius` of the center should be drawn over the background grid.
 */

const VIEWSTATE = {latitude: 37, longitude: -122, zoom: 10.2, pitch: 0, bearing: 0};
const DATA: {position: [number, number]}[] = [];
for (let y = 0; y < 20; y++) {
  for (let x = 0; x < 32; x++) {
    DATA.push({
      position: [VIEWSTATE.longitude + 0.01 * (x - 16), VIEWSTATE.latitude - 0.01 * (y - 10)]
    });
  }
}

const testCases = [
  {name: 'source', brushingTarget: 'source'},
  {name: 'disabled', brushingTarget: 'source', brushingEnabled: false}
].map(({name, ...props}) => ({
  name: `brushing-extension-${name}`,
  viewState: VIEWSTATE,
  layers: [
    new ScatterplotLayer({
      id: `${name}-background`,
      data: DATA,
      getPosition: d => d.position,
      getRadius: 2,
      radiusUnits: 'pixels'
    }),
    new ScatterplotLayer({
      id: name,
      data: DATA,
      getPosition: d => d.position,
      getRadius: 8,
      radiusUnits: 'pixels',
      getFillColor: [255, 0, 0],
      extensions: [new BrushingExtension()],
      brushingRadius: 5000,
      ...props
    })
  ],
  onBeforeRender: ({deck}) => {
    // Stand in for a pointer event, which sets the brushing position on the layer context
    // @ts-expect-error Accessing protected layerManager
    deck.layerManager.context.mousePosition = {x: WIDTH / 2, y: HEIGHT / 2};
    deck.redraw('brushing');
  },
  goldenImage: `./test/render/golden-images/brushing-extension-${name}.png`
}));

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType);
});
