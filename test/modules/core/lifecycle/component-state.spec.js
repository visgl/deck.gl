import test from 'tape-catch';
import ComponentState from '@deck.gl/core/lifecycle/component-state';

test('ComponentState#imports', t => {
  t.ok(ComponentState, 'ComponentState import ok');
  t.end();
});

test('ComponentState#synchronous async props', t => {
  const state = new ComponentState();
  t.ok(state, 'ComponentState construction ok');
  t.end();
});
