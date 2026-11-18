// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

import {describe, expect, expectTypeOf, it} from 'vitest';

import * as reconcilerModule from '@deck.gl/react/reconciler/index';

describe('index', () => {
  it('should export createRoot', () => {
    expect(reconcilerModule).toHaveProperty('createRoot');
    expectTypeOf(reconcilerModule.createRoot).toBeFunction();
  });

  it('should export unmountAtNode', () => {
    expect(reconcilerModule).toHaveProperty('unmountAtNode');
    expectTypeOf(reconcilerModule.unmountAtNode).toBeFunction();
  });

  it('should export roots', () => {
    expect(reconcilerModule).toHaveProperty('roots');
    expect(reconcilerModule.roots).toBeInstanceOf(Map);
  });

  it('should export only root lifecycle APIs', () => {
    expect(Object.keys(reconcilerModule).sort()).toEqual(['createRoot', 'roots', 'unmountAtNode']);
  });
});
