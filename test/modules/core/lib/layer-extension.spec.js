import test from 'tape-catch';
import {Layer, LayerExtension} from '@deck.gl/core';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

class MockExtension extends LayerExtension {
  getShaders() {
    return {modules: [{name: 'empty-module', vs: ''}]};
  }
  initializeState(context, extension) {
    extension.opts.assert(this instanceof Layer, 'initializeState: Self is layer instance');
    extension.opts.assert(context.gl, 'initializeState: context received');

    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.addInstanced({
        instanceValues: {
          size: 1,
          accessor: 'ext_getValue'
        }
      });
    }

    MockExtension.initializeCalled++;
  }
  updateState(updateParams, extension) {
    extension.opts.assert(this instanceof Layer, 'updateState: Self is layer instance');
    extension.opts.assert(updateParams.changeFlags, 'updateState: changeFlags received');

    MockExtension.updateCalled++;
  }
  finalizeState(extension) {
    extension.opts.assert(this instanceof Layer, 'finalizeState: Self is layer instance');

    MockExtension.finalizeCalled++;
  }
}

MockExtension.defaultProps = {
  ext_getValue: {type: 'accessor', value: 0},
  ext_enabled: false
};

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
          ext_getValue: 0,
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

test('LayerExtension#CompositeLayer passthrough', t => {
  const extension = new MockExtension({assert: t.ok});

  MockExtension.resetStats();

  testLayer({
    Layer: GeoJsonLayer,
    testCases: [
      {
        props: {
          id: 'test-layer',
          data: [
            {
              type: 'Feature',
              geometry: {type: 'Point', coordinates: [-122, 38]},
              properties: {value: 1}
            },
            {
              type: 'Feature',
              geometry: {type: 'Point', coordinates: [-122, 38]},
              properties: {value: 2}
            }
          ],
          ext_enabled: true,
          ext_getValue: 0,
          updateTriggers: {
            ext_getValue: 'v0'
          },
          extensions: [extension]
        },
        onAfterUpdate: ({subLayer}) => {
          t.is(
            MockExtension.initializeCalled,
            2,
            'initializeState called by parent and sub layers'
          );
          t.is(MockExtension.updateCalled, 2, 'updateState called by parent and sub layers');
          t.is(MockExtension.finalizeCalled, 0, 'finalizeState called');

          t.is(subLayer.props.ext_enabled, true, 'ext_enabled prop is passed through');
          t.is(
            subLayer.props.updateTriggers.ext_getValue,
            'v0',
            'ext_getValue updateTrigger is passed through'
          );

          const {instanceValues} = subLayer.getAttributeManager().getAttributes();
          t.deepEqual(instanceValues.value, [0], 'attribute is populated');
        }
      },
      {
        updateProps: {
          ext_getValue: f => f.properties.value,
          updateTriggers: {
            ext_getValue: 'v1'
          }
        },
        onAfterUpdate: ({subLayer}) => {
          t.is(MockExtension.initializeCalled, 2, 'initializeState not called');
          t.is(MockExtension.updateCalled, 4, 'updateState called by parent and sub layers');
          t.is(MockExtension.finalizeCalled, 0, 'finalizeState not called');

          t.is(
            subLayer.props.updateTriggers.ext_getValue,
            'v1',
            'ext_getValue updateTrigger is passed through'
          );

          const {instanceValues} = subLayer.getAttributeManager().getAttributes();
          t.deepEqual(instanceValues.value.slice(0, 2), [1, 2], 'attribute is populated');
        }
      }
    ],
    onError: t.notOk
  });

  t.is(MockExtension.finalizeCalled, 2, 'finalizeState called');

  t.end();
});
