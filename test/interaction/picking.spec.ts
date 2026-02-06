// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, beforeAll, afterAll} from 'vitest';
import {commands} from '@vitest/browser/context';
import {Deck, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

// Test utilities
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function emulateEvent(event: any): Promise<void> {
  if ('wait' in event) {
    await sleep(event.wait);
  } else {
    await commands.emulateInput(event);
  }
}

// Event logs
const clickEvents: any[] = [];
const hoverEvents: any[] = [];

// Shared Deck instance
let deck: Deck<any> | null = null;

const deckProps = {
  id: 'interaction-test-picking',
  width: 800,
  height: 400,
  style: {position: 'absolute' as const, left: '0px', top: '0px'},
  views: new MapView(),
  initialViewState: {
    longitude: -122,
    latitude: 38,
    zoom: 14,
    pitch: 30,
    bearing: -45
  },
  controller: true,
  useDevicePixels: false,
  debug: true,
  onClick: (info: any, event: any) => clickEvents.push({info, event}),
  onHover: (info: any, event: any) => hoverEvents.push({info, event}),
  layers: [
    new ScatterplotLayer({
      id: 'test-scatterplot',
      data: [{position: [-122, 38]}, {position: [-122.05, 37.99]}],
      getPosition: (d: any) => d.position,
      getRadius: 100,
      getColor: [255, 0, 0],
      pickable: true,
      autoHighlight: true
    })
  ]
};

beforeAll(async () => {
  deck = new Deck(deckProps);
  // Wait for deck to initialize
  await new Promise<void>(resolve => {
    deck!.setProps({onLoad: resolve});
  });
});

afterAll(() => {
  if (deck) {
    deck.finalize();
    deck = null;
  }
});

function resetEventLogs() {
  clickEvents.length = 0;
  hoverEvents.length = 0;
}

// TODO: Hover test doesn't work with synthetic DOM pointer events in vitest browser mode
// The pointermove events may not trigger deck.gl's picking system correctly
test.skip('Picking hover', async () => {
  resetEventLogs();

  await emulateEvent({type: 'mousemove', x: 400, y: 200});
  await emulateEvent({wait: 50});

  expect(hoverEvents.length, 'onHover is called').toBe(1);
  expect(hoverEvents[0].info.index, 'object is picked').toBe(0);

  // @ts-expect-error Accessing internal layer state
  const layers = deck!.layerManager.getLayers();
  const uniforms = (layers[0] as any).state.model.shaderInputs.getUniformValues();
  expect(uniforms.picking.highlightedObjectColor, 'autoHighlight parameter is set').toEqual([
    1, 0, 0
  ]);
});

// TODO(felixpalmer/ibgreen): Temporarily disabled during luma 9.2 upgrade
// test('Picking click', async () => {
//   resetEventLogs();
//
//   await emulateEvent({type: 'click', x: 400, y: 200});
//   await emulateEvent({wait: 350});
//
//   expect(clickEvents.length, 'onClick is called').toBe(1);
//   expect(clickEvents[0].info.index, 'object is picked').toBe(0);
// });
