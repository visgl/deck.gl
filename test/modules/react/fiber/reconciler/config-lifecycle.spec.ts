import {ScatterplotLayer} from '@deck.gl/layers';
import {describe, expect, it, vi} from 'vitest';

import {
  detachDeletedInstance,
  prepareForCommit,
  preparePortalMount,
  requestPostPaintCallback,
  resetAfterCommit
} from '../config';
import type {Container} from '../types';
import {createMockInstance} from './test-utils';

describe('config-lifecycle', () => {
  describe('prepareForCommit()', () => {
    it('should return null', () => {
      // Arrange
      const container = {
        store: {} as never
      } as Container;

      // Act
      const result = prepareForCommit(container);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('resetAfterCommit()', () => {
    it('should be a no-op', () => {
      // Arrange
      const container = {
        store: {} as never
      } as Container;

      // Act & Assert
      expect(() => resetAfterCommit(container)).not.toThrow();
    });
  });

  describe('preparePortalMount()', () => {
    it('should be a no-op', () => {
      // Act & Assert
      expect(() => preparePortalMount()).not.toThrow();
    });
  });

  describe('detachDeletedInstance()', () => {
    it('should clear children array (length = 0)', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'parent'});
      const child1 = createMockInstance(new ScatterplotLayer({data: [], id: 'child1'}));
      const child2 = createMockInstance(new ScatterplotLayer({data: [], id: 'child2'}));
      const instance = createMockInstance(layer, [child1, child2]);

      expect(instance.children).toHaveLength(2);

      // Act
      detachDeletedInstance(instance);

      // Assert
      expect(instance.children).toHaveLength(0);
    });

    it('should help garbage collection by removing references', () => {
      // Arrange
      const layer = new ScatterplotLayer({data: [], id: 'parent'});
      const child = createMockInstance(new ScatterplotLayer({data: [], id: 'child'}));
      const instance = createMockInstance(layer, [child]);

      // Act
      detachDeletedInstance(instance);

      // Assert
      expect(instance.children).toStrictEqual([]);
    });
  });

  describe('requestPostPaintCallback()', () => {
    it('should call callback after requestAnimationFrame + setTimeout', async () => {
      // Arrange
      const callback = vi.fn<() => void>();

      // Act
      requestPostPaintCallback(callback);

      // Wait for RAF + setTimeout
      await vi.waitFor(
        () => {
          expect(callback).toHaveBeenCalledOnce();
        },
        {timeout: 1000}
      );
    });

    it('should call callback with performance.now() timestamp', async () => {
      // Arrange
      const callback = vi.fn<(time: number) => void>();

      // Act
      requestPostPaintCallback(callback);

      // Wait for RAF + setTimeout
      await vi.waitFor(
        () => {
          expect(callback).toHaveBeenCalledOnce();
        },
        {timeout: 1000}
      );

      // Assert
      expect(callback.mock.calls.length).toBeGreaterThan(0);
      const [firstCall] = callback.mock.calls;
      if (firstCall === undefined) {
        throw new Error('Expected callback to be called');
      }
      const [timestamp] = firstCall;
      expect(timestamp).toBeTypeOf('number');
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should fire after requestAnimationFrame completes', async () => {
      // Arrange
      let rafCompleted = false;
      const callback = vi.fn<(time: number) => void>(() => {
        // Verify RAF completed before callback
        expect(rafCompleted).toBeTruthy();
      });

      // Act
      requestPostPaintCallback(callback);

      requestAnimationFrame(() => {
        rafCompleted = true;
      });

      // Wait for callback to fire
      await vi.waitFor(
        () => {
          expect(callback).toHaveBeenCalledOnce();
        },
        {timeout: 1000}
      );

      // Assert
      expect(rafCompleted).toBeTruthy();
      expect(callback).toHaveBeenCalledOnce();
    });
  });
});
