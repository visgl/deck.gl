// loaders.gl, MIT license

import test from 'tape-promise/tape';
import {_ComponentState as ComponentState, _Component as Component} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils';

const EMPTY_ARRAY = Object.freeze([]);

type TestComponentProps = {
  data?: any;
  dataTransform?: (any) => any;
  image?: any;
};

const defaultProps = {
  // data: Special handling for null, see below
  data: {type: 'data', value: EMPTY_ARRAY, async: true},
  dataTransform: data => data,
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

test('ComponentState#imports', t => {
  t.ok(ComponentState, 'ComponentState import ok');
  t.end();
});

test('ComponentState#finalize', async t => {
  const component = new TestComponent({});
  // @ts-expect-error
  component.internalState = new ComponentState(component);
  // @ts-expect-error
  const state = component.internalState;
  t.is(state.component, component, 'state.component is present');

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
  t.ok(updateCallbackCalled['data'], 'onAsyncPropUpdated callback is called for data');
  t.notOk(state.isAsyncPropLoading('A'), 'A is loaded');

  state.finalize();
  loadPromiseB.resolve([]);
  await delay(0);
  t.notOk(updateCallbackCalled['image'], 'onAsyncPropUpdated callback is not called for image');

  t.notOk(state.component, 'state.component is dereferenced');

  t.end();
});

test('ComponentState#synchronous async props', t => {
  const component = new Component();
  // @ts-expect-error
  component.internalState = new ComponentState(component);
  // @ts-expect-error
  const state = component.internalState;
  t.ok(state, 'ComponentState construction ok');

  t.equals(state.hasAsyncProp('data'), false, 'ComponentState.hasAsyncProp returned correct value');
  state.setAsyncProps({data: []});
  state.setAsyncProps({data: []});
  t.equals(state.hasAsyncProp('data'), true, 'ComponentState.hasAsyncProp returned correct value');
  t.deepEquals(
    state.getAsyncProp('data'),
    [],
    'ComponentState.getAsyncProp returned correct value'
  );
  t.end();
});

test('ComponentState#asynchronous async props', async t => {
  const component = new Component();
  // @ts-expect-error
  component.internalState = new ComponentState(component);
  // @ts-expect-error
  const state = component.internalState;
  t.ok(state, 'ComponentState construction ok');

  const loadPromise1 = makePromise();
  const loadPromise2 = makePromise();
  const loadPromise3 = makePromise();

  t.equals(state.hasAsyncProp('data'), false, 'ComponentState.hasAsyncProp returned correct value');
  state.setAsyncProps({data: loadPromise1});
  t.equals(state.hasAsyncProp('data'), true, 'ComponentState.hasAsyncProp returned correct value');
  state.setAsyncProps({data: loadPromise1});
  t.equals(
    state.isAsyncPropLoading('data'),
    true,
    'ComponentState.isAsyncPropLoading returned correct value'
  );
  loadPromise1.resolve([1]);
  t.equals(
    state.isAsyncPropLoading('data'),
    true,
    'ComponentState.isAsyncPropLoading returned correct value'
  );

  await delay(0);

  t.equals(
    state.isAsyncPropLoading('data'),
    false,
    'ComponentState.isAsyncPropLoading returned correct value'
  );
  t.deepEquals(
    state.getAsyncProp('data'),
    [1],
    'ComponentState.getAsyncProp returned correct value'
  );
  state.setAsyncProps({data: loadPromise2});
  state.setAsyncProps({data: loadPromise3});
  loadPromise3.resolve([3]);
  t.equals(
    state.isAsyncPropLoading('data'),
    true,
    'ComponentState.isAsyncPropLoading returned correct value'
  );
  t.deepEquals(
    state.getAsyncProp('data'),
    [1],
    'ComponentState.getAsyncProp returned correct value'
  );

  await delay(0);

  t.equals(
    state.isAsyncPropLoading('data'),
    false,
    'ComponentState.isAsyncPropLoading returned correct value'
  );
  t.deepEquals(
    state.getAsyncProp('data'),
    [3],
    'ComponentState.getAsyncProp returned correct value'
  );
  loadPromise2.resolve([2]);

  await delay(0);

  t.equals(
    state.isAsyncPropLoading('data'),
    false,
    'ComponentState.isAsyncPropLoading returned correct value'
  );
  t.deepEquals(
    state.getAsyncProp('data'),
    [3],
    'ComponentState.getAsyncProp returned correct value'
  );

  t.end();
});

// TODO - disabled for v9
test('ComponentState#async props with transform', t => {
  const testContext = {device};

  const testData = [0, 1, 2, 3, 4];
  // prettier-ignore
  const testImage = {data: new Uint8ClampedArray([
    0, 0, 0, 255,
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255
  ]), width: 2, height: 2};

  const state = new ComponentState();

  // Simulate Layer class
  const makeComponent = (props: Record<string, unknown>, onAsyncPropUpdated = () => {}) => {
    const comp = new TestComponent(props);
    // @ts-expect-error
    comp.internalState = state;
    // @ts-expect-error
    comp.context = testContext;

    state.component = comp;
    state.setAsyncProps(comp.props);
    state.onAsyncPropUpdated = onAsyncPropUpdated;

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
  t.deepEqual(data, [0, 1], 'Synchronous value for data should be transformed');
  t.ok(image.handle, 'Synchronous value for image should be transformed');

  component = makeComponent({
    data: testData,
    dataTransform: d => d.slice(0, 2),
    image: testImage
  });
  t.is(component.props.data, data, 'Unchanged data value is not transformed again');
  t.is(component.props.image, image, 'Unchanged image value is not transformed again');

  component = makeComponent({
    data,
    dataTransform: d => d.slice(0, 2),
    image
  });
  t.is(component.props.data, data, 'Unchanged data value is not transformed again');
  t.is(component.props.image, image, 'Unchanged image value is not transformed again');

  // Async value for async prop
  component = makeComponent(
    {
      data: Promise.resolve(testData),
      dataTransform: d => d.slice(0, 2),
      image: Promise.resolve(testImage)
    },
    // @ts-expect-error
    (propName, value) => {
      if (propName === 'image') {
        t.ok(image.destroyed, 'Last texture is deleted');
        image = component.props.image;
        t.ok(image, 'Async value for image should be transformed');
      }
      if (propName === 'data') {
        data = component.props.data;
        t.deepEqual(data, [0, 1], 'Async value for data should be transformed');
      }

      // @ts-expect-error
      if (!state.isAsyncPropLoading()) {
        // @ts-expect-error
        state.finalize();
        t.ok(image.destroyed, 'Texture is deleted on finalization');

        t.end();
      }
    }
  );
});
