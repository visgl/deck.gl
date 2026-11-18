// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import * as root from '@deck.gl/react';
import * as legacy from '@deck.gl/react/legacy';

test('@deck.gl/react/legacy exports the previous API, separate from the renderer at the root', () => {
  expect(legacy.default, 'default export is DeckGL').toBe(legacy.DeckGL);
  expect(typeof legacy.useWidget, 'useWidget').toBe('function');
  expect(typeof legacy.ZoomWidget, 'React widget components').toBe('function');
  expect(legacy.DeckGL, 'a different DeckGL from the root').not.toBe(root.DeckGL);
  expect(root, 'the root has no default export').not.toHaveProperty('default');
});
