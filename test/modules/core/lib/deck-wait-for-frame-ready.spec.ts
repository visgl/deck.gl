// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Deck} from '@deck.gl/core';
import type {DeckProps} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {sleep} from './async-iterator-test-utils';

const DATA = [{position: [0, 0]}];

function createDeck(props: DeckProps = {}) {
  return new Deck({
    device,
    width: 10,
    height: 10,
    initialViewState: {longitude: 0, latitude: 0, zoom: 1},
    ...props
  });
}

function createLayer(props = {}) {
  return new ScatterplotLayer({
    id: 'points',
    data: DATA,
    getPosition: d => d.position,
    ...props
  });
}

function createDeferredData() {
  let resolve!: (data: typeof DATA) => void;
  const promise = new Promise<typeof DATA>(resolveData => {
    resolve = resolveData;
  });
  return {promise, resolve};
}

/** Tracks whether a promise has settled, and how */
function trackPromise(promise: Promise<void>) {
  const state: {settled: boolean; error: Error | null} = {settled: false, error: null};
  promise.then(
    () => {
      state.settled = true;
    },
    error => {
      state.settled = true;
      state.error = error;
    }
  );
  return state;
}

function isLayerLoaded(deck: Deck<any>) {
  return Boolean(deck['layerManager']?.getLayers().every(layer => layer.isLoaded));
}

test('Deck#waitForFrameReady resolves after the first render', async () => {
  const onAfterRender = vi.fn();
  // Called before the device is created
  const deck = createDeck({layers: [createLayer()], onAfterRender});
  expect(deck.isInitialized).toBe(false);
  await deck.waitForFrameReady();
  expect(onAfterRender).toHaveBeenCalled();
  deck.finalize();
});

test('Deck#waitForFrameReady resolves a settled scene without rendering', async () => {
  const onAfterRender = vi.fn();
  const deck = createDeck({layers: [createLayer()], onAfterRender});
  await deck.waitForFrameReady();
  const renderCount = onAfterRender.mock.calls.length;
  await deck.waitForFrameReady();
  expect(onAfterRender.mock.calls.length).toBe(renderCount);
  deck.finalize();
});

test('Deck#waitForFrameReady waits for async data', async () => {
  const data = createDeferredData();
  const deck = createDeck({layers: [createLayer({data: data.promise})]});
  const wait = trackPromise(deck.waitForFrameReady());

  await sleep(100);
  expect(wait.settled, 'pending while data loads').toBe(false);

  data.resolve(DATA);
  await vi.waitFor(() => expect(wait.settled).toBe(true));
  expect(wait.error).toBeNull();
  expect(isLayerLoaded(deck)).toBe(true);
  deck.finalize();
});

test('Deck#waitForFrameReady handles overlapping calls independently', async () => {
  const data = createDeferredData();
  const deck = createDeck({layers: [createLayer({data: data.promise})]});
  const shortWait = trackPromise(deck.waitForFrameReady({timeout: 50}));
  const longWait = trackPromise(deck.waitForFrameReady());
  const otherLongWait = trackPromise(deck.waitForFrameReady());

  await vi.waitFor(() => expect(shortWait.settled).toBe(true));
  expect(shortWait.error?.message).toMatch('timed out');
  expect(longWait.settled, 'a timeout does not settle other calls').toBe(false);

  data.resolve(DATA);
  await vi.waitFor(() => expect(longWait.settled && otherLongWait.settled).toBe(true));
  expect(longWait.error).toBeNull();
  expect(otherLongWait.error).toBeNull();
  deck.finalize();
});

test('Deck#waitForFrameReady leaves onAfterRender untouched', async () => {
  const data = createDeferredData();
  const firstOnAfterRender = vi.fn();
  const secondOnAfterRender = vi.fn();
  const deck = createDeck({
    layers: [createLayer({data: data.promise})],
    onAfterRender: firstOnAfterRender
  });
  const wait = trackPromise(deck.waitForFrameReady());
  expect(deck.props.onAfterRender).toBe(firstOnAfterRender);

  // Applications, e.g. the React wrapper, may replace callbacks while a call is pending
  deck.setProps({onAfterRender: secondOnAfterRender});
  data.resolve(DATA);
  await vi.waitFor(() => expect(wait.settled).toBe(true));
  expect(wait.error).toBeNull();
  expect(deck.props.onAfterRender).toBe(secondOnAfterRender);
  expect(secondOnAfterRender).toHaveBeenCalled();
  deck.finalize();
});

test('Deck#waitForFrameReady rejects when the Deck is finalized', async () => {
  const deck = createDeck({layers: [createLayer({data: createDeferredData().promise})]});
  const wait = deck.waitForFrameReady();
  deck.finalize();
  await expect(wait).rejects.toThrow('finalized');
  await expect(deck.waitForFrameReady()).rejects.toThrow('finalized');
});

test('Deck#waitForFrameReady resolves with _animate', async () => {
  const onAfterRender = vi.fn();
  const deck = createDeck({_animate: true, layers: [createLayer()], onAfterRender});
  await deck.waitForFrameReady({timeout: 1000});
  // Every call waits for another render, since each frame may change the scene
  const renderCount = onAfterRender.mock.calls.length;
  await deck.waitForFrameReady({timeout: 1000});
  expect(onAfterRender.mock.calls.length).toBeGreaterThan(renderCount);
  deck.finalize();
});

test('Deck#waitForFrameReady waits for transitions', async () => {
  const transitions = {getRadius: 300};
  const deck = createDeck({layers: [createLayer({getRadius: 1, transitions})]});
  await deck.waitForFrameReady();

  deck.setProps({layers: [createLayer({getRadius: 10, transitions})]});
  const wait = deck.waitForFrameReady();
  await vi.waitFor(() => expect(deck.hasActiveTransitions()).toBe(true));
  await wait;
  expect(deck.hasActiveTransitions()).toBe(false);
  deck.finalize();
});
