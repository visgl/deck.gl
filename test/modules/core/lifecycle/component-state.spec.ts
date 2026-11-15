// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// loaders.gl, MIT license

import {test, expect} from 'vitest';
import {_ComponentState as ComponentState, _Component as Component} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/tables/csv';
const webglTest = device.type === 'webgl' ? test : test.skip;

const EMPTY_ARRAY = Object.freeze([]);

type TestComponentProps = {
  data?: any;
  dataTransform?: (any) => any;
  image?: any;
};

const defaultProps = {
  // data: Special handling for null, see below
  data: {type: 'data', value: EMPTY_ARRAY, async: true},
  dataTransform: null,
  image: {type: 'image', value: null, async: true}
};

class TestComponent extends Component<TestComponentProps> {
  constructor(props: TestComponentProps) {
    super(props);
  }
  static componentName = 'TestComponent';
  static defaultProps = defaultProps;
}

type Resolvers = {resolve(T): void; reject(Error): void};

class PromiseWithResolvers<T> extends Promise<T> {
  resolve(value: T): void {}
  reject(error: Error): void {}
}

function makePromise<T = unknown>(): PromiseWithResolvers<T> {
  const resolvers = {} as Resolvers;
  const promise = new Promise<T>((resolve, reject) => {
    resolvers.resolve = resolve;
    resolvers.reject = reject;
  });
  return Object.assign(promise, resolvers);
}

function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

test('ComponentState#imports', () => {
  expect(ComponentState, 'ComponentState import ok').toBeTruthy();
});

test('Component derived props preserve declarative and resolved async values', () => {
  class DerivedComponent extends Component<{opacity: number; data: number[]}> {
    static defaultProps = {...defaultProps, opacity: 0.25};

    setComputedOpacity(opacity: number | null) {
      this.setDerivedProps(opacity === null ? null : {opacity});
    }
  }
  const component = new DerivedComponent({data: [1]});
  const state = new ComponentState(component);
  component.internalState = state;
  state.setAsyncProps(component.props);
  state.resetOldProps();

  component.setComputedOpacity(0.75);
  expect(component.props.opacity).toBe(0.25);
  expect(state.getEffectiveProps(component.props).opacity).toBe(0.75);
  expect(state.getEffectiveProps(component.props).data).toEqual([1]);
  expect(state.getOldEffectiveProps().opacity).toBe(0.25);

  state.resetOldProps();
  component.setComputedOpacity(null);
  expect(state.getEffectiveProps(component.props)).toBe(component.props);
  expect(state.getOldEffectiveProps().opacity).toBe(0.75);
});

test('ComponentState#finalize', async () => {
  const component = new TestComponent({});
  const state = new ComponentState(component);
  component.internalState = state;
  expect(state.component, 'state.component is present').toBe(component);

  const updateCallbackCalled = {};
  state.onAsyncPropUpdated = propName => {
    updateCallbackCalled[propName] = true;
  };

  const loadPromiseA = makePromise();
  const loadPromiseB = makePromise();
  state.setAsyncProps({
    data: loadPromiseA,
    image: loadPromiseB
  });
  loadPromiseA.resolve([]);
  await delay(0);
  expect(
    updateCallbackCalled['data'],
    'onAsyncPropUpdated callback is called for data'
  ).toBeTruthy();
  expect(state.isAsyncPropLoading('A'), 'A is loaded').toBeFalsy();

  state.finalize();
  loadPromiseB.resolve([]);
  await delay(0);
  expect(
    updateCallbackCalled['image'],
    'onAsyncPropUpdated callback is not called for image'
  ).toBeFalsy();

  expect(state.component, 'state.component is dereferenced').toBeFalsy();
});

test('ComponentState#synchronous async props', () => {
  const component = new Component();
  const state = new ComponentState(component);
  component.internalState = state;
  expect(state, 'ComponentState construction ok').toBeTruthy();

  expect(state.hasAsyncProp('data'), 'ComponentState.hasAsyncProp returned correct value').toBe(
    false
  );
  state.setAsyncProps({data: []});
  state.setAsyncProps({data: []});
  expect(state.hasAsyncProp('data'), 'ComponentState.hasAsyncProp returned correct value').toBe(
    true
  );
  expect(state.getAsyncProp('data'), 'ComponentState.getAsyncProp returned correct value').toEqual(
    []
  );
});

