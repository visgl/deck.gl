// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Layer, LayerExtension} from '@deck.gl/core';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {Model} from '@luma.gl/engine';

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

MockExtension.extensionName = 'MockExtension';

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
  const assert = (cond, msg) => expect(cond, msg).toBeTruthy();
  const extension0 = new MockExtension({
    fp64: true,
    assert
  });
  const extension1 = new MockExtension({
    fp64: true,
    assert
  });
  const extension2 = new MockExtension({
    fp64: false,
    assert
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
          expect(instancePickingColors, 'default picking buffer is not registered').toBeUndefined();
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
          expect(instancePickingColors, 'extension does not force picking buffer').toBeUndefined();
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
  const assert = (cond, msg) => expect(cond, msg).toBeTruthy();
  const extension = new MockExtension({assert});

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

test('LayerExtension#legacy inject fields reach the assembled shader', () => {
  const TINT = 'color.rgb = vec3(1.0, 0.0, 0.0);';
  const FADE = 'color.a *= 0.5;';

  class LegacyInjectExtension extends LayerExtension {
    static extensionName = 'LegacyInjectExtension';

    getShaders() {
      return {
        modules: [{name: 'legacy-tint', inject: {'fs:DECKGL_FILTER_COLOR': TINT}}],
        inject: {'fs:DECKGL_FILTER_COLOR': FADE}
      };
    }
  }

  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {
        props: {
          id: 'legacy-inject-layer',
          data: [0, 1, 2],
          getPosition: d => [d, 0],
          extensions: [new LegacyInjectExtension()]
        },
        onAfterUpdate: ({layer}) => {
          const {source} = layer.getModels()[0].pipeline.fs;
          expect(source, 'module inject is assembled').toContain(TINT);
          expect(source, 'getShaders inject is assembled').toContain(FADE);
        }
      }
    ]
  });
});

test('LayerExtension#ordered legacy inject entries survive the merge with the layer inject', () => {
  const FADE = 'fragColor.a *= 0.5;';
  const TINT = 'fragColor.rgb = vec3(1.0, 0.0, 0.0);';
  const FLATTEN = 'gl_Position.z = 0.0;';

  // A deck.gl 9 style layer: it passes `inject` to Layer.getShaders
  class LegacyInjectLayer extends Layer {
    static layerName = 'LegacyInjectLayer';

    initializeState() {
      this.setState({
        model: new Model(this.context.device, {...this.getShaders(), vertexCount: 3})
      });
    }

    getShaders() {
      return super.getShaders({
        vs: `\
#version 300 es
void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
`,
        fs: `\
#version 300 es
precision highp float;
out vec4 fragColor;
void main(void) {
  fragColor = vec4(1.0);
}
`,
        inject: {'fs:#main-end': FADE}
      });
    }
  }

  class OrderedInjectExtension extends LayerExtension {
    static extensionName = 'OrderedInjectExtension';

    getShaders() {
      return {
        inject: {
          // The same key as the layer, and a key that only the extension has
          'fs:#main-end': {injection: TINT, order: -1},
          'vs:#main-end': {injection: FLATTEN, order: 1}
        }
      };
    }
  }

  testLayer({
    Layer: LegacyInjectLayer,
    testCases: [
      {
        props: {
          id: 'ordered-inject-layer',
          data: [],
          extensions: [new OrderedInjectExtension()]
        },
        onAfterUpdate: ({layer}) => {
          const {vs, fs} = layer.state.model.pipeline;
          expect(fs.source, 'no object is written as text').not.toContain('[object Object]');
          expect(vs.source, 'no object is written as text').not.toContain('[object Object]');
          expect(fs.source, 'layer inject is assembled').toContain(FADE);
          expect(fs.source, 'ordered extension inject is assembled').toContain(TINT);
          expect(vs.source, 'extension-only inject is assembled').toContain(FLATTEN);
          expect(fs.source.indexOf(TINT), 'order -1 is before order 0').toBeLessThan(
            fs.source.indexOf(FADE)
          );
        }
      }
    ]
  });
});
