// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, type DeckProps} from '@deck.gl/core';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';
import {device as testDevice} from '@deck.gl/test-utils/vitest';

/** Size of every canvas in these tests. */
const SIZE = {width: 4, height: 4};

/** Creates a Deck and resolves once its device is initialized. */
function createDeck(props: DeckProps = {}): Promise<Deck> {
  return new Promise((resolve, reject) => {
    const deck = new Deck({
      ...SIZE,
      onLoad: () => resolve(deck),
      onError: reject,
      ...props,
      deviceProps: {...props.deviceProps, type: 'webgl'}
    });
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
  expect(deck.device!.ownsHandle, 'Deck owns the context of a device it creates').toBe(true);

  deck.finalize();
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('Deck#finalize tears down the wrapper of an app canvas and keeps its WebGL context', async () => {
  const canvas = attachCanvas();
  const first = await createDeck({canvas});
  const firstDevice = first.device!;
  const context = firstDevice.getDefaultCanvasContext();
  const gl = getContext(first);
  expect(firstDevice.ownsHandle).toBe(false);

  try {
    first.finalize();
    await nextTask();
    expect(firstDevice.isLost).toBe(true);
    expect(context.device).toBeNull();
    expect(gl.isContextLost()).toBe(false);

    const next = await createDeck({canvas});
    expect(next.device).not.toBe(firstDevice);
    expect(getContext(next)).toBe(gl);
    next.finalize();
    await nextTask();
  } finally {
    canvas.remove();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
});

test('Deck#finalize waits for a borrower before detaching a device from a supplied canvas', async () => {
  const canvas = attachCanvas();
  const owner = await createDeck({canvas});
  const device = owner.device!;
  const gl = getContext(owner);
  const borrower = await createDeck({device});
  try {
    owner.finalize();
    await nextTask();
    expect(device.isLost).toBe(false);
    borrower.finalize();
    await nextTask();
    expect(device.isLost).toBe(true);
    expect(gl.isContextLost()).toBe(false);
  } finally {
    canvas.remove();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
});

test('Deck#finalize keeps a canvas that is still in the document', async () => {
  const canvas = attachCanvas();
  const deck = await createDeck({canvas, deviceProps: {ownsHandle: true}});
  const gl = getContext(deck);

  deck.finalize();
  await nextTask();
  expect(gl.isContextLost()).toBe(false);

  canvas.remove();
  gl.getExtension('WEBGL_lose_context')?.loseContext();
});

test('Deck#finalize keeps the context when a new Deck starts on the canvas', async () => {
  const canvas = attachCanvas();
  const first = await createDeck({canvas, deviceProps: {ownsHandle: true}});
  const gl = getContext(first);

  // As in React StrictMode: finalize, then start again on the same canvas.
  first.finalize();
  const second = await createDeck({canvas, deviceProps: {ownsHandle: true}});
  canvas.remove();
  await nextTask();
  expect(gl.isContextLost(), 'the second Deck still uses it').toBe(false);
  expect(getContext(second)).toBe(gl);

  second.finalize();
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('Deck#finalize waits for a device that is still initializing', async () => {
  const canvas = attachCanvas();
  const gl = canvas.getContext('webgl2')!;
  const deck = new Deck({...SIZE, canvas, deviceProps: {type: 'webgl', ownsHandle: true}});

  canvas.remove();
  deck.finalize();
  await expect.poll(() => gl.isContextLost()).toBe(true);
});

test('Deck#finalize leaves an app device that Deck reused for a passed canvas', async () => {
  const canvas = attachCanvas();
  const appDevice = await luma.createDevice({
    type: 'webgl',
    adapters: [webgl2Adapter],
    ownsHandle: true,
    createCanvasContext: {canvas}
  });
  const deck = await createDeck({canvas});
  expect(deck.device, 'luma.gl reuses the device already on the canvas').toBe(appDevice);

  canvas.remove();
  deck.finalize();
  await nextTask();
  expect(appDevice.isLost, 'the app still owns its device').toBe(false);
  appDevice.destroy();
});

test('Deck#finalize never releases a device the app passed', async () => {
  const deck = await createDeck({device: testDevice});

  deck.finalize();
  await nextTask();
  expect(testDevice.isLost).toBe(false);
});

test('finalizing a Deck twice keeps the context another Deck uses', async () => {
  const canvas = attachCanvas();
  const first = await createDeck({canvas, deviceProps: {ownsHandle: true}});
  const gl = getContext(first);

  first.finalize();
  const second = await createDeck({canvas, deviceProps: {ownsHandle: true}});
  first.finalize();
  canvas.remove();
  await nextTask();
  expect(gl.isContextLost(), 'the second Deck still uses it').toBe(false);

  second.finalize();
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('Deck#finalize keeps a context that another Deck borrowed', async () => {
  const canvas = attachCanvas();
  const first = await createDeck({canvas, deviceProps: {ownsHandle: true}});
  const gl = getContext(first);
  const second = await createDeck({device: first.device});

  canvas.remove();
  first.finalize();
  await nextTask();
  expect(gl.isContextLost(), 'the second Deck renders with the same device').toBe(false);

  // The release waits for the last Deck on the canvas, with no further call.
  second.finalize();
  await nextTask();
  expect(gl.isContextLost()).toBe(true);
});

test('Deck#finalize leaves a canvas from another window to the app', async () => {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  const iframeDocument = iframe.contentDocument!;
  const canvas = iframeDocument.createElement('canvas');
  Object.assign(canvas, SIZE);
  iframeDocument.body.appendChild(canvas);
  expect(canvas instanceof HTMLCanvasElement, 'a canvas from another realm').toBe(false);

  const deck = await createDeck({canvas});
  const gl = getContext(deck);
  deck.finalize();
  await nextTask();
  expect(gl.isContextLost(), 'the app may reuse its canvas').toBe(false);

  // A new Deck on the same canvas still renders.
  const next = await createDeck({canvas});
  expect(getContext(next)).toBe(gl);
  expect(gl.isContextLost()).toBe(false);
  next.finalize();
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  iframe.remove();
});
