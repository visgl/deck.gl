// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  createBinaryProxy,
  getWorkerUrl,
  scaleIdentity,
  isObject,
  isPureObject
} from '@deck.gl/carto/utils';

test('createBinaryProxy', async () => {
  const binary = {
    numericProps: {temperature: {value: new Float32Array([18, 19, 20, 21]), size: 1}},
    properties: [{name: 'name0'}, {name: 'name1'}, {name: 'name2'}, {name: 'name3'}]
  };
  const proxy = createBinaryProxy(binary, 2);
  expect('name' in proxy, 'Proxy contains name key').toBeTruthy();
  expect('temperature' in proxy, 'Proxy contains temperature key').toBeTruthy();
  expect(!('missing' in proxy), 'Proxy missing key').toBeTruthy();
  expect(proxy.temperature, 'Proxy has correct temperature value').toBe(20);
  expect(proxy.name, 'Proxy has correct name value').toBe('name2');
});

test('getWorkerUrl', async () => {
  expect(getWorkerUrl('cartoTest', '1.2.3')).toBe(
    'https://unpkg.com/@deck.gl/carto@1.2.3/dist/cartoTest-worker.js'
  );
});

test('scaleIdentity', async () => {
  const scale = scaleIdentity();

  // scale
  expect(scale(null), 'scale(null)').toBe(undefined);
  expect(scale(undefined), 'scale(undefined)').toBe(undefined);
  expect(scale(123), 'scale(123)').toBe(123);
  expect(scale(Infinity), 'scale(Infinity)').toBe(Infinity);
  expect(isNaN(scale(NaN)), 'scale(NaN)').toBeTruthy();

  // invert
  expect(scale.invert, 'scale.invert === scale').toBe(scale);

  // domain and range
  expect(scale.domain(1), 'domain').toBe(1);
  expect(scale.range(1), 'range').toBe(1);

  // unknown
  scale.unknown(-1);
  expect(scale(null), 'scale(null) (unknown = -1)').toBe(-1);
  expect(scale(123), 'scale(123) (unknown = -1)').toBe(123);

  // copy
  const scaleCopy = scale.copy();
  scaleCopy.unknown(-2);
  expect(scaleCopy(123), 'scaleCopy(123)').toBe(123);
  expect(scaleCopy(null), 'copies set "unknown"').toBe(-2);
  expect(scale(null), 'copies do not affect "unknown" for original').toBe(-1);
});

test('isObject', () => {
  class TestClass {}
  expect(isObject({}), 'object is object').toBe(true);
  expect(isObject(3), 'number is not object').toBe(false);
  expect(isObject([]), 'array is object').toBe(true);
  expect(isObject(new TestClass()), 'class instance is object').toBe(true);
});

test('isPureObject', () => {
  class TestClass {}
  expect(isPureObject({}), 'object is pure').toBe(true);
  expect(isPureObject(3), 'number is not pure').toBe(false);
  expect(isPureObject([]), 'array is not pure').toBe(false);
  expect(isPureObject(new TestClass()), 'class instance is not pure').toBe(false);
});
