import test from 'tape-catch';
import ComponentState from '@deck.gl/core/lifecycle/component-state';
import Component from '@deck.gl/core/lifecycle/component';

/* global fetch */
const EMPTY_ARRAY = Object.freeze([]);

const defaultProps = {
  // data: Special handling for null, see below
  data: {type: 'data', value: EMPTY_ARRAY, async: true},
  dataComparator: null,
  dataTransform: data => data,
  fetch: url => fetch(url).then(response => response.json())
};

class TestComponent extends Component {
  constructor(...props) {
    super(...props);
  }
}

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
