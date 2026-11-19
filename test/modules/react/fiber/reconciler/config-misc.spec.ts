import {ScatterplotLayer} from '@deck.gl/layers';
import {describe, expect, it} from 'vitest';

import {
  afterActiveInstanceBlur,
  beforeActiveInstanceBlur,
  getInstanceFromNode,
  getInstanceFromScope,
  prepareUpdate,
  prepareScopeUpdate,
  resetFormInstance,
  shouldAttemptEagerTransition
} from '../config';
import type {Container, HostContext, Props} from '../types';
import {createMockHostContext, createMockInstance} from './test-utils';

describe('config-misc', () => {
  describe('prepareUpdate()', () => {
    it('should always return null (persistence mode)', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const instance = createMockInstance(layer);
      const type = 'deckLayer';
      const oldProps: Props = {layer};
      const newProps: Props = {layer};
      const rootContainer = {} as Container;
      const hostContext = createMockHostContext();

      // Act
      const result = prepareUpdate(instance, type, oldProps, newProps, rootContainer, hostContext);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null even with different props', () => {
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
      const instance = createMockInstance(oldLayer);
      const type = 'deckLayer';
      const oldProps: Props = {layer: oldLayer};
      const newProps: Props = {layer: newLayer};

      // Act
      const result = prepareUpdate(
        instance,
        type,
        oldProps,
        newProps,
        {} as never,
        {} as HostContext
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('beforeActiveInstanceBlur()', () => {
    it('should be a no-op', () => {
      // Act & Assert
      expect(() => beforeActiveInstanceBlur()).not.toThrow();
    });
  });

  describe('afterActiveInstanceBlur()', () => {
    it('should be a no-op', () => {
      // Act & Assert
      expect(() => afterActiveInstanceBlur()).not.toThrow();
    });
  });

  describe('getInstanceFromNode()', () => {
    it('should return null', () => {
      // Arrange
      const node = {} as never;

      // Act
      const result = getInstanceFromNode(node);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getInstanceFromScope()', () => {
    it('should return null', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'test'});
      const scopeInstance = createMockInstance(layer);

      // Act
      const result = getInstanceFromScope(scopeInstance);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('prepareScopeUpdate()', () => {
    it('should be a no-op', () => {
      // Arrange
      const layer1 = new ScatterplotLayer({data: [], id: 'scope'});
      const layer2 = new ScatterplotLayer({data: [], id: 'instance'});
      const scopeInstance = createMockInstance(layer1);
      const instance = createMockInstance(layer2);

      // Act & Assert
      expect(() => prepareScopeUpdate(scopeInstance, instance)).not.toThrow();
    });
  });

  describe('shouldAttemptEagerTransition()', () => {
    it('should return false', () => {
      // Act
      const result = shouldAttemptEagerTransition();

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe('resetFormInstance()', () => {
    it('should be a no-op', () => {
      // Arrange
      const form = {} as never;

      // Act & Assert
      expect(() => resetFormInstance(form)).not.toThrow();
    });
  });
});
