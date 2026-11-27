// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

import {LightingEffect, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {markGeneratedEffectId} from '@deck.gl/react/shared/generated-effect-id';

import {
  cloneHiddenInstance,
  cloneHiddenTextInstance,
  cloneInstance,
  createInstance,
  createTextInstance
} from '@deck.gl/react/reconciler/config';
import type {Instance, Props, Type} from '@deck.gl/react/reconciler/types';
import {createMockHostContext, setupLogSpy} from './test-utils';
import {TestWidget} from './test-widget';

const HOST_ROOT_TAG = 3;
const FUNCTION_COMPONENT_TAG = 0;
const HOST_COMPONENT_TAG = 5;

/**
 * Builds the fiber chain React passes to `createInstance`: a host fiber under the root, reached
 * through function components, one per step. A step is a key, or the index of an unkeyed fiber.
 */
function createFiberPath(steps: (string | number | null)[]): never {
  let parent: object = {index: 0, key: null, return: null, sibling: null, tag: HOST_ROOT_TAG};
  steps.forEach((step, depth) => {
    parent = {
      index: typeof step === 'number' ? step : 0,
      key: typeof step === 'string' ? step : null,
      return: parent,
      sibling: null,
      tag: depth === steps.length - 1 ? HOST_COMPONENT_TAG : FUNCTION_COMPONENT_TAG
    };
  });
  return parent as never;
}

describe('config-instance-creation', () => {
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

  describe('createInstance()', () => {
    it('should create instance for <deckLayer> element', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test-layer'});
      const type: Type = 'deckLayer';
      const props: Props = {layer};
      const hostContext = createMockHostContext();

      // Act
      const instance = createInstance(type, props, {} as never, hostContext, {} as never);

      // Assert
      expect(instance).toHaveProperty('node');
      expect(instance).toHaveProperty('children');
      expect(instance.node).toBe(layer);
      expect(instance.children).toStrictEqual([]);
    });

    it('should create instance for <deckView> element', () => {
      // Arrange
      const view = new MapView({id: 'test-view'});
      const type: Type = 'deckView';
      const props: Props = {view};
      const hostContext = createMockHostContext();

      // Act
      const instance = createInstance(type, props, {} as never, hostContext, {} as never);

      // Assert
      expect(instance).toHaveProperty('node');
      expect(instance).toHaveProperty('children');
      expect(instance.node).toBe(view);
      expect(instance.children).toStrictEqual([]);
    });

    it('should create instance for <deckWidget> element', () => {
      const widget = new TestWidget({id: 'test-widget'});

      const instance = createInstance(
        'deckWidget',
        {widget},
        {} as never,
        createMockHostContext(),
        {} as never
      );

      expect(instance.node).toBe(widget);
      expect(instance.children).toStrictEqual([]);
    });

    it('should create instance for <deckEffect> element', () => {
      const effect = new LightingEffect();

      const instance = createInstance(
        'deckEffect',
        {effect},
        {} as never,
        createMockHostContext(),
        {} as never
      );

      expect(instance.node).toBe(effect);
      expect(instance.children).toStrictEqual([]);
    });

    it('throws when an element is missing its descriptor or gets another kind', () => {
      const hostContext = createMockHostContext();
      const layer = new ScatterplotLayer({data: [], id: 'points'});
      const view = new MapView({id: 'main'});
      const widget = new TestWidget({id: 'widget'});
      const cases: [Type, Props, string][] = [
        ['deckLayer', {}, '<deckLayer> needs a Layer, got undefined'],
        ['deckLayer', {layer: null as never}, '<deckLayer> needs a Layer, got null'],
        ['deckLayer', {layer: view as never}, '<deckLayer> needs a Layer, got MapView'],
        ['deckLayer', {layer: widget as never}, '<deckLayer> needs a Layer, got TestWidget'],
        ['deckLayer', {layer: {id: 'plain'} as never}, '<deckLayer> needs a Layer, got Object'],
        ['deckView', {}, '<deckView> needs a View, got undefined'],
        ['deckView', {view: layer as never}, '<deckView> needs a View, got ScatterplotLayer'],
        ['deckWidget', {}, '<deckWidget> needs a Widget, got undefined'],
        [
          'deckWidget',
          {widget: layer as never},
          '<deckWidget> needs a Widget, got ScatterplotLayer'
        ],
        ['deckEffect', {}, '<deckEffect> needs a deck.gl effect, got undefined'],
        [
          'deckEffect',
          {effect: layer as never},
          '<deckEffect> needs a deck.gl effect, got ScatterplotLayer'
        ],
        [
          'deckEffect',
          {effect: widget as never},
          '<deckEffect> needs a deck.gl effect, got TestWidget'
        ],
        [
          'deckEffect',
          {effect: {id: 'plain'} as never},
          '<deckEffect> needs a deck.gl effect, got Object'
        ],
        [
          'deckLayer',
          {layer: new LightingEffect() as never},
          '<deckLayer> needs a Layer, got LightingEffect'
        ],
        // Only the deck-prefixed names are elements; the unprefixed names are unknown.
        ['layer', {layer}, 'Unsupported element <layer>'],
        ['view', {view}, 'Unsupported element <view>'],
        ['widget', {widget}, 'Unsupported element <widget>'],
        ['effect', {effect: new LightingEffect()}, 'Unsupported element <effect>'],
        ['div', {}, 'Unsupported element <div>']
      ];

      // The check runs in every build, not only in development.
      for (const env of ['development', 'production']) {
        process.env.NODE_ENV = env;
        for (const [type, props, message] of cases) {
          expect(() => createInstance(type, props, {} as never, hostContext, {} as never)).toThrow(
            message
          );
        }
      }
    });

    it('throws when an update swaps in another kind of descriptor', () => {
      const layer = new ScatterplotLayer({data: [], id: 'points'});
      const view = new MapView({id: 'main'});
      const instance = createInstance(
        'deckLayer',
        {layer},
        {} as never,
        createMockHostContext(),
        {} as never
      );

      expect(() =>
        cloneInstance(instance, 'deckLayer', {layer}, {layer: view as never}, false, null)
      ).toThrow('<deckLayer> needs a Layer, got MapView');
    });

    it('should reject unsupported element types', () => {
      const hostContext = createMockHostContext();

      expect(() =>
        createInstance('unsupported', {}, {} as never, hostContext, {} as never)
      ).toThrow('Unsupported element <unsupported>');
    });

    it('gives each kind of descriptor without an id one from its element path', () => {
      const {warnSpy} = setupLogSpy();
      const hostContext = createMockHostContext();
      // A keyed element under the root's first child, as React passes its fiber.
      const fiber = createFiberPath([null, 'a/b']);
      const create = (type: Type, props: Props) =>
        createInstance(type, props, {} as never, hostContext, fiber).node;

      expect(create('deckLayer', {layer: new ScatterplotLayer({data: []})}).id).toBe(
        'ScatterplotLayer/#0/a%2Fb'
      );
      expect(create('deckView', {view: new MapView()}).id).toBe('MapView/#0/a%2Fb');
      const widget = new TestWidget({});
      // Widgets and effects are given their id in place.
      expect(create('deckWidget', {widget})).toBe(widget);
      expect(widget.id).toBe('test-widget/#0/a%2Fb');
      expect(widget.props.id).toBe('test-widget/#0/a%2Fb');
      // Only an effect a component built, which the component marks, gets an id from its path.
      const effect = markGeneratedEffectId(new LightingEffect());
      expect(create('deckEffect', {effect})).toBe(effect);
      expect(effect.id).toBe('lighting-effect/#0/a%2Fb');
      // Rendering the same effect again starts from its own id, not the one it was given.
      create('deckEffect', {effect});
      expect(effect.id).toBe('lighting-effect/#0/a%2Fb');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('keeps an explicit id, and treats an empty one as missing', () => {
      const hostContext = createMockHostContext();
      const fiber = createFiberPath([1]);
      const create = (type: Type, props: Props) =>
        createInstance(type, props, {} as never, hostContext, fiber).node;

      const layer = new ScatterplotLayer({data: [], id: 'points'});
      expect(create('deckLayer', {layer})).toBe(layer);
      expect(create('deckLayer', {layer: new ScatterplotLayer({data: [], id: ''})}).id).toBe(
        'ScatterplotLayer/#1'
      );
      const view = new MapView({id: 'main'});
      expect(create('deckView', {view})).toBe(view);
      const widget = new TestWidget({id: 'legend'});
      expect(create('deckWidget', {widget}).id).toBe('legend');
    });

    it("keeps an explicit id that equals the class's default id", () => {
      const hostContext = createMockHostContext();
      const fiber = createFiberPath([null, 'a']);
      const create = (type: Type, props: Props) =>
        createInstance(type, props, {} as never, hostContext, fiber).node;

      const layer = new ScatterplotLayer({data: [], id: 'ScatterplotLayer'});
      expect(create('deckLayer', {layer})).toBe(layer);
      const view = new MapView({id: 'MapView'});
      expect(create('deckView', {view})).toBe(view);
      const widget = new TestWidget({id: 'test-widget'});
      expect(create('deckWidget', {widget})).toBe(widget);
      expect(widget.id).toBe('test-widget');
      expect(widget.props.id).toBe('test-widget');
    });

    it('keeps the id of an effect passed in, which cannot say whether its id was chosen', () => {
      const hostContext = createMockHostContext();
      const fiber = createFiberPath([null, 'a']);
      const effect = new LightingEffect();
      expect(createInstance('deckEffect', {effect}, {} as never, hostContext, fiber).node).toBe(
        effect
      );
      expect(effect.id).toBe('lighting-effect');
      effect.id = 'sun';
      createInstance('deckEffect', {effect}, {} as never, hostContext, fiber);
      expect(effect.id).toBe('sun');
    });

    it('keeps the element path through a hidden clone, so a later clone keeps its id', () => {
      const hostContext = createMockHostContext();
      const fiber = createFiberPath([null, 'a']);
      const layerProps = {layer: new ScatterplotLayer({data: []})};
      const instance = createInstance('deckLayer', layerProps, {} as never, hostContext, fiber);
      expect(instance.node.id).toBe('ScatterplotLayer/#0/a');

      // Suspense or Activity hides the element, then it renders a new layer.
      const hidden = cloneHiddenInstance(instance, 'deckLayer', layerProps);
      const nextProps = {layer: new ScatterplotLayer({data: []})};
      const next = cloneInstance(hidden, 'deckLayer', layerProps, nextProps, false, null);
      expect(next?.node.id).toBe('ScatterplotLayer/#0/a');
    });

    it("gives a lone top-level element deck.gl's default id", () => {
      const hostContext = createMockHostContext();
      const node = createInstance(
        'deckLayer',
        {layer: new ScatterplotLayer({data: []})},
        {} as never,
        hostContext,
        createFiberPath([0])
      ).node;

      expect(node.id).toBe('ScatterplotLayer');
    });

    it('should return instance with node and empty children array', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const type: Type = 'deckLayer';
      const props: Props = {layer};
      const hostContext = createMockHostContext();

      // Act
      const instance = createInstance(type, props, {} as never, hostContext, {} as never);

      // Assert
      expect(instance).toHaveProperty('node', layer);
      expect(instance).toHaveProperty('children');
      expect(Array.isArray(instance.children)).toBeTruthy();
      expect(instance.children).toHaveLength(0);
    });
  });

  describe('createTextInstance()', () => {
    it('should always throw error for text nodes', () => {
      // Act & Assert
      expect(() => createTextInstance()).toThrow('Text nodes are not supported');
    });
  });

  describe('cloneInstance()', () => {
    it('should return undefined if instance is undefined', () => {
      // Arrange
      const instance = undefined;
      const type = 'deckLayer';
      const oldProps: Props = {};
      const newProps: Props = {};

      // Act
      const result = cloneInstance(instance, type, oldProps, newProps, true, null);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should create new instance with new props', () => {
      // Arrange
      const oldLayer = new ScatterplotLayer({
        data: [],
        getRadius: 5,
        id: 'test'
      });
      const newLayer = new ScatterplotLayer({
        data: [],
        getRadius: 10,
        id: 'test'
      });
      const instance: Instance = {
        children: [],
        node: oldLayer
      };
      const type = 'deckLayer';
      const oldProps: Props = {layer: oldLayer};
      const newProps: Props = {layer: newLayer};

      // Act
      const result = cloneInstance(instance, type, oldProps, newProps, true, null);

      // Assert
      expect(result).toBeDefined();
      expect(result?.node).toBe(newLayer);
      expect(result?.node).not.toBe(oldLayer);
    });

    it('should keep children if keepChildren=true', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const newLayer = new ScatterplotLayer({data: [], id: 'test'});
      const childInstance: Instance = {
        children: [],
        node: new ScatterplotLayer({data: [], id: 'child'})
      };
      const instance: Instance = {
        children: [childInstance],
        node: layer
      };
      const type = 'deckLayer';
      const oldProps: Props = {layer};
      const newProps: Props = {layer: newLayer};

      // Act
      const result = cloneInstance(
        instance,
        type,
        oldProps,
        newProps,
        true, // keepChildren
        null
      );

      // Assert
      expect(result?.children).toBe(instance.children);
      expect(result?.children).toHaveLength(1);
      expect(result?.children[0]).toBe(childInstance);
    });

    it('should use recyclableInstance children if keepChildren=false', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const newLayer = new ScatterplotLayer({data: [], id: 'test'});
      const recyclableChild: Instance = {
        children: [],
        node: new ScatterplotLayer({data: [], id: 'recyclable-child'})
      };
      const recyclableInstance: Instance = {
        children: [recyclableChild],
        node: layer
      };
      const instance: Instance = {
        children: [],
        node: layer
      };
      const type = 'deckLayer';
      const oldProps: Props = {layer};
      const newProps: Props = {layer: newLayer};

      // Act
      const result = cloneInstance(
        instance,
        type,
        oldProps,
        newProps,
        false, // keepChildren=false
        recyclableInstance
      );

      // Assert
      expect(result?.children).toBe(recyclableInstance.children);
      expect(result?.children).toHaveLength(1);
      expect(result?.children[0]).toBe(recyclableChild);
    });

    it('should use empty children if keepChildren=false and no recyclable', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const newLayer = new ScatterplotLayer({data: [], id: 'test'});
      const childInstance: Instance = {
        children: [],
        node: new ScatterplotLayer({data: [], id: 'child'})
      };
      const instance: Instance = {
        children: [childInstance],
        node: layer
      };
      const type = 'deckLayer';
      const oldProps: Props = {layer};
      const newProps: Props = {layer: newLayer};

      // Act
      const result = cloneInstance(
        instance,
        type,
        oldProps,
        newProps,
        false, // keepChildren=false
        null // no recyclable
      );

      // Assert
      expect(result?.children).not.toBe(instance.children);
      expect(result?.children).toStrictEqual([]);
    });
  });

  describe('cloneHiddenInstance()', () => {
    it('should return instance with same node and children', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const childInstance: Instance = {
        children: [],
        node: new ScatterplotLayer({data: [], id: 'child'})
      };
      const instance: Instance = {
        children: [childInstance],
        node: layer
      };
      const type: Type = 'deckLayer';
      const props: Props = {layer};

      // Act
      const result = cloneHiddenInstance(instance, type, props);

      // Assert
      expect(result.node).toBe(instance.node);
      expect(result.children).toBe(instance.children);
    });
  });

  describe('cloneHiddenTextInstance()', () => {
    it('asserts, because text instances are never created', () => {
      expect(() => cloneHiddenTextInstance()).toThrow();
    });
  });
});
