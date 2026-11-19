import {LightingEffect, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
  appendChildToContainerChildSet,
  appendChildToSet,
  appendInitialChild,
  createContainerChildSet,
  finalizeContainerChildren,
  finalizeInitialChildren,
  replaceContainerChildren
} from '../config';
import type {ChildSet, Container, Instance} from '../types';
import {flattenTree, organizeList} from '../utils';
import {TestWidget} from './test-widget';
import {createMockInstance} from './test-utils';

describe('config-tree-operations', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    }
    vi.restoreAllMocks();
  });

  describe('createContainerChildSet()', () => {
    it('should return empty array', () => {
      // Act
      const result = createContainerChildSet();

      // Assert
      expect(result).toStrictEqual([]);
      expect(Array.isArray(result)).toBeTruthy();
    });
  });

  describe('appendChildToContainerChildSet()', () => {
    it('should mutate childSet by pushing child', () => {
      // Arrange
      const childSet: ChildSet = [];
      const layer = new ScatterplotLayer({data: [], id: 'child'});
      const child = createMockInstance(layer);

      // Act
      appendChildToContainerChildSet(childSet, child);

      // Assert
      expect(childSet).toHaveLength(1);
      expect(childSet[0]).toBe(child);
    });

    it('should handle multiple appends', () => {
      // Arrange
      const childSet: ChildSet = [];
      const layer1 = new ScatterplotLayer({data: [], id: 'child1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'child2'});
      const child1 = createMockInstance(layer1);
      const child2 = createMockInstance(layer2);

      // Act
      appendChildToContainerChildSet(childSet, child1);
      appendChildToContainerChildSet(childSet, child2);

      // Assert
      expect(childSet).toHaveLength(2);
      expect(childSet[0]).toBe(child1);
      expect(childSet[1]).toBe(child2);
    });
  });

  describe('appendChildToSet()', () => {
    it('should return new array (immutable)', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'existing'});
      const layer2 = new ScatterplotLayer({data: [], id: 'new'});
      const existingChild = createMockInstance(layer1);
      const newChild = createMockInstance(layer2);
      const childSet: ChildSet = [existingChild];

      // Act
      const result = appendChildToSet(childSet, newChild);

      // Assert
      expect(result).not.toBe(childSet);
      expect(result).toStrictEqual([existingChild, newChild]);
    });

    it('should not modify original array', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'existing'});
      const layer2 = new ScatterplotLayer({data: [], id: 'new'});
      const existingChild = createMockInstance(layer1);
      const newChild = createMockInstance(layer2);
      const childSet: ChildSet = [existingChild];

      // Act
      appendChildToSet(childSet, newChild);

      // Assert
      expect(childSet).toHaveLength(1);
      expect(childSet[0]).toBe(existingChild);
    });

    it('should contain all old items plus new child', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'child1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'child2'});
      const layer3 = new ScatterplotLayer({data: [], id: 'child3'});
      const child1 = createMockInstance(layer1);
      const child2 = createMockInstance(layer2);
      const child3 = createMockInstance(layer3);
      const childSet: ChildSet = [child1, child2];

      // Act
      const result = appendChildToSet(childSet, child3);

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toStrictEqual([child1, child2, child3]);
    });
  });

  describe('appendInitialChild()', () => {
    it('should push child to parent.children array', () => {
      // Arrange
      const parentLayer = new ScatterplotLayer({data: [], id: 'parent'});
      const childLayer = new ScatterplotLayer({data: [], id: 'child'});
      const parent = createMockInstance(parentLayer);
      const child = createMockInstance(childLayer);

      // Act
      appendInitialChild(parent, child);

      // Assert
      expect(parent.children).toHaveLength(1);
      expect(parent.children[0]).toBe(child);
    });

    it('should mutate parent instance', () => {
      // Arrange
      const parentLayer = new ScatterplotLayer({data: [], id: 'parent'});
      const childLayer = new ScatterplotLayer({data: [], id: 'child'});
      const parent = createMockInstance(parentLayer);
      const child = createMockInstance(childLayer);
      const originalChildren = parent.children;

      // Act
      appendInitialChild(parent, child);

      // Assert
      expect(parent.children).toBe(originalChildren);
    });
  });

  describe('finalizeInitialChildren()', () => {
    it('should return false (no commitMount needed)', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const instance = createMockInstance(layer);

      // Act
      const result = finalizeInitialChildren(
        instance,
        'deckLayer',
        {layer},
        {} as never,
        {} as never
      );

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe('finalizeContainerChildren()', () => {
    it('leaves duplicate layer ids to deck.gl', () => {
      // deck.gl's LayerManager warns about duplicate ids, so the reconciler does not.
      expect(() => finalizeContainerChildren()).not.toThrow();
    });
  });

  describe('replaceContainerChildren()', () => {
    it('should flatten tree and call deckgl.setProps', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'layer1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'layer2'});
      const child1 = createMockInstance(layer1);
      const child2 = createMockInstance(layer2);
      const newChildren: ChildSet = [child1, child2];

      const mockDeckGL = {
        setProps: vi.fn<(props: {layers: unknown[]; views?: unknown[]}) => void>()
      };

      const container = {
        store: {
          getState: vi.fn<
            () => {
              _passedLayers: unknown[];
              deckgl: {setProps: (props: {layers: unknown[]; views?: unknown[]}) => void};
            }
          >(() => ({
            _passedLayers: [],
            deckgl: mockDeckGL
          }))
        }
      } as unknown as Container;

      // Act
      replaceContainerChildren(container, newChildren);

      // Assert
      expect(mockDeckGL.setProps).toHaveBeenCalledExactlyOnceWith({
        layers: [layer1, layer2],
        widgets: [],
        effects: []
      });
    });

    it('omits JSX views for an external overlay root that does not forward views', () => {
      const layer = new ScatterplotLayer({data: [], id: 'layer'});
      const view = new MapView({id: 'view'});
      const mockDeckGL = {
        setProps: vi.fn<(props: {layers: unknown[]; views?: unknown[]}) => void>()
      };
      const container = {
        store: {
          getState: vi.fn(() => ({
            _passedLayers: [],
            deckgl: mockDeckGL,
            isExternalOverlay: true
          }))
        }
      } as unknown as Container;

      replaceContainerChildren(container, [createMockInstance(view), createMockInstance(layer)]);
      replaceContainerChildren(container, [createMockInstance(layer)]);

      expect(mockDeckGL.setProps).toHaveBeenNthCalledWith(1, {
        layers: [layer],
        widgets: [],
        effects: []
      });
      expect(mockDeckGL.setProps).toHaveBeenNthCalledWith(2, {
        layers: [layer],
        widgets: [],
        effects: []
      });
    });

    it('should place _passedLayers after JSX layers, as @deck.gl/react does', () => {
      // Arrange
      const passedLayer = new ScatterplotLayer({data: [], id: 'passed'});
      const jsxLayer = new ScatterplotLayer({data: [], id: 'jsx'});
      const child = createMockInstance(jsxLayer);
      const newChildren: ChildSet = [child];

      const mockDeckGL = {
        setProps: vi.fn<(props: {layers: unknown[]; views?: unknown[]}) => void>()
      };

      const container = {
        store: {
          getState: vi.fn<
            () => {
              _passedLayers: unknown[];
              deckgl: {setProps: (props: {layers: unknown[]; views?: unknown[]}) => void};
            }
          >(() => ({
            _passedLayers: [passedLayer],
            deckgl: mockDeckGL
          }))
        }
      } as unknown as Container;

      // Act
      replaceContainerChildren(container, newChildren);

      // Assert
      expect(mockDeckGL.setProps).toHaveBeenCalledWith({
        layers: [jsxLayer, passedLayer],
        widgets: [],
        effects: []
      });
    });

    it('should include views in setProps when present', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'layer'});
      const view = new MapView({id: 'view'});
      const layerChild = createMockInstance(layer);
      const viewChild = createMockInstance(view);
      const newChildren: ChildSet = [viewChild, layerChild];

      const mockDeckGL = {
        setProps: vi.fn<(props: {layers: unknown[]; views?: unknown[]}) => void>()
      };

      const container = {
        store: {
          getState: vi.fn<
            () => {
              _passedLayers: unknown[];
              deckgl: {setProps: (props: {layers: unknown[]; views?: unknown[]}) => void};
            }
          >(() => ({
            _passedLayers: [],
            deckgl: mockDeckGL
          }))
        }
      } as unknown as Container;

      // Act
      replaceContainerChildren(container, newChildren);

      // Assert
      expect(mockDeckGL.setProps).toHaveBeenCalledWith({
        layers: [layer],
        views: [view],
        widgets: [],
        effects: []
      });
    });

    // `null` restores deck.gl's default view; an empty list would leave it with no view.
    it("leaves deck.gl's views alone without JSX views or a views prop", () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'layer'});
      const child = createMockInstance(layer);
      const newChildren: ChildSet = [child];

      const mockDeckGL = {
        setProps: vi.fn<(props: {layers: unknown[]; views?: unknown[]}) => void>()
      };

      const container = {
        store: {
          getState: vi.fn<
            () => {
              _passedLayers: unknown[];
              deckgl: {setProps: (props: {layers: unknown[]; views?: unknown[]}) => void};
            }
          >(() => ({
            _passedLayers: [],
            deckgl: mockDeckGL
          }))
        }
      } as unknown as Container;

      // Act
      replaceContainerChildren(container, newChildren);

      // Assert
      // A widget such as SplitterWidget may have set deck.gl's views, as in @deck.gl/react.
      expect(mockDeckGL.setProps).toHaveBeenCalledExactlyOnceWith({
        layers: [layer],
        widgets: [],
        effects: []
      });
    });

    describe('views prop', () => {
      function createViewsContainer(
        passedViews: unknown,
        isExternalOverlay = false,
        forwardViews = false
      ) {
        const deckgl = {setProps: vi.fn<(props: {layers: unknown[]; views?: unknown}) => void>()};
        const container = {
          store: {
            getState: vi.fn(() => ({
              _passedLayers: [],
              _passedViews: passedViews,
              deckgl,
              forwardViews,
              isExternalOverlay
            }))
          }
        } as unknown as Container;
        return {container, deckgl};
      }

      it('uses the views prop unchanged without JSX views', () => {
        const propView = new MapView({id: 'prop'});
        const {container, deckgl} = createViewsContainer(propView);

        replaceContainerChildren(container, []);

        expect(deckgl.setProps).toHaveBeenCalledExactlyOnceWith({
          layers: [],
          views: propView,
          widgets: [],
          effects: []
        });
      });

      it('falls back to the views prop when the last JSX view is removed', () => {
        const propViews = [new MapView({id: 'prop'})];
        const {container, deckgl} = createViewsContainer(propViews);

        replaceContainerChildren(container, [createMockInstance(new MapView({id: 'jsx'}))]);
        replaceContainerChildren(container, []);

        expect(deckgl.setProps).toHaveBeenLastCalledWith({
          layers: [],
          views: propViews,
          widgets: [],
          effects: []
        });
      });

      it('merges JSX views with the views prop, which wins on an id clash', () => {
        const jsxMain = new MapView({id: 'main'});
        const jsxMinimap = new MapView({id: 'minimap'});
        const propMain = new MapView({id: 'main', controller: true});
        const propExtra = new MapView({id: 'extra'});
        const {container, deckgl} = createViewsContainer([propMain, propExtra]);

        replaceContainerChildren(container, [
          createMockInstance(jsxMain),
          createMockInstance(jsxMinimap)
        ]);

        expect(deckgl.setProps).toHaveBeenCalledExactlyOnceWith({
          layers: [],
          views: [propMain, jsxMinimap, propExtra],
          widgets: [],
          effects: []
        });
      });

      it('merges a single View passed as the views prop', () => {
        const jsxView = new MapView({id: 'jsx'});
        const propView = new MapView({id: 'prop'});
        const {container, deckgl} = createViewsContainer(propView);

        replaceContainerChildren(container, [createMockInstance(jsxView)]);

        expect(deckgl.setProps).toHaveBeenCalledExactlyOnceWith({
          layers: [],
          views: [jsxView, propView],
          widgets: [],
          effects: []
        });
      });

      it('omits views for an external overlay root that does not forward views', () => {
        const {container, deckgl} = createViewsContainer(new MapView({id: 'prop'}), true);

        replaceContainerChildren(container, [createMockInstance(new MapView({id: 'jsx'}))]);

        expect(deckgl.setProps).toHaveBeenCalledExactlyOnceWith({
          layers: [],
          widgets: [],
          effects: []
        });
      });

      it('merges and sends views for an external overlay root that forwards them', () => {
        // The Mapbox and MapLibre roots forward views; the overlay adds its map view when the
        // list has no view with the reserved id.
        const mapView = new MapView({id: 'mapbox'});
        const minimap = new MapView({id: 'minimap'});
        const propExtra = new MapView({id: 'extra'});
        const {container, deckgl} = createViewsContainer(propExtra, true, true);

        replaceContainerChildren(container, [
          createMockInstance(mapView),
          createMockInstance(minimap)
        ]);
        replaceContainerChildren(container, []);

        expect(deckgl.setProps).toHaveBeenNthCalledWith(1, {
          layers: [],
          views: [mapView, minimap, propExtra],
          widgets: [],
          effects: []
        });
        // Without JSX views, the views prop is used unchanged.
        expect(deckgl.setProps).toHaveBeenNthCalledWith(2, {
          layers: [],
          views: propExtra,
          widgets: [],
          effects: []
        });
      });

      it('sends null once after the last JSX view is removed, then leaves views alone', () => {
        const {container, deckgl} = createViewsContainer(undefined);

        replaceContainerChildren(container, [createMockInstance(new MapView({id: 'minimap'}))]);
        replaceContainerChildren(container, []);
        // null restores deck.gl's default view.
        expect(deckgl.setProps).toHaveBeenLastCalledWith({
          layers: [],
          views: null,
          widgets: [],
          effects: []
        });

        replaceContainerChildren(container, []);
        expect(deckgl.setProps).toHaveBeenLastCalledWith({layers: [], widgets: [], effects: []});
      });

      it('sends null to a view-forwarding overlay after its last JSX view is removed', () => {
        const {container, deckgl} = createViewsContainer(undefined, true, true);

        replaceContainerChildren(container, [createMockInstance(new MapView({id: 'minimap'}))]);
        replaceContainerChildren(container, []);

        // null makes the overlay fall back to its own map view.
        expect(deckgl.setProps).toHaveBeenLastCalledWith({
          layers: [],
          views: null,
          widgets: [],
          effects: []
        });
      });
    });

    it('should no-op if deckgl is undefined (already cleaned up)', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'layer'});
      const child = createMockInstance(layer);
      const newChildren: ChildSet = [child];

      const container = {
        store: {
          getState: vi.fn<() => {_passedLayers: unknown[]; deckgl: undefined}>(() => ({
            _passedLayers: [],
            deckgl: undefined
          }))
        }
      } as unknown as Container;

      // Act & Assert
      expect(() => replaceContainerChildren(container, newChildren)).not.toThrow();
    });
  });

  describe('organizeList()', () => {
    it('should separate views and layers correctly', () => {
      // Arrange
      const view = new MapView({id: 'view-1'});
      const layer1 = new ScatterplotLayer({data: [], id: 'layer-1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'layer-2'});
      const mixedList = [view, layer1, layer2];

      // Act
      const result = organizeList(mixedList);

      // Assert
      expect(result.views).toStrictEqual([view]);
      expect(result.layers).toStrictEqual([layer1, layer2]);
    });

    it('should separate widgets from layers and views', () => {
      const view = new MapView({id: 'view-1'});
      const layer = new ScatterplotLayer({data: [], id: 'layer-1'});
      const widget = new TestWidget({id: 'widget-1'});

      const result = organizeList([widget, view, layer]);

      expect(result.widgets).toStrictEqual([widget]);
      expect(result.views).toStrictEqual([view]);
      expect(result.layers).toStrictEqual([layer]);
    });

    it('should separate effects from layers, views and widgets', () => {
      const layer = new ScatterplotLayer({data: [], id: 'layer-1'});
      const widget = new TestWidget({id: 'widget-1'});
      const effect = new LightingEffect();

      const result = organizeList([effect, widget, layer]);

      expect(result.effects).toStrictEqual([effect]);
      expect(result.widgets).toStrictEqual([widget]);
      expect(result.layers).toStrictEqual([layer]);
    });

    it('should handle list with only views', () => {
      // Arrange
      const view1 = new MapView({id: 'view-1'});
      const view2 = new MapView({id: 'view-2'});
      const viewsList = [view1, view2];

      // Act
      const result = organizeList(viewsList);

      // Assert
      expect(result.views).toStrictEqual([view1, view2]);
      expect(result.layers).toStrictEqual([]);
    });

    it('should handle list with only layers', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'layer-1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'layer-2'});
      const layersList = [layer1, layer2];

      // Act
      const result = organizeList(layersList);

      // Assert
      expect(result.views).toStrictEqual([]);
      expect(result.layers).toStrictEqual([layer1, layer2]);
    });

    it('should handle empty list', () => {
      // Act
      const result = organizeList([]);

      // Assert
      expect(result.views).toStrictEqual([]);
      expect(result.layers).toStrictEqual([]);
    });
  });

  describe('flattenTree()', () => {
    it('should flatten single-level tree', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'layer-1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'layer-2'});
      const instances: Instance[] = [createMockInstance(layer1), createMockInstance(layer2)];

      // Act
      const result = flattenTree(instances);

      // Assert
      expect(result).toStrictEqual([layer1, layer2]);
    });

    it('should flatten three-level nested hierarchy', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'level-1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'level-2'});
      const layer3 = new ScatterplotLayer({data: [], id: 'level-3'});

      const level3Instance = createMockInstance(layer3, []);
      const level2Instance = createMockInstance(layer2, [level3Instance]);
      const level1Instance = createMockInstance(layer1, [level2Instance]);

      // Act
      const result = flattenTree([level1Instance]);

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toStrictEqual([layer1, layer2, layer3]);
    });

    it('should handle empty array', () => {
      // Act
      const result = flattenTree([]);

      // Assert
      expect(result).toStrictEqual([]);
    });

    it('should preserve depth-first traversal order', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'parent-1'});
      const layer2 = new ScatterplotLayer({data: [], id: 'child-1'});
      const layer3 = new ScatterplotLayer({data: [], id: 'parent-2'});
      const layer4 = new ScatterplotLayer({data: [], id: 'child-2'});

      const instances: Instance[] = [
        createMockInstance(layer1, [createMockInstance(layer2)]),
        createMockInstance(layer3, [createMockInstance(layer4)])
      ];

      // Act
      const result = flattenTree(instances);

      // Assert
      expect(result).toStrictEqual([layer1, layer2, layer3, layer4]);
    });
  });
});
