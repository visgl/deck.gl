// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// loaders.gl, MIT license

import {test, expect} from 'vitest';
import {_ComponentState as ComponentState, _Component as Component} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

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

test('ComponentState#finalize', async () => {
  const component = new TestComponent({});
  // @ts-expect-error
  component.internalState = new ComponentState(component);
  // @ts-expect-error
  const state = component.internalState;
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
  // @ts-expect-error
  component.internalState = new ComponentState(component);
  // @ts-expect-error
  const state = component.internalState;
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
  // @ts-expect-error
  component.internalState = new ComponentState(component);
  // @ts-expect-error
  const state = component.internalState;
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

test('ComponentState#async props with transform', async () => {
  const testContext = {device};

  const testData = [0, 1, 2, 3, 4];
  // prettier-ignore
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
    // @ts-expect-error
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

  const loadDataAsync = load('./test/data/bart-stations.csv', [CSVLoader]);
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
