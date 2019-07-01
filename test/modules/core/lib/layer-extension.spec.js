import test from 'tape-catch';
import {LayerExtension} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

class MockExtension extends LayerExtension {
  getShaders() {
    return {modules: [{name: 'empty-module', vs: ''}]};
  }
  initializeState(context, opts) {
    opts.assert(this.id === 'test-layer', 'initializeState: Self is layer instance');
    opts.assert(context.gl, 'initializeState: context received');

    MockExtension.initializeCalled++;
  }
  updateState(updateParams, opts) {
    opts.assert(this.id === 'test-layer', 'updateState: Self is layer instance');
    opts.assert(updateParams.changeFlags, 'updateState: changeFlags received');

    MockExtension.updateCalled++;
  }
  finalizeState(opts) {
    opts.assert(this.id === 'test-layer', 'finalizeState: Self is layer instance');

    MockExtension.finalizeCalled++;
  }
}

MockExtension.resetStats = () => {
  MockExtension.initializeCalled = 0;
  MockExtension.updateCalled = 0;
  MockExtension.finalizeCalled = 0;
};

test('LayerExtension', t => {
  const extension0 = new MockExtension({fp64: true, assert: t.ok});
  const extension1 = new MockExtension({fp64: true, assert: t.ok});
  const extension2 = new MockExtension({fp64: false, assert: t.ok});

  MockExtension.resetStats();

  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {
        props: {
          id: 'test-layer',
          data: [],
          extensions: [extension0]
        },
        onAfterUpdate: () => {
          t.is(MockExtension.initializeCalled, 1, 'initializeState called');
          t.is(MockExtension.updateCalled, 1, 'updateState called');
          t.is(MockExtension.finalizeCalled, 0, 'finalizeState called');
        }
      },
      {
        updateProps: {
          extensions: [extension1]
        },
        onAfterUpdate: () => {
          t.is(MockExtension.initializeCalled, 1, 'initializeState not called');
          t.is(MockExtension.updateCalled, 1, 'updateState not called');
          t.is(MockExtension.finalizeCalled, 0, 'finalizeState not called');
        }
      },
      {
        updateProps: {
          extensions: [extension2]
        },
        onAfterUpdate: () => {
          t.is(MockExtension.initializeCalled, 1, 'initializeState not called');
          t.is(MockExtension.updateCalled, 2, 'updateState called');
          t.is(MockExtension.finalizeCalled, 0, 'finalizeState not called');
        }
      }
    ],
    onError: t.notOk
  });

  t.is(MockExtension.finalizeCalled, 1, 'finalizeState called');

  t.end();
});
