// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import * as root from '@deck.gl/react';
import * as legacy from '@deck.gl/react/legacy';

test('@deck.gl/react/legacy exports the same API as the package root', () => {
  expect(Object.keys(legacy).sort(), 'same export names').toEqual(Object.keys(root).sort());
  for (const name of Object.keys(root)) {
    expect(legacy[name], `${name} is the same value`).toBe(root[name]);
  }
  expect(legacy.default, 'default export is DeckGL').toBe(legacy.DeckGL);
});
