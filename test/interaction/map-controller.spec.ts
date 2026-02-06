// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, beforeAll, afterAll} from 'vitest';
import {commands} from '@vitest/browser/context';
import {Deck, MapView} from '@deck.gl/core';

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

// Shared Deck instance and state
let deck: Deck<any> | null = null;

function getViewport() {
  return deck!.getViewports()[0];
}

const deckProps = {
  id: 'interaction-test-map-controller',
  width: 800,
  height: 400,
  style: {position: 'absolute' as const, left: '0px', top: '0px'},
  views: new MapView(),
  initialViewState: {
    longitude: -122,
    latitude: 38,
    zoom: 10,
    pitch: 30,
    bearing: -45
  },
  controller: true,
  useDevicePixels: false,
  debug: true
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

// Reset view state before each test
async function resetViewState() {
  deck!.setProps({
    initialViewState: {
      longitude: -122,
      latitude: 38,
      zoom: 10,
      pitch: 30,
      bearing: -45
    }
  });
  // Wait for any ongoing animations/transitions to complete
  // Previous tests may have triggered zoom animations that need time to finish
  await sleep(500);
}

test('MapController pan', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'drag', startX: 400, startY: 100, endX: 300, endY: 150, steps: 3});

  const newViewport = getViewport();
  expect(
    newViewport.longitude > oldViewport.longitude && newViewport.latitude > oldViewport.latitude,
    'map moved'
  ).toBeTruthy();
  expect(
    newViewport.zoom === oldViewport.zoom &&
      newViewport.pitch === oldViewport.pitch &&
      newViewport.bearing === oldViewport.bearing,
    'map did not zoom or rotate'
  ).toBeTruthy();
});

test('MapController rotate', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({
    type: 'drag',
    startX: 400,
    startY: 100,
    endX: 300,
    endY: 150,
    steps: 3,
    shiftKey: true
  });

  const newViewport = getViewport();
  expect(
    newViewport.longitude === oldViewport.longitude &&
      newViewport.latitude === oldViewport.latitude &&
      newViewport.zoom === oldViewport.zoom,
    'map did not move'
  ).toBeTruthy();
  expect(
    newViewport.pitch < oldViewport.pitch && newViewport.bearing < oldViewport.bearing,
    'map rotated'
  ).toBeTruthy();
});

test('MapController dblclick zoom in', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'click', x: 200, y: 100});
  await emulateEvent({wait: 50});
  await emulateEvent({type: 'click', x: 200, y: 100});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.zoom > oldViewport.zoom, 'map zoomed in').toBeTruthy();
});

test('MapController shift-dblclick zoom out', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'click', x: 200, y: 100, shiftKey: true});
  await emulateEvent({wait: 50});
  await emulateEvent({type: 'click', x: 200, y: 100, shiftKey: true});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.zoom < oldViewport.zoom, 'map zoomed out').toBeTruthy();
});

// TODO: Keyboard tests don't work with synthetic DOM events in vitest browser mode
// deck.gl's EventManager may require real browser keyboard events for focus handling
test.skip('MapController keyboard left', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowLeft'});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.longitude < oldViewport.longitude, 'map moved').toBeTruthy();
});

test.skip('MapController keyboard up', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowUp'});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.latitude > oldViewport.latitude, 'map moved').toBeTruthy();
});

test.skip('MapController keyboard shift-left rotate', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowLeft', shiftKey: true});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.bearing < oldViewport.bearing, 'map rotated').toBeTruthy();
});

test.skip('MapController keyboard shift-up rotate', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowUp', shiftKey: true});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.pitch > oldViewport.pitch, 'map rotated').toBeTruthy();
});

test.skip('MapController keyboard minus zoom out', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'Minus'});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.zoom < oldViewport.zoom, 'map zoomed').toBeTruthy();
});

test.skip('MapController keyboard shift-plus zoom in', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'Equal', shiftKey: true});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.zoom > oldViewport.zoom, 'map zoomed').toBeTruthy();
});