test('ComponentState#asynchronous async props', async () => {
  const component = new Component();
  const state = new ComponentState(component);
  component.internalState = state;
  expect(state, 'ComponentState construction ok').toBeTruthy();

  const loadPromise1 = makePromise();
  const loadPromise2 = makePromise();
  const loadPromise3 = makePromise();

  expect(state.hasAsyncProp('data'), 'ComponentState.hasAsyncProp returned correct value').toBe(
    false
  );
  state.setAsyncProps({data: loadPromise1});
  expect(state.hasAsyncProp('data'), 'ComponentState.hasAsyncProp returned correct value').toBe(
    true
  );
  state.setAsyncProps({data: loadPromise1});
  expect(
    state.isAsyncPropLoading('data'),
    'ComponentState.isAsyncPropLoading returned correct value'
  ).toBe(true);
  loadPromise1.resolve([1]);
  expect(
    state.isAsyncPropLoading('data'),
    'ComponentState.isAsyncPropLoading returned correct value'
  ).toBe(true);

  await delay(0);

  expect(
    state.isAsyncPropLoading('data'),
    'ComponentState.isAsyncPropLoading returned correct value'
  ).toBe(false);
  expect(state.getAsyncProp('data'), 'ComponentState.getAsyncProp returned correct value').toEqual([
    1
  ]);
  state.setAsyncProps({data: loadPromise2});
  state.setAsyncProps({data: loadPromise3});
  loadPromise3.resolve([3]);
  expect(
    state.isAsyncPropLoading('data'),
    'ComponentState.isAsyncPropLoading returned correct value'
  ).toBe(true);
  expect(state.getAsyncProp('data'), 'ComponentState.getAsyncProp returned correct value').toEqual([
    1
  ]);

  await delay(0);

  expect(
    state.isAsyncPropLoading('data'),
    'ComponentState.isAsyncPropLoading returned correct value'
  ).toBe(false);
  expect(state.getAsyncProp('data'), 'ComponentState.getAsyncProp returned correct value').toEqual([
    3
  ]);
  loadPromise2.resolve([2]);

  await delay(0);

  expect(
    state.isAsyncPropLoading('data'),
    'ComponentState.isAsyncPropLoading returned correct value'
  ).toBe(false);
  expect(state.getAsyncProp('data'), 'ComponentState.getAsyncProp returned correct value').toEqual([
    3
  ]);
});

test('ComponentState#stale async prop load does not release the current value', async () => {
  const released: unknown[] = [];
  const transformed: unknown[] = [];

  class ReleaseTestComponent extends Component<{resource?: any}> {
    static componentName = 'ReleaseTestComponent';
    static defaultProps = {
      resource: {
        type: 'object',
        value: null,
        async: true,
        transform: value => {
          transformed.push(value);
          return {source: value};
        },
        release: value => {
          if (value) {
            released.push(value);
          }
        }
      }
    };
  }

  const component = new ReleaseTestComponent({});
  const state = new ComponentState(component);
  component.internalState = state;

  const olderLoad = makePromise();
  const newerLoad = makePromise();
  state.setAsyncProps({resource: olderLoad});
  state.setAsyncProps({resource: newerLoad});

  // The newer request completes first
  newerLoad.resolve('newer');
  await delay(0);
  const current = state.getAsyncProp('resource');
  expect(current, 'newer value is resolved').toEqual({source: 'newer'});

  // The older request completes afterwards and must be ignored entirely
  olderLoad.resolve('older');
  await delay(0);
  expect(state.getAsyncProp('resource'), 'stale value is discarded').toBe(current);
  expect(released, 'current value is not released by a stale load').not.toContain(current);
  expect(transformed, 'stale value is not transformed').toEqual(['newer']);
});

webglTest('ComponentState#async props with transform', async () => {
  const testContext = {device};

  const testData = [0, 1, 2, 3, 4];
  // biome-ignore format: preserve layout
  const testImage = {data: new Uint8ClampedArray([
    0, 0, 0, 255,
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255
  ]), width: 2, height: 2};

  // @ts-expect-error
  const state = new ComponentState();

  // Simulate Layer class
  const makeComponent = (props: Record<string, unknown>) => {
    const comp = new TestComponent(props);
    comp.internalState = state;
    // @ts-expect-error
    comp.context = testContext;

    state.component = comp;
    state.setAsyncProps(comp.props);

    return comp;
  };

  // Synchronous value for async prop
  let component = makeComponent({
    data: testData,
    dataTransform: d => d.slice(0, 2),
    image: testImage
  });

  let image = component.props.image;
  let data = component.props.data;
  expect(data, 'Synchronous value for data should be transformed').toEqual([0, 1]);
  expect(image.handle, 'Synchronous value for image should be transformed').toBeTruthy();

  component = makeComponent({
    data: testData,
    dataTransform: d => d.slice(0, 2),
    image: testImage
  });
  expect(component.props.data, 'Unchanged data value is not transformed again').toBe(data);
  expect(component.props.image, 'Unchanged image value is not transformed again').toBe(image);

  component = makeComponent({
    data,
    dataTransform: d => d.slice(0, 2),
    image
  });
  expect(component.props.data, 'Unchanged data value is not transformed again').toBe(data);
  expect(component.props.image, 'Unchanged image value is not transformed again').toBe(image);

  // Async value for async prop
  const testDataAsync = Promise.resolve(testData);
  const testImageAsync = Promise.resolve(testImage);
  component = makeComponent({
    data: testDataAsync,
    dataTransform: d => d.slice(0, 2),
    image: testImageAsync
  });

  await testDataAsync;
  data = component.props.data;
  expect(data, 'Async value for data should be transformed').toEqual([0, 1]);

  await testImageAsync;
  expect(image.destroyed, 'Last texture is deleted').toBeTruthy();
  image = component.props.image;
  expect(image, 'Async value for image should be transformed').toBeTruthy();

  const loadDataAsync = load('./test/data/bart-stations.csv', [CSVLoader], {
    csv: {shape: 'object-row-table'}
  });
  component = makeComponent({
    data: loadDataAsync,
    image: testImageAsync
  });

  await loadDataAsync;
  expect(component.props.image, 'Unchanged image value is not transformed again').toBe(image);
  data = component.props.data;
  expect(Array.isArray(data), 'loaders.gl table object is properly transformed').toBeTruthy();

  state.finalize();
  expect(image.destroyed, 'Texture is deleted on finalization').toBeTruthy();
});
