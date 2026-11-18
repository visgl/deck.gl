// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

import {describe, expect, it} from 'vitest';

import {globalScope} from '@deck.gl/react/shared/constants';
import {isBrowserEnvironment} from '@deck.gl/react/shared/utils';

describe('Utility Functions Tests (Browser Environment)', () => {
  describe('isBrowserEnvironment()', () => {
    it('should be true in jsdom environment (has window and document)', () => {
      // Arrange & Act & Assert
      // In jsdom environment, both window and document exist
      expect(globalScope).toBeDefined();
      expect(globalScope).not.toBeNull();
      expect(globalScope).toHaveProperty('document');
      expect(isBrowserEnvironment).toBeTruthy();
    });
  });
});
