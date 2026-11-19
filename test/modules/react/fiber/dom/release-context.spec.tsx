// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Deck} from '@deck.gl/core';
import {act, StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';
import {device as testDevice} from '@deck.gl/test-utils/vitest';

import {DeckGL} from '@deck.gl/react/dom/index';

// Tells React this test drives updates with `act`, so it does not warn about it.
(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

/** Waits past the task in which the context is released. */
function nextTask(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 20));
}

/** Renders a DeckGL root and resolves with its canvas's context once it has loaded. */
async function renderDeckGL(
  props: {device?: unknown; canvas?: HTMLCanvasElement} = {},
  strict = false
) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let onLoad!: () => void;
  const loaded = new Promise<void>(resolve => {
    onLoad = resolve;
  });
  const element = <DeckGL width={4} height={4} onLoad={onLoad} {...(props as object)} />;
  await act(() => root.render(strict ? <StrictMode>{element}</StrictMode> : element));
  await loaded;
  const gl = (props.canvas ?? container.querySelector('canvas')!).getContext('webgl2')!;
  return {root, container, gl};
}

test('the DeckGL root releases its context when it unmounts', async () => {
  const {root, container, gl} = await renderDeckGL();

  await act(() => root.unmount());
  container.remove();
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('the DeckGL root keeps its context through a StrictMode remount', async () => {
  const {root, container, gl} = await renderDeckGL({}, true);

  await nextTask();
  expect(gl.isContextLost(), 'StrictMode finalized one Deck, but the canvas stayed').toBe(false);

  await act(() => root.unmount());
  container.remove();
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('the DeckGL root never releases a device the app passed', async () => {
  const {root, container} = await renderDeckGL({device: testDevice as Deck['device']});

  await act(() => root.unmount());
  container.remove();
  await nextTask();
  expect(testDevice.isLost).toBe(false);
});

test('the DeckGL root leaves a canvas the app passed under app control', async () => {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const {root, container} = await renderDeckGL({canvas});
  const gl = canvas.getContext('webgl2')!;

  // The app detaches its canvas as it unmounts the component, then reuses it.
  canvas.remove();
  await act(() => root.unmount());
  container.remove();
  await nextTask();
  expect(gl.isContextLost(), 'not released: the app may reuse it').toBe(false);

  document.body.appendChild(canvas);
  const remounted = await renderDeckGL({canvas});
  expect(gl.isContextLost(), 'the remounted root renders on the same context').toBe(false);

  await act(() => remounted.root.unmount());
  remounted.container.remove();
  canvas.remove();
  gl.getExtension('WEBGL_lose_context')?.loseContext();
});
