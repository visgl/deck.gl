// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, beforeAll, afterAll} from 'vitest';
import {commands} from 'vitest/browser';
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

function getCanvas(): HTMLCanvasElement {
  const canvases = Array.from(document.querySelectorAll('canvas'));
  const canvas = canvases.reverse().find(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  if (!canvas) throw new Error('No canvas found');
  return canvas;
}

async function dispatchPointerTap(x: number, y: number, opts?: {shiftKey?: boolean}) {
  const canvas = getCanvas();
  const shiftKey = opts?.shiftKey ?? false;
  const down = new PointerEvent('pointerdown', {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    button: 0,
    buttons: 1,
    shiftKey
  });
  canvas.dispatchEvent(down);
  await sleep(10);
  const up = new PointerEvent('pointerup', {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    button: 0,
    buttons: 0,
    shiftKey
  });
  // PointerEventInput listens for pointerup on window, not on the element
  window.dispatchEvent(up);
}

async function dispatchPointerDoubleTap(x: number, y: number, opts?: {shiftKey?: boolean}) {
  await dispatchPointerTap(x, y, opts);
  await sleep(50);
  await dispatchPointerTap(x, y, opts);
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
  const testDeck = new Deck({
    ...deckProps,
    id: 'dblclick-zoom-in-deck',
    controller: {doubleClickZoom: true}
  });
  await new Promise<void>(resolve => {
    testDeck.setProps({onLoad: resolve});
  });

  const oldZoom = testDeck.getViewports()[0].zoom;
  await dispatchPointerDoubleTap(200, 100);
  await sleep(500);

  const newZoom = testDeck.getViewports()[0].zoom;
  testDeck.finalize();
  expect(newZoom > oldZoom, 'map zoomed in').toBeTruthy();
});

test('MapController shift-dblclick zoom out', async () => {
  const testDeck = new Deck({
    ...deckProps,
    id: 'dblclick-zoom-out-deck',
    controller: {doubleClickZoom: true}
  });
  await new Promise<void>(resolve => {
    testDeck.setProps({onLoad: resolve});
  });

  const oldZoom = testDeck.getViewports()[0].zoom;
  await dispatchPointerDoubleTap(200, 100, {shiftKey: true});
  await sleep(500);

  const newZoom = testDeck.getViewports()[0].zoom;
  testDeck.finalize();
  expect(newZoom < oldZoom, 'map zoomed out').toBeTruthy();
});

test('MapController keyboard left', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowLeft'});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.longitude < oldViewport.longitude, 'map moved').toBeTruthy();
});

test('MapController keyboard up', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowUp'});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.latitude > oldViewport.latitude, 'map moved').toBeTruthy();
});

test('MapController keyboard shift-left rotate', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowLeft', shiftKey: true});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.bearing < oldViewport.bearing, 'map rotated').toBeTruthy();
});

test('MapController keyboard shift-up rotate', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'ArrowUp', shiftKey: true});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.pitch > oldViewport.pitch, 'map rotated').toBeTruthy();
});

test('MapController keyboard minus zoom out', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'Minus'});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.zoom < oldViewport.zoom, 'map zoomed').toBeTruthy();
});

test('MapController keyboard shift-plus zoom in', async () => {
  await resetViewState();
  const oldViewport = getViewport();

  await emulateEvent({type: 'keypress', key: 'Equal', shiftKey: true});
  await emulateEvent({wait: 300});

  const newViewport = getViewport();
  expect(newViewport.zoom > oldViewport.zoom, 'map zoomed').toBeTruthy();
});

test('MapController click fires immediately when doubleClickZoom is disabled', async () => {
  const testDeck = new Deck({
    ...deckProps,
    id: 'click-test-deck',
    controller: {doubleClickZoom: false}
  });
  await new Promise<void>(resolve => {
    testDeck.setProps({onLoad: resolve});
  });

  const timestamps: number[] = [];
  const eventManager = testDeck.getEventManager()!;

  const handler = () => {
    timestamps.push(performance.now());
  };
  eventManager.on('click', handler);

  const beforeClick = performance.now();
  await dispatchPointerTap(400, 200);
  await sleep(50);

  eventManager.off('click', handler);
  testDeck.finalize();

  expect(timestamps.length, 'click event fired').toBeGreaterThan(0);
  const delay = timestamps[0] - beforeClick;
  expect(delay, 'click fired without 300ms recognizer delay').toBeLessThan(100);
});

test('MapController click is delayed when doubleClickZoom is enabled', async () => {
  const testDeck = new Deck({
    ...deckProps,
    id: 'click-delay-test-deck',
    controller: {doubleClickZoom: true}
  });
  await new Promise<void>(resolve => {
    testDeck.setProps({onLoad: resolve});
  });

  const timestamps: number[] = [];
  const eventManager = testDeck.getEventManager()!;

  const handler = () => {
    timestamps.push(performance.now());
  };
  eventManager.on('click', handler);

  const beforeClick = performance.now();
  await dispatchPointerTap(400, 200);
  await sleep(100);

  expect(timestamps.length, 'click has not fired within 100ms').toBe(0);

  await sleep(250);

  expect(timestamps.length, 'click fired after recognizer delay').toBeGreaterThan(0);
  const delay = timestamps[0] - beforeClick;
  expect(delay, 'click took at least 250ms (300ms recognizer delay)').toBeGreaterThan(250);

  eventManager.off('click', handler);
  testDeck.finalize();
});

test('MapController runtime controller prop change takes effect', async () => {
  // Start with doubleClickZoom enabled (click is delayed ~300ms)
  const testDeck = new Deck({
    ...deckProps,
    id: 'runtime-toggle-deck',
    controller: {doubleClickZoom: true}
  });
  await new Promise<void>(resolve => {
    testDeck.setProps({onLoad: resolve});
  });

  const timestamps: number[] = [];
  const eventManager = testDeck.getEventManager()!;
  const handler = () => {
    timestamps.push(performance.now());
  };
  eventManager.on('click', handler);

  // Confirm click is delayed with doubleClickZoom on
  await dispatchPointerTap(400, 200);
  await sleep(100);
  expect(timestamps.length, 'click delayed with doubleClickZoom:true').toBe(0);
  await sleep(300);
  timestamps.length = 0;

  // Toggle doubleClickZoom off at runtime
  testDeck.setProps({controller: {doubleClickZoom: false}});
  await sleep(50);

  // Click should now fire immediately
  const beforeClick = performance.now();
  await dispatchPointerTap(400, 200);
  await sleep(50);

  expect(timestamps.length, 'click fires after runtime toggle').toBeGreaterThan(0);
  const delay = timestamps[0] - beforeClick;
  expect(delay, 'click is immediate after disabling doubleClickZoom').toBeLessThan(100);

  eventManager.off('click', handler);
  testDeck.finalize();
});
