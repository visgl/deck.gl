// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
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

  finalizeState(context, extension) {
    extension.opts.assert(this instanceof Layer, 'finalizeState: Self is layer instance');

    MockExtension.finalizeCalled++;
  }

  getNeedsPickingBuffer() {
    return this.props.ext_pickable;
  }
}

MockExtension.defaultProps = {
  ext_getValue: {type: 'accessor', value: 0},
  ext_enabled: false,
  ext_pickable: false
};

MockExtension.resetStats = () => {
  MockExtension.initializeCalled = 0;
  MockExtension.updateCalled = 0;
  MockExtension.finalizeCalled = 0;
};

test('LayerExtension', () => {
  const extension0 = new MockExtension({
    fp64: true,
    assert: (cond, msg) => expect(cond).toBeTruthy()
  });
  const extension1 = new MockExtension({
    fp64: true,
    assert: (cond, msg) => expect(cond).toBeTruthy()
  });
  const extension2 = new MockExtension({
    fp64: false,
    assert: (cond, msg) => expect(cond).toBeTruthy()
  });

  MockExtension.resetStats();

  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {
        props: {
          id: 'test-layer',
          data: [0, 1, 2],
          ext_getValue: 0,
          extensions: [extension0]
        },
        onAfterUpdate: ({layer}) => {
          expect(MockExtension.initializeCalled, 'initializeState called').toBe(1);
          expect(MockExtension.updateCalled, 'updateState called').toBe(1);
          expect(MockExtension.finalizeCalled, 'finalizeState called').toBe(0);

          const {instancePickingColors} = layer.getAttributeManager().getAttributes();
          expect(instancePickingColors.state.constant, 'picking buffer is disabled').toBeTruthy();
        }
      },
      {
        updateProps: {
          extensions: [extension1]
        },
        onAfterUpdate: ({layer}) => {
          expect(MockExtension.initializeCalled, 'initializeState not called').toBe(1);
          expect(MockExtension.updateCalled, 'updateState not called').toBe(1);
          expect(MockExtension.finalizeCalled, 'finalizeState not called').toBe(0);
        }
      },
      {
        updateProps: {
          ext_pickable: true
        },
        onAfterUpdate: ({layer}) => {
          expect(MockExtension.initializeCalled, 'initializeState not called').toBe(1);
          expect(MockExtension.updateCalled, 'updateState not called').toBe(2);
          expect(MockExtension.finalizeCalled, 'finalizeState not called').toBe(0);

          const {instancePickingColors} = layer.getAttributeManager().getAttributes();
          expect(instancePickingColors.state.constant, 'picking buffer is enabled').toBeFalsy();
        }
      },
      {
        updateProps: {
          extensions: [extension2]
        },
        onAfterUpdate: () => {
          expect(MockExtension.initializeCalled, 'initializeState not called').toBe(1);
          expect(MockExtension.updateCalled, 'updateState called').toBe(3);
          expect(MockExtension.finalizeCalled, 'finalizeState not called').toBe(0);
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });

  expect(MockExtension.finalizeCalled, 'finalizeState called').toBe(1);
});

test('LayerExtension#CompositeLayer passthrough', () => {
  const extension = new MockExtension({assert: (cond, msg) => expect(cond).toBeTruthy()});

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
          expect(
            MockExtension.initializeCalled,
            'initializeState called by parent and sub layers'
          ).toBe(2);
          expect(MockExtension.updateCalled, 'updateState called by parent and sub layers').toBe(2);
          expect(MockExtension.finalizeCalled, 'finalizeState called').toBe(0);

          expect(subLayer.props.ext_enabled, 'ext_enabled prop is passed through').toBe(true);
          expect(
            subLayer.props.updateTriggers.ext_getValue,
            'ext_getValue updateTrigger is passed through'
          ).toBe('v0');

          const {instanceValues} = subLayer.getAttributeManager().getAttributes();
          expect(instanceValues.value, 'attribute is populated').toEqual([0]);
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
          expect(MockExtension.initializeCalled, 'initializeState not called').toBe(2);
          expect(MockExtension.updateCalled, 'updateState called by parent and sub layers').toBe(4);
          expect(MockExtension.finalizeCalled, 'finalizeState not called').toBe(0);

          expect(
            subLayer.props.updateTriggers.ext_getValue,
            'ext_getValue updateTrigger is passed through'
          ).toBe('v1');

          const {instanceValues} = subLayer.getAttributeManager().getAttributes();
          expect(instanceValues.value.slice(0, 2), 'attribute is populated').toEqual([1, 2]);
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });

  expect(MockExtension.finalizeCalled, 'finalizeState called').toBe(2);
});
