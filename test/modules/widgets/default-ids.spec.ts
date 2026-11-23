// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Widget} from '@deck.gl/core';
import * as widgets from '@deck.gl/widgets';

test('Widgets have unique default ids', () => {
  const idsByClass: Record<string, string> = {};
  const constructors = new Set<unknown>();
  for (const [name, value] of Object.entries(widgets)) {
    if (
      typeof value === 'function' &&
      value.prototype instanceof Widget &&
      !constructors.has(value)
    ) {
      constructors.add(value);
      idsByClass[name] = (value as unknown as typeof Widget).defaultProps.id;
    }
  }
  const ids = Object.values(idsByClass);

  expect(ids.length, 'widget classes found').toBeGreaterThan(10);
  expect(ids, 'no widget uses the base default').not.toContain(Widget.defaultProps.id);
  expect(new Set(ids).size, JSON.stringify(idsByClass)).toBe(ids.length);
});
