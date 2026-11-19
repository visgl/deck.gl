import {MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {describe, expect, it} from 'vitest';

import {
  getChildHostContext,
  getPublicInstance,
  getRootHostContext,
  shouldSetTextContent
} from '../config';
import type {Container} from '../types';
import {createMockHostContext, createMockInstance} from './test-utils';

describe('config-host-context', () => {
  describe('getRootHostContext()', () => {
    it('should return rootContainer as context', () => {
      const rootContainer = {store: {} as never} as Container;

      expect(getRootHostContext(rootContainer)).toBe(rootContainer);
    });

    it('should provide context that contains store', () => {
      const mockStore = {} as never;
      const rootContainer = {store: mockStore} as Container;

      expect(getRootHostContext(rootContainer)).toHaveProperty('store', mockStore);
    });
  });

  describe('getChildHostContext()', () => {
    it('should set insideView=true for the view element', () => {
      const parentContext = createMockHostContext({insideView: false});

      expect(getChildHostContext(parentContext, 'deckView').insideView).toBeTruthy();
    });

    it('should preserve insideView=true in nested views', () => {
      const parentContext = createMockHostContext({insideView: true});

      expect(getChildHostContext(parentContext, 'deckView')).toBe(parentContext);
    });

    it('should return parent context for layers and unsupported elements', () => {
      const parentContext = createMockHostContext({insideView: false});

      expect(getChildHostContext(parentContext, 'deckLayer')).toBe(parentContext);
      expect(getChildHostContext(parentContext, 'View')).toBe(parentContext);
    });

    it('should create a new context object when entering a view', () => {
      const parentContext = createMockHostContext({insideView: false});
      const result = getChildHostContext(parentContext, 'deckView');

      expect(result).not.toBe(parentContext);
      expect(result.store).toBe(parentContext.store);
    });
  });

  describe('getPublicInstance()', () => {
    it('should return instance.node for a layer', () => {
      const layer = new ScatterplotLayer({data: [], id: 'test'});

      expect(getPublicInstance(createMockInstance(layer))).toBe(layer);
    });

    it('should return instance.node for a view', () => {
      const view = new MapView({id: 'test'});

      expect(getPublicInstance(createMockInstance(view))).toBe(view);
    });
  });

  describe('shouldSetTextContent()', () => {
    it('should always return false', () => {
      expect(shouldSetTextContent('deckLayer', {})).toBeFalsy();
      expect(shouldSetTextContent('deckView', {})).toBeFalsy();
    });
  });
});
