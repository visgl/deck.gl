import {Deck, LightingEffect, log, MapView, PostProcessEffect} from '@deck.gl/core';
import {PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import * as fc from 'fast-check';
import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {createLayerComponent, createViewComponent} from '../../wrappers/factories';
import {createRoot, roots, unmountAtNode} from '../renderer';
import type {ReconcilerRoot, RootElement} from '../types';
import {createTestRoot} from './test-renderer';
import {TestWidget} from './test-widget';

/**
 * Creates a lightweight RootElement for testing renderer API
 * Use createTestRoot() when you need full deck.gl integration
 */
function createTestRootElement(): RootElement {
  return {} as RootElement;
}

function getRootElement(root: ReconcilerRoot): RootElement {
  const entry = [...roots.entries()].find(([, candidate]) => candidate === root);
  if (!entry) {
    throw new Error('Root element not found');
  }
  return entry[0];
}

describe('renderer', () => {
  afterEach(() => {
    // Clean up all roots after each test to prevent worker teardown issues
    const allRoots = [...roots.keys()];
    for (const node of allRoots) {
      try {
        unmountAtNode(node);
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  describe('createRoot()', () => {
    it('calling createRoot twice on same node returns same root', () => {
      // Arrange
      const node = createTestRootElement();

      // Act
      const root1 = createRoot(node);
      const root2 = createRoot(node);

      // Assert
      expect(root2).toBe(root1);
    });

    it('root reuse preserves store and container', () => {
      // Arrange
      const node = createTestRootElement();

      // Act
      const root1 = createRoot(node);
      const root2 = createRoot(node);

      // Assert
      expect(root2.store).toBe(root1.store);
      expect(root2.container).toBe(root1.container);
    });

    it('different nodes get different roots', () => {
      // Arrange
      const node1 = createTestRootElement();
      const node2 = createTestRootElement();

      // Act
      const root1 = createRoot(node1);
      const root2 = createRoot(node2);

      // Assert
      expect(root2).not.toBe(root1);
      expect(root2.container).not.toBe(root1.container);
    });

    it('different nodes get isolated stores', () => {
      const node1 = createTestRootElement();
      const node2 = createTestRootElement();

      const root1 = createRoot(node1);
      const root2 = createRoot(node2);

      root1.store.setState({_passedLayers: [new ScatterplotLayer({id: 'one', data: []})]});

      expect(root1.store).not.toBe(root2.store);
      expect(root2.store.getState()._passedLayers).toStrictEqual([]);
    });
  });

  describe('lifecycle traces', () => {
    it('traces root creation once and unmounting only when a root is torn down', () => {
      const traceSpy = vi.spyOn(log, 'log').mockReturnValue(() => {});
      const traced = (message: string) =>
        traceSpy.mock.calls.filter(([, text]) => text === message).length;

      try {
        const node = createTestRootElement();
        createRoot(node);
        createRoot(node);
        expect(traced('DeckGL root created')).toBe(1);

        unmountAtNode(createTestRootElement());
        expect(traced('DeckGL root unmounted')).toBe(0);

        unmountAtNode(node);
        expect(traced('DeckGL root unmounted')).toBe(1);
      } finally {
        traceSpy.mockRestore();
      }
    });

    it('traces the props of every configure, not only the first', () => {
      const traceSpy = vi.spyOn(log, 'log').mockReturnValue(() => {});

      try {
        const root = createRoot(createTestRootElement());
        const first = {layers: [new ScatterplotLayer({id: 'first', data: []})]};
        const second = {layers: [new ScatterplotLayer({id: 'second', data: []})]};
        root.configure(first);
        root.configure(second);

        const configures = traceSpy.mock.calls.filter(([, text]) => text === 'DeckGL configure');
        expect(configures).toStrictEqual([
          [4, 'DeckGL configure', first],
          [4, 'DeckGL configure', second]
        ]);
      } finally {
        traceSpy.mockRestore();
      }
    });
  });

  describe('configure', () => {
    it('should set _passedLayers when layers prop is provided', () => {
      // Arrange
      const {root} = createTestRoot();
      const passedLayers = [
        new ScatterplotLayer({data: [], id: 'passed-1'}),
        new ScatterplotLayer({data: [], id: 'passed-2'})
      ];

      // Act
      root.configure({
        layers: passedLayers
      });

      // Assert
      const state = root.store.getState();
      expect(state._passedLayers).toStrictEqual(passedLayers);
    });

    it('should not reconfigure when called multiple times', () => {
      // Arrange
      const {root} = createTestRoot();

      // Act
      root.configure({});
      const firstDeckGL = root.store.getState().deckgl;

      root.configure({});
      const secondDeckGL = root.store.getState().deckgl;

      // Assert
      expect(secondDeckGL).toBe(firstDeckGL);
    });

    it('should update _passedLayers even when already configured', () => {
      // Arrange
      const {root} = createTestRoot();
      const newLayers = [new ScatterplotLayer({data: [], id: 'new-layer'})];

      // Act
      root.configure({
        layers: newLayers
      });

      // Assert
      const state = root.store.getState();
      expect(state._passedLayers).toStrictEqual(newLayers);
    });

    it('should forward updated props after initial configuration', () => {
      const {root, deck} = createTestRoot();
      const layers = [new ScatterplotLayer({data: [], id: 'updated-layer'})];

      root.configure({layers});

      expect(deck.setProps).toHaveBeenCalledWith({layers, widgets: [], effects: []});
    });

    it('should forward replacement controlled view state and callback', () => {
      const {root, deck} = createTestRoot();
      const firstViewState = {latitude: 0, longitude: 0, zoom: 1};
      const secondViewState = {latitude: 10, longitude: 10, zoom: 2};
      const firstHandler = vi.fn();
      const secondHandler = vi.fn();

      root.configure({viewState: firstViewState, onViewStateChange: firstHandler});
      root.configure({viewState: secondViewState, onViewStateChange: secondHandler});

      expect(deck.setProps).toHaveBeenLastCalledWith({
        layers: [],
        viewState: secondViewState,
        widgets: [],
        effects: [],
        onViewStateChange: secondHandler
      });
    });

    it('should clear passed layers when the prop is removed', () => {
      const {root} = createTestRoot();
      const layers = [new ScatterplotLayer({data: [], id: 'stale-layer'})];

      root.configure({layers});
      root.configure({});

      expect(root.store.getState()._passedLayers).toStrictEqual([]);
    });

    it('creates a plain Deck root without inspecting interleaved', () => {
      const canvas = document.createElement('canvas');
      const root = createRoot(canvas);

      expect(() => root.configure({canvas, interleaved: true} as never)).not.toThrow();
      expect(root.store.getState().deckgl).toBeInstanceOf(Deck);
    });

    it('restores the default view when the views prop of the first configure is removed', () => {
      const overlay = {finalize: vi.fn(), setProps: vi.fn()};
      const root = createRoot(createTestRootElement(), {
        createExternalOverlay: () => overlay,
        forwardViews: true
      });

      root.configure({views: [new MapView({id: 'custom'})]});
      root.configure({});

      expect(overlay.setProps).toHaveBeenLastCalledWith({
        layers: [],
        views: null,
        widgets: [],
        effects: []
      });
    });

    it('creates a bound external overlay once and forwards later props', () => {
      const overlay = {finalize: vi.fn(), setProps: vi.fn()};
      const createExternalOverlay = vi.fn(() => overlay);
      const root = createRoot(createTestRootElement(), {createExternalOverlay});

      root.configure({interleaved: true});
      root.configure({interleaved: true, layers: []});

      expect(createExternalOverlay).toHaveBeenCalledExactlyOnceWith({interleaved: true});
      expect(root.isExternalOverlay).toBe(true);
      expect(root.store.getState().isExternalOverlay).toBe(true);
      expect(overlay.setProps).toHaveBeenCalledExactlyOnceWith({
        interleaved: true,
        layers: [],
        widgets: [],
        effects: []
      });
    });

    // Recreating the overlay for a construction-only prop is the component's job
    // (`createDeckGL({recreateOverlayOnChange})`); the root itself only forwards props.
    it.each([
      {initialProps: {}, name: 'omitted interleaved', updateProps: {interleaved: false}},
      {
        initialProps: {interleaved: false},
        name: 'interleaved false',
        updateProps: {interleaved: false}
      },
      {
        initialProps: {interleaved: true},
        name: 'interleaved true',
        updateProps: {interleaved: true}
      },
      {
        initialProps: {interleaved: false},
        name: 'interleaved false then true',
        updateProps: {interleaved: true}
      },
      {
        initialProps: {interleaved: true},
        name: 'interleaved true then false',
        updateProps: {interleaved: false}
      }
    ])('creates an external overlay once when $name', ({initialProps, updateProps}) => {
      const overlay = {finalize: vi.fn(), setProps: vi.fn()};
      const createExternalOverlay = vi.fn(() => overlay);
      const root = createRoot(createTestRootElement(), {createExternalOverlay});

      root.configure(initialProps);
      root.configure({...updateProps, layers: []});

      expect(createExternalOverlay).toHaveBeenCalledExactlyOnceWith(initialProps);
      expect(overlay.setProps).toHaveBeenCalledExactlyOnceWith({
        ...updateProps,
        layers: [],
        widgets: [],
        effects: []
      });
    });

    it('rejects reuse of a root with a different overlay factory', () => {
      const node = createTestRootElement();
      const firstFactory = vi.fn(() => ({finalize: vi.fn(), setProps: vi.fn()}));
      const secondFactory = vi.fn(() => ({finalize: vi.fn(), setProps: vi.fn()}));

      createRoot(node, {createExternalOverlay: firstFactory});

      expect(() => createRoot(node, {createExternalOverlay: secondFactory})).toThrow();
    });
  });

  describe('unmountAtNode()', () => {
    it('should finalize deckgl and remove root from map', () => {
      // Arrange
      const {root, deck} = createTestRoot();
      const rootElement = [...roots.keys()].find(k => roots.get(k) === root);
      if (!rootElement) {
        throw new Error('Root element not found');
      }

      expect(roots.has(rootElement)).toBeTruthy();

      // Act
      unmountAtNode(rootElement);

      // Assert
      expect(deck.finalize).toHaveBeenCalledOnce();
      expect(roots.has(rootElement)).toBeFalsy();
      expect(root.store.getState().deckgl).toBeNull();
    });

    it('does not finalize another root’s deckgl instance', () => {
      const first = createTestRoot();
      const second = createTestRoot();
      const firstNode = getRootElement(first.root);
      const secondNode = getRootElement(second.root);

      unmountAtNode(firstNode);

      expect(first.deck.finalize).toHaveBeenCalledOnce();
      expect(second.deck.finalize).not.toHaveBeenCalled();
      expect(roots.has(firstNode)).toBe(false);
      expect(roots.get(secondNode)).toBe(second.root);
      expect(second.root.store.getState().deckgl).toBe(second.deck);
    });

    it('should handle unmounting non-existent node gracefully', () => {
      // Arrange
      const node = createTestRootElement();

      // Act & Assert
      expect(() => unmountAtNode(node)).not.toThrow();
      expect(roots.has(node)).toBeFalsy();
    });
  });

  describe('render', () => {
    it('should update container with provided children', () => {
      // Arrange
      const {root} = createTestRoot();
      const children = React.createElement('div', null, 'test content');

      // Act & Assert
      expect(() => root.render(children)).not.toThrow();
    });

    it('keeps committed layers and cleanup isolated between two roots', async () => {
      const first = createTestRoot();
      const second = createTestRoot();
      const firstNode = getRootElement(first.root);
      const secondNode = getRootElement(second.root);
      const firstLayer = new ScatterplotLayer({data: [], id: 'first-layer'});
      const secondLayer = new ScatterplotLayer({data: [], id: 'second-layer'});

      await React.act(async () => {
        first.root.render(React.createElement('deckLayer', {layer: firstLayer}));
        second.root.render(React.createElement('deckLayer', {layer: secondLayer}));
        await Promise.all([first.flush(), second.flush()]);
      });

      expect(first.root).not.toBe(second.root);
      expect(first.root.store).not.toBe(second.root.store);
      expect(first.deck).not.toBe(second.deck);
      expect(first.deck.getLayerIds()).toStrictEqual(['first-layer']);
      expect(second.deck.getLayerIds()).toStrictEqual(['second-layer']);

      const updatedFirstLayer = new ScatterplotLayer({data: [], id: 'updated-first-layer'});
      await React.act(async () => {
        first.root.render(React.createElement('deckLayer', {layer: updatedFirstLayer}));
        await first.flush();
      });

      expect(first.deck.getLayerIds()).toStrictEqual(['updated-first-layer']);
      expect(second.deck.getLayerIds()).toStrictEqual(['second-layer']);

      unmountAtNode(firstNode);

      expect(first.deck.finalize).toHaveBeenCalledOnce();
      expect(first.root.store.getState().deckgl).toBeNull();
      expect(roots.has(firstNode)).toBe(false);
      expect(roots.get(secondNode)).toBe(second.root);
      expect(second.root.store.getState().deckgl).toBe(second.deck);
      expect(second.deck.getLayerIds()).toStrictEqual(['second-layer']);

      const additionalSecondLayer = new ScatterplotLayer({data: [], id: 'additional-second-layer'});
      await React.act(async () => {
        second.root.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('deckLayer', {layer: secondLayer}),
            React.createElement('deckLayer', {layer: additionalSecondLayer})
          )
        );
        await second.flush();
      });

      expect(second.deck.getLayerIds()).toStrictEqual(['second-layer', 'additional-second-layer']);

      unmountAtNode(secondNode);
      expect(second.deck.finalize).toHaveBeenCalledOnce();
    });

    it('renders a createLayerComponent component next to native layers', async () => {
      const {deck, flush, root} = createTestRoot();
      const JsxPolygonLayer = createLayerComponent(PolygonLayer);
      const nativePoints = new ScatterplotLayer({data: [], id: 'native-points'});

      await React.act(async () => {
        root.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('deckLayer', {layer: nativePoints}),
            React.createElement(JsxPolygonLayer, {data: [], id: 'jsx-polygons'})
          )
        );
        await flush();
      });

      expect(deck.getLayerIds()).toStrictEqual(['native-points', 'jsx-polygons']);
      expect(deck.layers[0]).toBe(nativePoints);
      expect(deck.layers[1]).toBeInstanceOf(PolygonLayer);
      expect(deck.layers[1]?.id).toBe('jsx-polygons');
    });

    it('keeps layers nested in a createViewComponent component', async () => {
      const {deck, root} = createTestRoot();
      const JsxMapView = createViewComponent(MapView);
      const JsxScatterplotLayer = createLayerComponent(ScatterplotLayer);

      await React.act(async () => {
        root.render(
          React.createElement(
            JsxMapView,
            {id: 'main'},
            React.createElement(JsxScatterplotLayer, {data: [], id: 'points'})
          )
        );
      });

      expect(deck.views.map(view => view.id)).toStrictEqual(['main']);
      expect(deck.getLayerIds()).toStrictEqual(['points']);
    });
  });

  describe('layer order', () => {
    function renderLayers(root: ReconcilerRoot, children: React.ReactNode) {
      return React.act(async () => {
        root.render(children);
      });
    }

    it('places JSX layers before layers passed through the prop', async () => {
      const {root, deck} = createTestRoot();
      const passed = new ScatterplotLayer({data: [], id: 'passed'});
      const jsx = new ScatterplotLayer({data: [], id: 'jsx'});

      root.configure({layers: [passed]});
      await renderLayers(root, React.createElement('deckLayer', {layer: jsx}));

      expect(deck.getLayerIds()).toStrictEqual(['jsx', 'passed']);
    });

    it('keeps JSX layers first when only the layers prop changes without a commit', async () => {
      const {root, deck} = createTestRoot();
      const jsx = new ScatterplotLayer({data: [], id: 'jsx'});
      // A stable element: rendering it again does not commit a new JSX tree.
      const children = React.createElement('deckLayer', {layer: jsx});

      root.configure({layers: [new ScatterplotLayer({data: [], id: 'first'})]});
      await renderLayers(root, children);
      const setPropsCalls = deck.setProps.mock.calls.length;

      root.configure({layers: [new ScatterplotLayer({data: [], id: 'second'})]});
      await renderLayers(root, children);

      expect(deck.setProps.mock.calls.length).toBe(setPropsCalls + 1);
      expect(deck.getLayerIds()).toStrictEqual(['jsx', 'second']);
    });

    it('keeps JSX layers when the layers prop is removed', async () => {
      const {root, deck} = createTestRoot();
      const children = React.createElement('deckLayer', {
        layer: new ScatterplotLayer({data: [], id: 'jsx'})
      });

      root.configure({layers: [new ScatterplotLayer({data: [], id: 'passed'})]});
      await renderLayers(root, children);
      root.configure({});
      await renderLayers(root, children);

      expect(deck.getLayerIds()).toStrictEqual(['jsx']);
    });
  });

  describe('views prop', () => {
    it('keeps the views prop when no JSX view is rendered', async () => {
      const {root, deck} = createTestRoot();
      const propView = new MapView({id: 'prop'});

      root.configure({views: [propView]});
      await React.act(async () => {
        root.render(
          React.createElement('deckLayer', {layer: new ScatterplotLayer({data: [], id: 'jsx'})})
        );
      });

      expect(deck.views).toStrictEqual([propView]);
    });

    it('merges a reconfigured views prop with committed JSX views without a commit', async () => {
      const {root, deck} = createTestRoot();
      const jsxView = new MapView({id: 'jsx'});
      const children = React.createElement('deckView', {view: jsxView});

      root.configure({});
      await React.act(async () => {
        root.render(children);
      });
      expect(deck.views).toStrictEqual([jsxView]);

      const propView = new MapView({id: 'prop'});
      root.configure({views: propView});

      expect(deck.views).toStrictEqual([jsxView, propView]);
    });
  });

  describe('widgets', () => {
    it('sends JSX widgets to deck.gl in tree order, from any depth', async () => {
      const {root, deck} = createTestRoot();
      const first = new TestWidget({id: 'first'});
      const second = new TestWidget({id: 'second'});
      function Controls() {
        return React.createElement('deckWidget', {widget: second});
      }

      await React.act(async () => {
        root.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('deckWidget', {widget: first}),
            React.createElement(
              'deckLayer',
              {layer: new ScatterplotLayer({data: [], id: 'points'})},
              React.createElement(Controls)
            )
          )
        );
      });

      expect(deck.widgets).toStrictEqual([first, second]);
      expect(deck.getLayerIds()).toStrictEqual(['points']);
    });

    it('merges the widgets prop with JSX widgets by id, the prop winning', async () => {
      const {root, deck} = createTestRoot();
      const jsxZoom = new TestWidget({id: 'zoom'});
      const jsxCompass = new TestWidget({id: 'compass'});
      const propZoom = new TestWidget({id: 'zoom'});
      const propFullscreen = new TestWidget({id: 'fullscreen'});

      root.configure({widgets: [propZoom, propFullscreen]});
      await React.act(async () => {
        root.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('deckWidget', {widget: jsxZoom}),
            React.createElement('deckWidget', {widget: jsxCompass})
          )
        );
      });

      expect(deck.widgets).toStrictEqual([propZoom, jsxCompass, propFullscreen]);
    });

    it('keeps committed JSX widgets when only the widgets prop changes', async () => {
      const {root, deck} = createTestRoot();
      const jsxWidget = new TestWidget({id: 'jsx'});

      root.configure({});
      await React.act(async () => {
        root.render(React.createElement('deckWidget', {widget: jsxWidget}));
      });

      const propWidget = new TestWidget({id: 'prop'});
      root.configure({widgets: [propWidget]});

      expect(deck.widgets).toStrictEqual([jsxWidget, propWidget]);
    });

    it('removes the last JSX widget from deck.gl', async () => {
      const {root, deck} = createTestRoot();

      await React.act(async () => {
        root.render(React.createElement('deckWidget', {widget: new TestWidget({id: 'zoom'})}));
      });
      expect(deck.widgets).toHaveLength(1);

      await React.act(async () => {
        root.render(null);
      });

      expect(deck.widgets).toStrictEqual([]);
    });
  });

  describe('effects', () => {
    function createPostProcessEffect(name: string) {
      return new PostProcessEffect({name, fs: '', passes: []} as never, {} as never);
    }

    it('sends JSX effects to deck.gl in tree order, from any depth', async () => {
      const {root, deck} = createTestRoot();
      const lighting = new LightingEffect();
      const blur = createPostProcessEffect('blur');
      function PostProcessing() {
        return React.createElement('deckEffect', {effect: blur});
      }

      await React.act(async () => {
        root.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('deckEffect', {effect: lighting}),
            React.createElement(
              'deckLayer',
              {layer: new ScatterplotLayer({data: [], id: 'points'})},
              React.createElement(PostProcessing)
            )
          )
        );
      });

      expect(deck.effects).toStrictEqual([lighting, blur]);
      expect(deck.getLayerIds()).toStrictEqual(['points']);
    });

    it('merges the effects prop with JSX effects by id, the prop winning', async () => {
      const {root, deck} = createTestRoot();
      const jsxLighting = new LightingEffect();
      const jsxBlur = createPostProcessEffect('blur');
      const propLighting = new LightingEffect();
      const propVignette = createPostProcessEffect('vignette');

      root.configure({effects: [propLighting, propVignette]});
      await React.act(async () => {
        root.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('deckEffect', {effect: jsxLighting}),
            React.createElement('deckEffect', {effect: jsxBlur})
          )
        );
      });

      expect(deck.effects).toStrictEqual([propLighting, jsxBlur, propVignette]);
    });

    it('keeps committed JSX effects when only the effects prop changes', async () => {
      const {root, deck} = createTestRoot();
      const jsxEffect = new LightingEffect();

      root.configure({});
      await React.act(async () => {
        root.render(React.createElement('deckEffect', {effect: jsxEffect}));
      });

      const propEffect = createPostProcessEffect('blur');
      root.configure({effects: [propEffect]});

      expect(deck.effects).toStrictEqual([jsxEffect, propEffect]);
    });

    it('removes the last JSX effect, and replaces an undefined effects prop with []', async () => {
      const {root, deck} = createTestRoot();

      await React.act(async () => {
        root.render(React.createElement('deckEffect', {effect: new LightingEffect()}));
      });
      expect(deck.effects).toHaveLength(1);

      await React.act(async () => {
        root.render(null);
      });
      expect(deck.effects).toStrictEqual([]);

      // deck.gl throws on `effects: undefined`, so the root always sends a list.
      root.configure({effects: undefined});
      expect(deck.setProps).toHaveBeenLastCalledWith(expect.objectContaining({effects: []}));
    });
  });

  describe('property: createRoot idempotency', () => {
    it('property: returns same root for same node regardless of call count', () => {
      fc.assert(
        fc.property(fc.integer({max: 10, min: 2}), callCount => {
          // Arrange
          const node = createTestRootElement();

          // Act
          const allRoots = Array.from({length: callCount}, () => createRoot(node));

          // Assert
          const [firstRoot] = allRoots;
          if (firstRoot === undefined) {
            throw new Error('Expected at least one root');
          }
          return (
            allRoots.every(root => root === firstRoot) &&
            allRoots.every(root => root.store === firstRoot.store) &&
            allRoots.every(root => root.container === firstRoot.container)
          );
        })
      );
    });
  });

  describe('edge cases', () => {
    it('should handle render before configure gracefully', () => {
      // Arrange
      const node = createTestRootElement();
      const root = createRoot(node);
      const children = React.createElement('div', null, 'test');

      // Act & Assert
      expect(() => root.render(children)).not.toThrow();
    });

    it('should complete cleanup even when finalize throws', () => {
      // Arrange
      const {root, deck} = createTestRoot();
      const rootElement = [...roots.keys()].find(k => roots.get(k) === root);
      if (!rootElement) {
        throw new Error('Root element not found');
      }

      // Make finalize throw
      deck.finalize.mockImplementation(() => {
        throw new Error('Finalize failed');
      });

      // Suppress console errors during this test to avoid worker teardown issues
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Act & Assert
        // Error propagates to caller
        expect(() => unmountAtNode(rootElement)).toThrow('Finalize failed');

        // But cleanup still completes (try-finally ensures this)
        // Root IS removed even when finalize throws
        expect(roots.has(rootElement)).toBeFalsy();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });
});
