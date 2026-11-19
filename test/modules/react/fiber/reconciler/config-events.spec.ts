import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  ContinuousEventPriority,
  DefaultEventPriority,
  DiscreteEventPriority
} from 'react-reconciler/constants';

import {
  getCurrentEventPriority,
  getCurrentUpdatePriority,
  resolveEventTimeStamp,
  resolveEventType,
  resolveUpdatePriority,
  setCurrentUpdatePriority,
  trackSchedulerEvent
} from '../config';

describe('config-events', () => {
  let originalEvent: typeof window.event;

  beforeEach(() => {
    originalEvent = window.event;
  });

  afterEach(() => {
    if (originalEvent === undefined) {
      delete window.event;
    } else {
      window.event = originalEvent;
    }
    vi.restoreAllMocks();
  });

  describe('getCurrentEventPriority()', () => {
    it('should return DiscreteEventPriority for click', () => {
      // Arrange
      // @ts-expect-error - setting window.event for test
      window.event = {type: 'click'};

      // Act
      const result = getCurrentEventPriority();

      // Assert
      expect(result).toBe(DiscreteEventPriority);
    });

    it('should return DiscreteEventPriority for keydown', () => {
      // Arrange
      // @ts-expect-error - setting window.event for test
      window.event = {type: 'keydown'};

      // Act
      const result = getCurrentEventPriority();

      // Assert
      expect(result).toBe(DiscreteEventPriority);
    });

    it('should return DiscreteEventPriority for pointerdown', () => {
      // Arrange
      // @ts-expect-error - setting window.event for test
      window.event = {type: 'pointerdown'};

      // Act
      const result = getCurrentEventPriority();

      // Assert
      expect(result).toBe(DiscreteEventPriority);
    });

    it('should return ContinuousEventPriority for pointermove', () => {
      // Arrange
      // @ts-expect-error - setting window.event for test
      window.event = {type: 'pointermove'};

      // Act
      const result = getCurrentEventPriority();

      // Assert
      expect(result).toBe(ContinuousEventPriority);
    });

    it('should return ContinuousEventPriority for wheel', () => {
      // Arrange
      // @ts-expect-error - setting window.event for test
      window.event = {type: 'wheel'};

      // Act
      const result = getCurrentEventPriority();

      // Assert
      expect(result).toBe(ContinuousEventPriority);
    });

    it('should return DefaultEventPriority for unknown events', () => {
      // Arrange
      // @ts-expect-error - setting window.event for test
      window.event = {type: 'unknown-event'};

      // Act
      const result = getCurrentEventPriority();

      // Assert
      expect(result).toBe(DefaultEventPriority);
    });

    it('should return DefaultEventPriority when no event', () => {
      // Arrange
      delete window.event;

      // Act
      const result = getCurrentEventPriority();

      // Assert
      expect(result).toBe(DefaultEventPriority);
    });
  });

  describe('trackSchedulerEvent()', () => {
    it('should be a no-op', () => {
      // Act & Assert
      expect(() => trackSchedulerEvent()).not.toThrow();
    });
  });

  describe('resolveEventType()', () => {
    it('should return null', () => {
      // Act
      const result = resolveEventType();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('resolveEventTimeStamp()', () => {
    it('should return -1.1', () => {
      // Act
      const result = resolveEventTimeStamp();

      // Assert
      expect(result).toBe(-1.1);
    });
  });

  describe('setCurrentUpdatePriority()', () => {
    it('should set currentUpdatePriority module variable', () => {
      // Arrange
      const newPriority = DiscreteEventPriority;

      // Act
      setCurrentUpdatePriority(newPriority);

      // Assert
      const result = getCurrentUpdatePriority();
      expect(result).toBe(newPriority);
    });

    it('should persist across calls to getCurrentUpdatePriority', () => {
      // Arrange
      setCurrentUpdatePriority(ContinuousEventPriority);

      // Act
      const result1 = getCurrentUpdatePriority();
      const result2 = getCurrentUpdatePriority();

      // Assert
      expect(result1).toBe(ContinuousEventPriority);
      expect(result2).toBe(ContinuousEventPriority);
    });
  });

  describe('getCurrentUpdatePriority()', () => {
    it('should return currentUpdatePriority', () => {
      // Arrange
      setCurrentUpdatePriority(DiscreteEventPriority);

      // Act
      const result = getCurrentUpdatePriority();

      // Assert
      expect(result).toBe(DiscreteEventPriority);
    });

    it('should return different values after setCurrentUpdatePriority', () => {
      // Arrange
      setCurrentUpdatePriority(DiscreteEventPriority);
      const first = getCurrentUpdatePriority();

      setCurrentUpdatePriority(ContinuousEventPriority);
      const second = getCurrentUpdatePriority();

      // Assert
      expect(first).toBe(DiscreteEventPriority);
      expect(second).toBe(ContinuousEventPriority);
    });
  });

  describe('resolveUpdatePriority()', () => {
    it('should return currentUpdatePriority if not DefaultEventPriority', () => {
      // Arrange
      setCurrentUpdatePriority(DiscreteEventPriority);

      // Act
      const result = resolveUpdatePriority();

      // Assert
      expect(result).toBe(DiscreteEventPriority);
    });

    it('should return currentEventPriority if currentUpdatePriority is DefaultEventPriority', () => {
      // Arrange
      setCurrentUpdatePriority(DefaultEventPriority);

      // Act
      const result = resolveUpdatePriority();

      // Assert
      expect(result).toBe(DefaultEventPriority);
    });

    it('should prefer currentUpdatePriority over currentEventPriority', () => {
      // Arrange
      setCurrentUpdatePriority(ContinuousEventPriority);

      // Act
      const result = resolveUpdatePriority();

      // Assert
      expect(result).toBe(ContinuousEventPriority);
    });
  });
});
