// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView} from '@deck.gl/core';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {createRoot, unmountAtNode} from '@deck.gl/react/reconciler/renderer';
import type {DeckGLConfiguration, RootElement} from '@deck.gl/react/reconciler/types';
import {createTestRoot} from './test-renderer';

/**
 * In React, removing a prop is a change: the component renders without it. deck.gl's
 * `setProps` merges into the props it already has, so a prop that is simply left out keeps its
 * old value. The root must send each removed prop back to its deck.gl default.
 */
describe('removing a prop', () => {
  let unmount: (() => void) | undefined;

  afterEach(() => {
    unmount?.();
    unmount = undefined;
  });

  function setup(initial: DeckGLConfiguration) {
    const test = createTestRoot();
    unmount = test.unmount;
    // `createTestRoot` configures once; the second configure applies `initial` with setProps.
    test.root.configure(initial);
    test.deck.setProps.mockClear();
    return test;
  }

  function lastSetProps(deck: {setProps: ReturnType<typeof vi.fn>}): Record<string, unknown> {
    const {calls} = deck.setProps.mock;
    return calls[calls.length - 1]![0] as Record<string, unknown>;
  }

  it('sends deck.gl default onError when onError is removed', () => {
    const onError = vi.fn();
    const {deck, root} = setup({onError});

    root.configure({});

    const props = lastSetProps(deck);
    expect(Object.hasOwn(props, 'onError')).toBe(true);
    expect(props.onError).toBe(Deck.defaultProps.onError);
  });

  it('sends deck.gl default parameters when parameters are removed', () => {
    const {deck, root} = setup({parameters: {blend: true, blendColorSrcFactor: 'src-alpha'}});

    root.configure({});

    expect(lastSetProps(deck).parameters).toStrictEqual(Deck.defaultProps.parameters);
  });

  it('sends a null viewState when a controlled viewState is removed', () => {
    const {deck, root} = setup({viewState: {latitude: 1, longitude: 2, zoom: 3}});

    root.configure({});

    const props = lastSetProps(deck);
    expect(Object.hasOwn(props, 'viewState')).toBe(true);
    expect(props.viewState).toBeNull();
  });

  it('sends the default for any removed Deck prop, such as an event callback', () => {
    const {deck, root} = setup({onClick: vi.fn()});

    root.configure({});

    const props = lastSetProps(deck);
    expect(Object.hasOwn(props, 'onClick')).toBe(true);
    expect(props.onClick).toBe(Deck.defaultProps.onClick);
  });

  it('sends undefined for a removed prop that deck.gl has no default for', () => {
    const {deck, root} = setup({customOverlayOption: 1} as DeckGLConfiguration);

    root.configure({});

    const props = lastSetProps(deck);
    expect(Object.hasOwn(props, 'customOverlayOption')).toBe(true);
    expect(props.customOverlayOption).toBeUndefined();
  });

  it('leaves props that are still passed alone', () => {
    const onError = vi.fn();
    const {deck, root} = setup({onError, pickingRadius: 5});

    root.configure({onError});

    const props = lastSetProps(deck);
    expect(props.onError).toBe(onError);
    expect(props.pickingRadius).toBe(Deck.defaultProps.pickingRadius);
  });

  it('resets a removed prop once, not on every later configure', () => {
    const {deck, root} = setup({pickingRadius: 5});

    root.configure({});
    root.configure({});

    expect(Object.hasOwn(lastSetProps(deck), 'pickingRadius')).toBe(false);
  });

  // deck.gl falls back to the default for a prop passed as `undefined` (#10906), so the
  // root sends it as is. The browser tests check the result on a real Deck.
  it('sends a prop set to undefined to deck.gl as undefined', () => {
    const onLoad = vi.fn();
    const {deck, root} = setup({onLoad});

    root.configure({onLoad: undefined});

    const props = lastSetProps(deck);
    expect(Object.hasOwn(props, 'onLoad')).toBe(true);
    expect(props.onLoad).toBeUndefined();
  });

  it('passes an undefined prop through to the props that create the instance', () => {
    const createExternalOverlay = vi.fn(() => ({finalize: vi.fn(), setProps: vi.fn()}));
    const node = document.createElement('div');
    const root = createRoot(node, {createExternalOverlay: createExternalOverlay as never});
    unmount = () => unmountAtNode(node);

    root.configure({onLoad: undefined, pickingRadius: 2});

    const created = createExternalOverlay.mock.calls[0]![0] as Record<string, unknown>;
    expect(Object.hasOwn(created, 'onLoad')).toBe(true);
    expect(created.onLoad).toBeUndefined();
    expect(created.pickingRadius).toBe(2);
  });

  it('does not send views={undefined} when the root has never sent views', () => {
    // deck.gl would reset an explicit `undefined` to its default and clear views that a widget,
    // such as SplitterWidget, set.
    const {deck, root} = setup({pickingRadius: 1});

    root.configure({views: undefined});

    expect(Object.hasOwn(lastSetProps(deck), 'views')).toBe(false);
  });

  it('does not reset props that only take effect when deck.gl is created', () => {
    const {deck, root} = setup({
      deviceProps: {type: 'webgl'},
      eventRecognizerOptions: {},
      touchAction: 'pan-y'
    });

    root.configure({});

    const props = lastSetProps(deck);
    for (const key of ['canvas', 'deviceProps', 'eventRecognizerOptions', 'touchAction']) {
      expect(Object.hasOwn(props, key)).toBe(false);
    }
  });

  it('keeps device and _canvases, whose defaults a live Deck cannot take', () => {
    // `Deck.setProps` ignores a `null` device and asserts that `_canvases` never changes between
    // single- and multi-canvas mode.
    const device = {id: 'device'};
    const {deck, root} = setup({_canvases: [], device: device as never});

    root.configure({});

    const props = lastSetProps(deck);
    expect(Object.hasOwn(props, 'device')).toBe(false);
    expect(Object.hasOwn(props, '_canvases')).toBe(false);
  });

  it('keeps device and _canvases passed as undefined, as when they are removed', () => {
    const device = {id: 'device'};
    const {deck, root} = setup({_canvases: [], device: device as never});

    root.configure({_canvases: undefined, device: undefined});

    const props = lastSetProps(deck);
    expect(Object.hasOwn(props, 'device')).toBe(false);
    expect(Object.hasOwn(props, '_canvases')).toBe(false);
  });

  it('does not reset the layers, views, widgets or effects props, which the root merges with JSX', () => {
    const {deck, root} = setup({effects: [], layers: [], widgets: []});

    root.configure({});

    const props = lastSetProps(deck);
    expect(props.layers).toStrictEqual([]);
    expect(props.widgets).toStrictEqual([]);
    expect(props.effects).toStrictEqual([]);
  });
});

