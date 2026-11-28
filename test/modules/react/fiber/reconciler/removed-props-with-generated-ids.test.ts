// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';
import {Deck, log} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {afterEach, expect, it, vi} from 'vitest';

import {createTestRoot} from './test-renderer';

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

it('a removed callback, generated sibling ids and a creation-only warning in one root', async () => {
  const warn = vi.spyOn(log, 'warn').mockReturnValue(() => {});
  const {root, deck, unmount} = createTestRoot();
  cleanup = () => {
    React.act(() => unmount());
    warn.mockRestore();
  };
  const onError = vi.fn();
  const renderLayers = (keys: string[]) =>
    keys.map(key =>
      React.createElement('deckLayer', {key, layer: new ScatterplotLayer({data: []})})
    );

  root.configure({onError, touchAction: 'pan-y'});
  await React.act(async () => {
    root.render(renderLayers(['a', 'b']));
  });
  expect(deck.getLayerIds()).toEqual(['ScatterplotLayer/a', 'ScatterplotLayer/b']);
  expect(
    deck.setProps.mock.calls.some(([props]) => (props as {onError?: unknown}).onError === onError)
  ).toBe(true);

  // Remove onError and change a creation-only prop in one prop-only update.
  deck.setProps.mockClear();
  root.configure({touchAction: 'none'});
  const sent = deck.setProps.mock.calls.at(-1)![0] as Record<string, unknown>;
  expect(sent.onError).toBe(Deck.defaultProps.onError);
  expect(deck.getLayerIds()).toEqual(['ScatterplotLayer/a', 'ScatterplotLayer/b']);
  const messages = warn.mock.calls.map(([message]) => String(message));
  expect(messages.filter(m => m.includes('`touchAction`'))).toHaveLength(1);

  // A later commit keeps the generated ids and doesn't bring the removed callback back.
  await React.act(async () => {
    root.render(renderLayers(['b', 'a', 'c']));
  });
  expect(deck.getLayerIds()).toEqual([
    'ScatterplotLayer/b',
    'ScatterplotLayer/a',
    'ScatterplotLayer/c'
  ]);
  expect(
    deck.setProps.mock.calls.some(([props]) => (props as {onError?: unknown}).onError === onError)
  ).toBe(false);
});
