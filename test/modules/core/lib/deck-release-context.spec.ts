// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, _releaseCanvasContext as releaseCanvasContext} from '@deck.gl/core';
import {device as testDevice} from '@deck.gl/test-utils/vitest';

/** Size of every canvas in these tests. */
const SIZE = {width: 4, height: 4};

/** Creates a Deck and resolves once its device is initialized. */
function createDeck(props: Record<string, unknown> = {}): Promise<Deck> {
  return new Promise((resolve, reject) => {
    const deck = new Deck({...SIZE, onLoad: () => resolve(deck), onError: reject, ...props});
  });
}

/** The WebGL context of a Deck's device. */
function getContext(deck: Deck): WebGL2RenderingContext {
  return (deck.device as unknown as {gl: WebGL2RenderingContext}).gl;
}

/** Waits past the task in which the context is released. */
function nextTask(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 20));
}

/** Creates a canvas attached to the document. */
function attachCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.assign(canvas, SIZE);
  document.body.appendChild(canvas);
  return canvas;
}

test('Deck#finalize releases the context of a canvas Deck created', async () => {
  const deck = await createDeck();
  const gl = getContext(deck);

  deck.finalize();
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('Deck#finalize leaves a passed canvas to the app', async () => {
  const canvas = attachCanvas();
  const deck = await createDeck({canvas});
  const gl = getContext(deck);

  canvas.remove();
  deck.finalize();
  await nextTask();
  expect(gl.isContextLost()).toBe(false);

  releaseCanvasContext(deck);
  await nextTask();
  expect(gl.isContextLost(), 'released once the app asks').toBe(true);
});

test('_releaseCanvasContext keeps a canvas that is still in the document', async () => {
  const canvas = attachCanvas();
  const deck = await createDeck({canvas});
  const gl = getContext(deck);

  deck.finalize();
  releaseCanvasContext(deck);
  await nextTask();
  expect(gl.isContextLost()).toBe(false);

  canvas.remove();
  gl.getExtension('WEBGL_lose_context')?.loseContext();
});

test('_releaseCanvasContext keeps the context when a new Deck starts on the canvas', async () => {
  const canvas = attachCanvas();
  const first = await createDeck({canvas});
  const gl = getContext(first);

  // As in React StrictMode: finalize, then start again on the same canvas.
  first.finalize();
  releaseCanvasContext(first);
  const second = await createDeck({canvas});
  canvas.remove();
  await nextTask();
  expect(gl.isContextLost(), 'the second Deck still uses it').toBe(false);
  expect(getContext(second)).toBe(gl);

  second.finalize();
  releaseCanvasContext(second);
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('_releaseCanvasContext waits for a device that is still initializing', async () => {
  const canvas = attachCanvas();
  const deck = new Deck({...SIZE, canvas});

  canvas.remove();
  deck.finalize();
  releaseCanvasContext(deck);
  const device = await deck._createdDevice!.device;
  await nextTask();
  expect(device.isLost).toBe(true);
});

test('_releaseCanvasContext never releases a device the app passed', async () => {
  const deck = await createDeck({device: testDevice});

  deck.finalize();
  releaseCanvasContext(deck);
  await nextTask();
  expect(testDevice.isLost).toBe(false);
});
