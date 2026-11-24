// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import {act, createElement, StrictMode} from 'react';
import type {ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {DeckGL as LegacyDeckGL} from '@deck.gl/react/legacy';
import {device as testDevice} from '@deck.gl/test-utils/vitest';

/** Size of every DeckGL in these tests. */
const SIZE = {width: 4, height: 4};

/** Waits past the task in which the context is released. */
function nextTask(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 20));
}

/** Renders a DeckGL and resolves once it has loaded. */
async function renderDeckGL(
  Component: ComponentType<any>,
  props: Record<string, unknown> = {},
  strict = false
) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let onLoad!: () => void;
  const loaded = new Promise<void>(resolve => {
    onLoad = resolve;
  });
  const element = createElement(Component, {
    ...SIZE,
    deviceProps: {type: 'webgl'},
    onLoad,
    ...props
  });
  await act(() => root.render(strict ? createElement(StrictMode, null, element) : element));
  await loaded;
  const gl = container.querySelector('canvas')!.getContext('webgl2')!;
  return {root, container, gl};
}

describe.each([
  ['DeckGL', DeckGL],
  ['legacy DeckGL', LegacyDeckGL]
] as [string, ComponentType<any>][])('%s', (_name, Component) => {
  test('releases its context when it unmounts', async () => {
    const {root, container, gl} = await renderDeckGL(Component);

    await act(() => root.unmount());
    container.remove();
    await nextTask();
    expect(gl.isContextLost()).toBe(true);
  });

  test('keeps its context through a StrictMode remount', async () => {
    const {root, container, gl} = await renderDeckGL(Component, {}, true);

    await nextTask();
    expect(gl.isContextLost(), 'StrictMode finalized one Deck, but the canvas stayed').toBe(false);

    await act(() => root.unmount());
    container.remove();
    await nextTask();
    expect(gl.isContextLost()).toBe(true);
  });

  test('never releases a device the app passed', async () => {
    const {root, container} = await renderDeckGL(Component, {device: testDevice});

    await act(() => root.unmount());
    container.remove();
    await nextTask();
    expect(testDevice.isLost).toBe(false);
  });
});
