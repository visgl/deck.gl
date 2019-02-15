import test from 'tape-catch';

import LRUCache from '@deck.gl/layers/text-layer/lru-cache';

test('TextLayer - LRUCache#Constructor', t => {
  let cache = new LRUCache();

  t.ok(cache.limit === 5, 'Should constructed with default limit.');

  cache = new LRUCache(3);
  t.ok(cache.limit === 3, 'Should constructed with given limit.');
  t.end();
});

test('TextLayer - LRUCache#clear', t => {
  const cache = new LRUCache();

  cache.set('key1', 'val1');

  cache.clear();
  t.notOk(cache.get('key1'), 'Should be cleared.');

  t.end();
});

test('TextLayer - LRUCache#set and get', t => {
  const cache = new LRUCache(2);

  t.notOk(cache.get('key1'), 'Should be empty');

  cache.set('key1', 'val1');
  cache.set('key2', 'val2');

  t.ok(cache.get('key1') === 'val1', 'Should set correctly.');

  cache.set('key3', 'val3');
  t.notOk(cache.get('key2'), 'Should delete the oldest one.');
  t.ok(cache.get('key1') === 'val1', 'Should not be deleted.');
  t.ok(cache.get('key3') === 'val3', 'Should not be deleted.');

  t.end();
});

test('TextLayer - LRUCache#delete', t => {
  const cache = new LRUCache(2);

  cache.set('key1', 'val1');
  cache.set('key2', 'val2');

  cache.delete('key1');
  t.notOk(cache.get('key1'), 'Should be deleted.');
  t.ok(cache.get('key2') === 'val2', 'Should exist in cache.');

  t.end();
});
