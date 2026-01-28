// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

import LRUCache from '@deck.gl/layers/text-layer/lru-cache';

test('TextLayer - LRUCache#Constructor', () => {
  let cache = new LRUCache();

  expect(cache.limit === 5, 'Should constructed with default limit.').toBeTruthy();

  cache = new LRUCache(3);
  expect(cache.limit === 3, 'Should constructed with given limit.').toBeTruthy();
});

test('TextLayer - LRUCache#set and get', () => {
  const cache = new LRUCache(2);

  expect(cache.get('key1'), 'Should be empty').toBeFalsy();

  cache.set('key1', 'val1');
  cache.set('key2', 'val2');

  expect(cache.get('key1') === 'val1', 'Should set correctly.').toBeTruthy();

  cache.set('key3', 'val3');
  expect(cache.get('key2'), 'Should delete the oldest one.').toBeFalsy();
  expect(cache.get('key1') === 'val1', 'Should not be deleted.').toBeTruthy();
  expect(cache.get('key3') === 'val3', 'Should not be deleted.').toBeTruthy();
});

test('TextLayer - LRUCache#delete', () => {
  const cache = new LRUCache(2);

  cache.set('key1', 'val1');
  cache.set('key2', 'val2');

  cache.delete('key1');
  expect(cache.get('key1'), 'Should be deleted.').toBeFalsy();
  expect(cache.get('key2') === 'val2', 'Should exist in cache.').toBeTruthy();
});
