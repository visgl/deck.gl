import test from 'tape-catch';
import ComponentState from '@deck.gl/core/lifecycle/component-state';
import Component from '@deck.gl/core/lifecycle/component';
import {gl} from '@deck.gl/test-utils';

const EMPTY_ARRAY = Object.freeze([]);

const defaultProps = {
  // data: Special handling for null, see below
  data: {type: 'data', value: EMPTY_ARRAY, async: true},
  dataTransform: data => data,
  image: {type: 'image', value: null, async: true}
};

class TestComponent extends Component {}

TestComponent.componentName = 'TestComponent';
TestComponent.defaultProps = defaultProps;

function makePromise() {
  const resolvers = {};
  const promise = new Promise((resolve, reject) => {
    resolvers.resolve = resolve;
    resolvers.reject = reject;
  });
  return Object.assign(promise, resolvers);
}

// const setAsyncProps = ComponentState.prototype.setAsyncProps;
// ComponentState.prototype.setAsyncProps = function setAsyncPropsTest(props) {
//   props._asyncPropResolvedValues = props._asyncPropResolvedValues || {};
//   props._asyncPropOriginalValues = props._asyncPropOriginalValues || props;
//   props._asyncPropDefaultlValues = props._asyncPropDefaultValues || {data: []};
//   setAsyncProps.call(this, props);
// }

test('ComponentState#imports', t => {
  t.ok(ComponentState, 'ComponentState import ok');
  t.end();
});

test('ComponentState#synchronous async props', t => {
  const component = new Component();
  component._initState();
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

test('ComponentState#asynchronous async props', t => {
  const state = new ComponentState();
  t.ok(state, 'ComponentState construction ok');

  const loadPromise1 = makePromise();
  const loadPromise2 = makePromise();
  const loadPromise3 = makePromise();

  Promise.resolve()
    .then(_ => {
      t.equals(
        state.hasAsyncProp('data'),
        false,
        'ComponentState.hasAsyncProp returned correct value'
      );
      state.setAsyncProps({data: loadPromise1});
      t.equals(
        state.hasAsyncProp('data'),
        true,
        'ComponentState.hasAsyncProp returned correct value'
      );
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
    })
    .then(_ => {
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
    })
    .then(_ => {
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
    })
    .then(_ => {
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
    })
    .then(_ => t.end())
    .catch(_ => t.end());
});

test('ComponentState#async props with transform', t => {
  const testContext = {gl};

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
  const makeComponent = (props, onAsyncPropUpdated) => {
    const comp = new TestComponent(props);
    comp.internalState = state;
    comp.context = testContext;

    state.component = comp;
    state.setAsyncProps(comp.props);
    state.onAsyncPropUpdated = onAsyncPropUpdated || (() => {});

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
    (propName, value) => {
      if (propName === 'image') {
        t.notOk(image.handle, 'Last texture is deleted');
        image = component.props.image;
        t.ok(image, 'Async value for image should be transformed');
      }
      if (propName === 'data') {
        data = component.props.data;
        t.deepEqual(data, [0, 1], 'Async value for data should be transformed');
      }

      if (!state.isAsyncPropLoading()) {
        state.finalize();
        t.notOk(image.handle, 'Texture is deleted on finalization');

        t.end();
      }
    }
  );
});
