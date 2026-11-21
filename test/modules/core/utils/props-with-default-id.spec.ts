// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {createPropsWithDefaultId} from '@deck.gl/core/utils/props-with-default-id';

type TestProps = {id?: string | null; size?: number};

test('createPropsWithDefaultId', () => {
  const omitted = createPropsWithDefaultId<TestProps>('default', {size: 1});
  expect(omitted.id, 'omitted id reads the default').toBe('default');
  expect(Object.hasOwn(omitted, 'id'), 'omitted id is not own').toBe(false);
  expect(omitted.size).toBe(1);

  const passed = createPropsWithDefaultId<TestProps>('default', {id: 'custom'});
  expect(passed.id, 'passed id is kept').toBe('custom');
  expect(Object.hasOwn(passed, 'id'), 'passed id is own').toBe(true);

  const explicitUndefined = createPropsWithDefaultId<TestProps>('default', {id: undefined});
  expect(explicitUndefined.id, 'undefined id reads the default').toBe('default');
  expect(Object.hasOwn(explicitUndefined, 'id'), 'undefined id is not own').toBe(false);

  const nullId = createPropsWithDefaultId<TestProps>('default', {id: null});
  expect(nullId.id, 'null id is kept').toBe(null);
  expect(Object.hasOwn(nullId, 'id')).toBe(true);

  const layered = createPropsWithDefaultId<TestProps>(
    'default',
    {id: 'first', size: 1},
    undefined,
    {size: 2}
  );
  expect(layered.id, 'an earlier id survives a later source without one').toBe('first');
  expect(layered.size, 'later sources override earlier ones').toBe(2);

  const hidden = createPropsWithDefaultId<TestProps>('default', {id: 'first'}, {id: undefined});
  expect(hidden.id, 'a later undefined id falls back to the default').toBe('default');
  expect(Object.hasOwn(hidden, 'id')).toBe(false);
});
