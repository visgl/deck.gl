// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log} from '@deck.gl/core';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createRoot, unmountAtNode} from '@deck.gl/react/reconciler/renderer';
import type {DeckGLConfiguration, RootElement} from '@deck.gl/react/reconciler/types';

const DOCS_ANCHOR = 'api-reference/react/deckgl#props-that-only-apply-at-creation';

describe('creation-only props', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  const nodes: RootElement[] = [];

  beforeEach(() => {
    warn = vi.spyOn(log, 'warn').mockReturnValue(() => {});
  });

  afterEach(() => {
    for (const node of nodes.splice(0)) {
      unmountAtNode(node);
    }
    warn.mockRestore();
    vi.unstubAllEnvs();
  });

  /** Creates a root whose instance is created from `initial`, as `DeckGL` does on mount. */
  function setup(initial: DeckGLConfiguration) {
    const node = document.createElement('div') as RootElement;
    nodes.push(node);
    const deck = {finalize: vi.fn(), setProps: vi.fn()};
    const root = createRoot(node, {createExternalOverlay: () => deck as never});
    root.configure(initial);
    return {deck, root};
  }

  function warnings(): string[] {
    return warn.mock.calls.map(([message]) => String(message));
  }

  it('does not warn when the instance is created', () => {
    setup({touchAction: 'pan-y'});

    expect(warnings()).toEqual([]);
  });

  it('warns once, naming the prop and linking the docs, when a creation-only prop changes', () => {
    const {root} = setup({touchAction: 'pan-y'});

    root.configure({touchAction: 'none'});
    root.configure({touchAction: 'pan-x'});

    expect(warnings()).toHaveLength(1);
    expect(warnings()[0]).toContain('`touchAction`');
    expect(warnings()[0]).toContain(DOCS_ANCHOR);
  });

  it('warns separately for each creation-only prop', () => {
    const {root} = setup({deviceProps: {type: 'webgl'}, touchAction: 'pan-y'});

    root.configure({deviceProps: {type: 'webgpu'}, touchAction: 'none'});

    expect(warnings()).toHaveLength(2);
    expect(warnings().some(message => message.includes('`deviceProps`'))).toBe(true);
    expect(warnings().some(message => message.includes('`touchAction`'))).toBe(true);
  });

  it('warns when `gl` changes to another context', () => {
    // A WebGL context keeps its state behind getters on the prototype, so it has no own
    // enumerable keys, and a deep compare would see any two contexts as equal.
    const contextPrototype = {getParameter: () => null};
    const firstContext = Object.create(contextPrototype) as WebGL2RenderingContext;
    const secondContext = Object.create(contextPrototype) as WebGL2RenderingContext;
    const {root} = setup({gl: firstContext});

    root.configure({gl: firstContext});
    expect(warnings()).toEqual([]);

    root.configure({gl: secondContext});
    expect(warnings()).toHaveLength(1);
    expect(warnings()[0]).toContain('`gl`');
  });

  it('warns when a creation-only prop is removed, because the removal has no effect either', () => {
    const {deck, root} = setup({eventRecognizerOptions: {pan: {threshold: 20}}});

    root.configure({});

    expect(warnings()).toHaveLength(1);
    expect(warnings()[0]).toContain('`eventRecognizerOptions`');
    // A removed creation-only prop is not reset either.
    const sent = deck.setProps.mock.calls.at(-1)![0] as Record<string, unknown>;
    expect(Object.hasOwn(sent, 'eventRecognizerOptions')).toBe(false);
  });

  it('does not warn for a new object with the same contents', () => {
    const {root} = setup({deviceProps: {type: 'webgl'}});

    root.configure({deviceProps: {type: 'webgl'}});

    expect(warnings()).toEqual([]);
  });

  it('does not warn for props that update after creation', () => {
    const {root} = setup({
      _canvases: ['a'],
      device: {id: 'first'} as never,
      pickingRadius: 1,
      useDevicePixels: true
    });

    // deck.gl replaces the device and updates the canvases of a multi-canvas Deck in setProps.
    root.configure({
      _canvases: ['a', 'b'],
      device: {id: 'second'} as never,
      pickingRadius: 5,
      useDevicePixels: false
    });

    expect(warnings()).toEqual([]);
  });

  it('warns once per root, so a second root warns again', () => {
    const first = setup({touchAction: 'pan-y'});
    const second = setup({touchAction: 'pan-y'});

    first.root.configure({touchAction: 'none'});
    second.root.configure({touchAction: 'none'});

    expect(warnings()).toHaveLength(2);
  });

  it('is silent in production builds', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const {root} = setup({touchAction: 'pan-y'});

    root.configure({touchAction: 'none'});

    expect(warnings()).toEqual([]);
  });
});