/**
 * Removing the `views` prop when the tree has no JSX views sends `null` once, which restores
 * deck.gl's default view. Later updates leave deck.gl's views alone, so a widget such as
 * `SplitterWidget` can set them, and a root that never had views never sends any.
 */
describe('removing the views prop with no JSX views', () => {
  const nodes: RootElement[] = [];

  afterEach(() => {
    for (const node of nodes.splice(0)) {
      unmountAtNode(node);
    }
  });

  function setup(forwardViews: boolean, initial: DeckGLConfiguration) {
    const node = document.createElement('div') as RootElement;
    nodes.push(node);
    const deck = {finalize: vi.fn(), setProps: vi.fn()};
    const root = createRoot(node, {createExternalOverlay: () => deck as never, forwardViews});
    root.configure(initial);
    return {deck, root};
  }

  function sentViews(deck: {setProps: ReturnType<typeof vi.fn>}): unknown[] {
    return deck.setProps.mock.calls
      .map(([props]) => props as Record<string, unknown>)
      .filter(props => Object.hasOwn(props, 'views'))
      .map(props => props.views);
  }

  for (const forwardViews of [true, false]) {
    describe(
      forwardViews ? 'a root that forwards JSX views' : 'an overlay that keeps only its views prop',
      () => {
        it('sends null once when the views prop is removed', () => {
          const view = new MapView({id: 'map'});
          const {deck, root} = setup(forwardViews, {views: [view]});

          root.configure({views: [view]});
          root.configure({});
          root.configure({});

          expect(sentViews(deck)).toEqual([[view], null]);
        });

        it('sends null when the views prop is set to undefined', () => {
          const {deck, root} = setup(forwardViews, {views: new MapView({id: 'map'})});

          root.configure({views: undefined});

          expect(sentViews(deck)).toEqual([null]);
        });

        it('sends empty layers, widgets and effects when those props are removed', () => {
          const {deck, root} = setup(forwardViews, {
            effects: [{id: 'effect'} as never],
            layers: [{id: 'layer'} as never],
            widgets: [{id: 'widget'} as never]
          });

          root.configure({});

          const props = deck.setProps.mock.calls.at(-1)![0] as Record<string, unknown>;
          expect(props.layers).toEqual([]);
          expect(props.widgets).toEqual([]);
          expect(props.effects).toEqual([]);
        });

        it('never sends views when the root has never had any', () => {
          const {deck, root} = setup(forwardViews, {});

          root.configure({pickingRadius: 2});
          root.configure({});

          expect(sentViews(deck)).toEqual([]);
        });
      }
    );
  }
});
