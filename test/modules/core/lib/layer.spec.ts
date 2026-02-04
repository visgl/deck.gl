// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  Layer,
  LayerExtension,
  AttributeManager,
  COORDINATE_SYSTEM,
  MapView,
  OrbitView,
  picking
} from '@deck.gl/core';
import {testInitializeLayer, testLayer, testLayerAsync} from '@deck.gl/test-utils';
import {equals, Matrix4} from '@math.gl/core';
import {Timeline, Model} from '@luma.gl/engine';

import {sleep, testAsyncData} from './async-iterator-test-utils';

const dataVariants = [{data: ['a', 'b', 'c'], size: 3}];

const LAYER_PROPS = {
  id: 'testLayer',
  data: [],
  updateTriggers: {}
};

const LAYER_CONSTRUCT_TEST_CASES = [
  {
    title: 'Default id',
    props: {data: null},
    id: 'Layer'
  },
  {
    title: 'Null data',
    props: {id: 'testLayer', data: null}
  },
  {
    title: 'Empty data',
    props: {id: 'testLayer', data: []}
  },
  {
    title: 'With data object',
    props: {id: 'testLayer', data: {a: 'a', b: 'b', c: 'c'}}
  },
  {
    title: 'With data map',
    props: {
      id: 'testLayer',
      data: new Map([
        ['a', 'a'],
        ['b', 'b'],
        ['c', 'c']
      ])
    }
  }
];

const LAYER_CONSTRUCT_MULTIPROP_TEST_CASES = [
  {
    title: 'With multiple prop objects',
    props: [{data: {a: 'a', b: 'b', c: 'c'}}, {id: 'testLayer'}]
  }
];

class SubLayer extends Layer {
  initializeState() {
    this.state.attributeManager.addInstanced({
      time: {size: 1, accessor: 'getTime', defaultValue: 0, update: this.calculateTime}
    });
  }
}

SubLayer.layerName = 'SubLayer';
SubLayer.defaultProps = {
  getTime: {type: 'accessor', value: x => x.time},
  getColor: {type: 'accessor', value: [0, 0, 0, 255]},
  sizeScale: {type: 'function', value: x => 1, optional: true}
};

class SubLayer2 extends Layer {
  initializeState() {}
}

SubLayer2.layerName = 'SubLayer2';

class SubLayer3 extends Layer {
  initializeState() {}
}

SubLayer3.layerName = 'SubLayer2';

class Extension extends LayerExtension {}
Extension.extensionName = 'LayerExtension';
Extension.defaultProps = {
  extEnabled: true,
  getExtValue: {type: 'accessor', value: 1}
};

test('Layer#constructor', () => {
  for (const tc of LAYER_CONSTRUCT_TEST_CASES) {
    const layer = Array.isArray(tc.props) ? new Layer(...tc.props) : new Layer(tc.props);
    expect(layer, `Layer created ${tc.title}`).toBeTruthy();
    const props = Array.isArray(tc.props) ? tc.props[0] : tc.props;
    const expectedId = props.id || tc.id;
    expect(layer.id, 'Layer id set correctly').toBe(expectedId);
    expect(layer.props, 'Layer props not null').toBeTruthy();
  }
});

test('Layer#clone', () => {
  const layer = new SubLayer({id: 'test-layer', data: [0, 1]});
  const newLayer = layer.clone({pickable: true});

  expect(newLayer.constructor.name, 'cloned layer has correct type').toBe('SubLayer');
  expect(newLayer.props.id, 'cloned layer has correct id').toBe('test-layer');
  expect(newLayer.props.data, 'cloned layer has correct data').toEqual([0, 1]);
});

test('Layer#constructor(multi prop objects)', () => {
  for (const tc of LAYER_CONSTRUCT_MULTIPROP_TEST_CASES) {
    const layer = new Layer(...tc.props);
    expect(layer, `Layer created ${tc.title}`).toBeTruthy();
    const props = Object.assign({}, ...tc.props);
    const expectedId = props.id || tc.id;
    expect(layer.id, 'Layer id set correctly').toBe(expectedId);
    expect(layer.props, 'Layer props not null').toBeTruthy();
  }
});

test('SubLayer#constructor', () => {
  const layer = new SubLayer(LAYER_PROPS);
  expect(layer, 'SubLayer created').toBeTruthy();
  const defaultProps = SubLayer._mergedDefaultProps;
  expect(layer.props.onHover, 'Layer defaultProps found').toBe(defaultProps.onHover);
  expect(layer.props.getColor, 'SubLayer defaultProps found').toBe(defaultProps.getColor);
});

test('SubLayer2#constructor (no defaultProps)', () => {
  const layer = new SubLayer2(LAYER_PROPS);
  expect(layer, 'SubLayer2 created').toBeTruthy();
});

test('SubLayer3#constructor (no layerName, no defaultProps)', () => {
  const layer = new SubLayer3(LAYER_PROPS);
  expect(layer, 'SubLayer3 created').toBeTruthy();
});

test('Layer#getNumInstances', () => {
  for (const dataVariant of dataVariants) {
    const layer = new Layer(LAYER_PROPS, {data: dataVariant.data});
    expect(layer.getNumInstances()).toBe(dataVariant.size);
  }
});

test('Layer#validateProps', () => {
  let layer = new SubLayer(LAYER_PROPS);
  layer.validateProps();
  console.log('Layer props are valid');

  layer = new SubLayer(LAYER_PROPS, {sizeScale: 1});
  expect(() => layer.validateProps(), /sizeScale/).toThrow();

  layer = new SubLayer(LAYER_PROPS, {opacity: 'transparent'});
  expect(() => layer.validateProps(), /opacity/).toThrow();

  layer = new SubLayer(LAYER_PROPS, {opacity: 2});
  expect(() => layer.validateProps(), /opacity/).toThrow();

  layer = new SubLayer(LAYER_PROPS, {getColor: [255, 0, 0]});
  layer.validateProps();
  console.log('Layer props are valid');

  layer = new SubLayer(LAYER_PROPS, {getColor: d => d.color});
  layer.validateProps();
  console.log('Layer props are valid');

  layer = new SubLayer(LAYER_PROPS, {getColor: 3});
  expect(() => layer.validateProps(), /getColor/).toThrow();

  layer = new SubLayer(LAYER_PROPS, {sizeScale: null});
  layer.validateProps();
  console.log('Layer props are valid');

  layer = new SubLayer(LAYER_PROPS, {sizeScale: [1, 10]});
  expect(() => layer.validateProps(), /sizeScale/).toThrow();
});

// eslint-disable-next-line max-statements
test('Layer#diffProps', () => {
  let layer = new SubLayer(LAYER_PROPS);
  expect(
    () => testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()}),
    'Layer initialized OK'
  ).not.toThrow();

  layer._diffProps(new SubLayer(LAYER_PROPS).props, layer.props);
  expect(layer.getChangeFlags().somethingChanged, 'same props').toBeFalsy();

  layer._diffProps(new SubLayer(LAYER_PROPS, {data: dataVariants[0]}).props, layer.props);
  expect(layer.getChangeFlags().dataChanged, 'data changed').toBeTruthy();

  layer._diffProps(new SubLayer(LAYER_PROPS, {size: 0}).props, layer.props);
  expect(layer.getChangeFlags().propsChanged, 'props changed').toBeTruthy();

  // Dummy attribute manager to avoid diffUpdateTriggers failure
  layer._diffProps(new SubLayer(LAYER_PROPS, {updateTriggers: {time: 100}}).props, layer.props);
  expect(layer.getChangeFlags().propsOrDataChanged, 'props changed').toBeTruthy();

  const spy = vi.spyOn(AttributeManager.prototype, 'invalidate');
  layer._diffProps(
    new SubLayer(LAYER_PROPS, {updateTriggers: {time: {version: 0}}}).props,
    layer.props
  );
  expect(spy, 'updateTriggers fired').toHaveBeenCalled();
  spy.mockRestore();

  layer = new SubLayer(LAYER_PROPS, {updateTriggers: {time: 0}});
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});
  layer._diffProps(new SubLayer(LAYER_PROPS, {updateTriggers: {time: 0}}).props, layer.props);
  expect(layer.getChangeFlags().updateTriggersChanged, 'updateTriggers not fired').toBeFalsy();

  layer = new SubLayer(LAYER_PROPS, {updateTriggers: {time: 0}});
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});
  layer._diffProps(new SubLayer(LAYER_PROPS, {updateTriggers: {time: 1}}).props, layer.props);
  expect(layer.getChangeFlags().updateTriggersChanged, 'updateTriggersChanged fired').toBeTruthy();

  layer = new SubLayer(LAYER_PROPS, {updateTriggers: {time: 0}});
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});
  layer._diffProps(new SubLayer(LAYER_PROPS, {updateTriggers: {time: null}}).props, layer.props);
  expect(layer.getChangeFlags().updateTriggersChanged, 'updateTriggersChanged fired').toBeTruthy();

  layer = new SubLayer(LAYER_PROPS, {updateTriggers: {time: 0}});
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});
  layer._diffProps(
    new SubLayer(LAYER_PROPS, {updateTriggers: {time: undefined}}).props,
    layer.props
  );
  expect(layer.getChangeFlags().updateTriggersChanged, 'updateTriggersChanged fired').toBeTruthy();
});

test('Layer#diffProps#extensions', () => {
  let layer = new SubLayer(LAYER_PROPS);
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});

  layer._diffProps(
    new SubLayer(LAYER_PROPS, {getExtValue: _ => 1, extensions: [new Extension()]}).props,
    layer.props
  );
  expect(layer.getChangeFlags().extensionsChanged, 'extensionsChanged').toBeTruthy();
  layer.finalizeState();

  layer = new SubLayer(LAYER_PROPS, {getExtValue: _ => 1, extensions: [new Extension()]});
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});

  layer._diffProps(
    new SubLayer(LAYER_PROPS, {randomProp: _ => 2, extensions: [new Extension()]}).props,
    layer.props
  );
  expect(layer.getChangeFlags().propsChanged, 'undefined prop changed').toBeTruthy();
  layer._clearChangeFlags();

  layer._diffProps(
    new SubLayer(LAYER_PROPS, {getExtValue: _ => 2, extensions: [new Extension()]}).props,
    layer.props
  );
  expect(layer.getChangeFlags().somethingChanged, 'extension accessor change ignored').toBeFalsy();

  layer.finalizeState();
});

test('Layer#use64bitPositions', () => {
  let layer = new SubLayer({});
  expect(layer.use64bitPositions(), 'returns true for default settings').toBeTruthy();

  layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.LNGLAT});
  expect(layer.use64bitPositions(), 'returns true for COORDINATE_SYSTEM.LNGLAT').toBeTruthy();

  layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.CARTESIAN});
  expect(layer.use64bitPositions(), 'returns true for COORDINATE_SYSTEM.CARTESIAN').toBeTruthy();

  layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS});
  expect(
    layer.use64bitPositions(),
    'returns false for COORDINATE_SYSTEM.METER_OFFSETS'
  ).toBeFalsy();
});

test('Layer#project', () => {
  let layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.LNGLAT});
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});
  layer.context.viewport = new MapView().makeViewport({
    width: 400,
    height: 300,
    viewState: {longitude: 0, latitude: 0, zoom: 10}
  });
  expect(
    equals(layer.project([0, 0, 100]), [200, 150, 0.9981698636949582]),
    'returns correct value'
  ).toBeTruthy();

  layer = new SubLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0.01, 0.01]
  });
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});
  layer.context.viewport = new MapView().makeViewport({
    width: 400,
    height: 300,
    viewState: {longitude: 0, latitude: 0, zoom: 10}
  });
  expect(
    equals(
      layer.project([100, 100, 100]),
      [215.9196278025254, 134.08037212692722, 0.9981698636873962]
    ),
    'returns correct value'
  ).toBeTruthy();

  layer = new SubLayer({
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    modelMatrix: new Matrix4().rotateZ(Math.PI / 2)
  });
  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});
  layer.context.viewport = new OrbitView().makeViewport({
    width: 400,
    height: 300,
    viewState: {zoom: 0, rotationOrbit: 30}
  });

  expect(
    equals(
      layer.project([100, 100, 100]),
      [77.35308047269142, 60.21622351419864, 0.8327158213685135]
    ),
    'returns correct value'
  ).toBeTruthy();
});

test('Layer#Async Iterable Data', async () => {
  async function getData() {
    await sleep(50);
    return [0, 1, 2, 3, 4, 5, 6, 7];
  }

  async function* getDataIterator() {
    await sleep(50);
    yield [0, 1, 2];
    await sleep(50);
    yield [3, 4];
    yield [5];
    await sleep(50);
    yield [6, 7];
  }

  let data = await testAsyncData(getData());
  expect(data, 'data is fully loaded').toEqual([0, 1, 2, 3, 4, 5, 6, 7]);

  data = await testAsyncData(getDataIterator());
  expect(data, 'data is fully loaded').toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
});

test('Layer#uniformTransitions', () => {
  const drawCalls: {opacity: number; modelMatrix: number[]}[] = [];
  const timeline = new Timeline();

  class TestLayer extends Layer {
    initializeState() {}

    setShaderModuleProps(props) {
      super.setShaderModuleProps(props);
      this.state.shaderModuleProps = props;
    }

    draw() {
      let {layer, project} = this.state.shaderModuleProps as any;
      drawCalls.push({opacity: layer.opacity, modelMatrix: project.modelMatrix});
    }
  }

  const identityMat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const scale2Mat4 = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1];
  const scale3Mat4 = [3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1];

  const testCases = [
    {
      props: {
        id: 'testLayer',
        data: [],
        opacity: 0,
        modelMatrix: identityMat4
      },
      onBeforeUpdate: () => timeline.setTime(0),
      onAfterUpdate: () =>
        expect(drawCalls.pop(), 'layer drawn with opacity').toEqual({
          opacity: 0,
          modelMatrix: identityMat4
        })
    },
    {
      updateProps: {
        opacity: 1,
        modelMatrix: scale3Mat4
      },
      onBeforeUpdate: () => timeline.setTime(100),
      onAfterUpdate: () =>
        expect(drawCalls.pop(), 'layer drawn with opacity').toEqual({
          opacity: 1,
          modelMatrix: scale3Mat4
        })
    },
    {
      updateProps: {
        opacity: 0,
        modelMatrix: identityMat4,
        transitions: {
          opacity: 200,
          modelMatrix: 200
        }
      },
      onBeforeUpdate: () => timeline.setTime(200),
      onAfterUpdate: () =>
        expect(drawCalls.pop(), 'layer drawn with opacity in transition').toEqual({
          opacity: 1,
          modelMatrix: scale3Mat4
        })
    },
    {
      updateProps: {
        opacity: 0
      },
      onBeforeUpdate: () => timeline.setTime(300),
      onAfterUpdate: () =>
        expect(drawCalls.pop(), 'layer drawn with opacity in transition').toEqual({
          opacity: 0.5,
          modelMatrix: scale2Mat4
        })
    },
    {
      updateProps: {
        opacity: 0
      },
      onBeforeUpdate: () => timeline.setTime(400),
      onAfterUpdate: () =>
        expect(drawCalls.pop(), 'layer drawn with opacity in transition').toEqual({
          opacity: 0,
          modelMatrix: identityMat4
        })
    }
  ];

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: TestLayer,
    timeline,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('Layer#calculateInstancePickingColors', () => {
  const testCases = [
    {
      props: {
        data: new Array(2).fill(0)
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        expect(
          instancePickingColors.state.constant,
          'instancePickingColors is set to constant'
        ).toBeTruthy();
        expect(instancePickingColors.value, 'instancePickingColors is set to constant').toEqual([
          0, 0, 0, 0
        ]);
      }
    },
    {
      updateProps: {
        pickable: true
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        expect(
          instancePickingColors.state.constant,
          'instancePickingColors is enabled'
        ).toBeFalsy();
        expect(
          instancePickingColors.value.subarray(0, 8),
          'instancePickingColors is populated'
        ).toEqual([1, 0, 0, 0, 2, 0, 0, 0]);
      }
    },
    {
      updateProps: {
        data: new Array(3).fill(0),
        // If a layer has been pickable once, picking colors attribute is always populated
        pickable: false
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        expect(
          instancePickingColors.value.subarray(0, 12),
          'instancePickingColors is populated'
        ).toEqual([1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0]);
      }
    },
    {
      updateProps: {
        data: new Array(3).fill(0)
      },
      onBeforeUpdate: ({layer}) => {
        layer.disablePickingIndex(1);
        layer.restorePickingColors();
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        expect(
          instancePickingColors.value.subarray(0, 12),
          'instancePickingColors is populated'
        ).toEqual([1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0]);
      }
    },
    {
      updateProps: {
        data: new Array(2 ** 24 + 100).fill(0),
        pickable: true
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        const {length} = instancePickingColors.value;
        expect(
          length,
          `no over allocation for instancePickingColors buffer after 2**24 elements`
        ).toEqual((2 ** 24 + 100) * 4);
      }
    }
  ];

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: SubLayer2,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('Layer#isLoaded', async () => {
  let updateCount = 0;

  await testLayerAsync({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: SubLayer,
    testCases: [
      {
        props: {
          data: Promise.resolve([])
        },

        onAfterUpdate: ({layer}) => {
          updateCount++;
          if (updateCount === 1) {
            expect(layer.isLoaded, 'first update: layer is not loaded').toBe(false);
          }
          if (updateCount === 2) {
            expect(layer.isLoaded, 'second update: layer is loaded').toBe(true);
          }
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});

test('Layer#updateModules', async () => {
  class LayerWithModel extends Layer {
    initializeState() {}

    updateState(params) {
      super.updateState(params);

      const {props, oldProps} = params;
      if (props.modelId !== oldProps.modelId) {
        this.state.model?.destroy();
        this.setState({model: this._getModel()});
      }
    }

    _getModel() {
      return new Model(this.context.device, {
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
        modules: [picking]
      });
    }
  }

  const HALF_BYTE = 128 / 255;

  await testLayerAsync({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: LayerWithModel,
    testCases: [
      {
        title: 'Default props',

        props: {
          data: null,
          modelId: 0
        },

        onAfterUpdate: ({layer}) => {
          let modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.highlightColor,
            'model highlightColor uniform is populated'
          ).toEqual([0, 0, HALF_BYTE, HALF_BYTE]);
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is disabled'
          ).toBe(false);

          // Simulate mouse hover
          layer.updateAutoHighlight({
            picked: true,
            color: [3, 0, 0]
          });

          modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is disabled (autoHighlight: false)'
          ).toBe(false);
        }
      },
      {
        title: 'only highlightedObjectIndex',

        updateProps: {
          highlightColor: [255, 0, 0, 128],
          highlightedObjectIndex: 1
        },

        onAfterUpdate: ({layer}) => {
          let modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.highlightColor,
            'model highlightColor uniform is populated'
          ).toEqual([1, 0, 0, HALF_BYTE]);
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is enabled'
          ).toBe(true);
          expect(
            modelUniforms.picking.highlightedObjectColor,
            'model selectedColor uniform is set from highlightedObjectIndex'
          ).toEqual([2, 0, 0]);

          // Simulate mouse hover
          layer.updateAutoHighlight({
            picked: true,
            color: [3, 0, 0]
          });

          modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is enabled'
          ).toBe(true);
          expect(
            modelUniforms.picking.highlightedObjectColor,
            'model selectedColor uniform is set from highlightedObjectIndex'
          ).toEqual([2, 0, 0]);
        }
      },
      {
        title: 'autoHighlight & highlightedObjectIndex',

        updateProps: {
          autoHighlight: true,
          highlightedObjectIndex: 1
        },

        onAfterUpdate: ({layer}) => {
          let modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is enabled'
          ).toBe(true);
          expect(
            modelUniforms.picking.highlightedObjectColor,
            'model selectedColor uniform is set from highlightedObjectIndex'
          ).toEqual([2, 0, 0]);

          // Simulate mouse hover
          layer.updateAutoHighlight({
            picked: true,
            color: [3, 0, 0]
          });

          modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is enabled'
          ).toBe(true);
          expect(
            modelUniforms.picking.highlightedObjectColor,
            'model selectedColor uniform is set from highlightedObjectIndex'
          ).toEqual([2, 0, 0]);
        }
      },
      {
        title: 'only autoHighlight',

        updateProps: {
          autoHighlight: true,
          highlightedObjectIndex: null
        },

        onAfterUpdate: ({layer}) => {
          let modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is unset (highlightedObjectIndex changed)'
          ).toBe(false);

          // Simulate mouse hover
          layer.updateAutoHighlight({
            picked: true,
            color: [3, 0, 0]
          });

          modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is enabled'
          ).toBe(true);
          expect(
            modelUniforms.picking.highlightedObjectColor,
            'model selectedColor uniform is set from hovered object index'
          ).toEqual([3, 0, 0]);
        }
      },
      {
        title: 'Other props update',

        updateProps: {
          data: []
        },

        onAfterUpdate: ({layer}) => {
          const modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is enabled'
          ).toBe(true);
          expect(
            modelUniforms.picking.highlightedObjectColor,
            'model selectedColor uniform is set from hovered object index'
          ).toEqual([3, 0, 0]);
        }
      },
      {
        title: 'Model regeneration',

        updateProps: {
          modelId: 1
        },

        onAfterUpdate: ({layer}) => {
          const modelUniforms = layer.state.model.shaderInputs.getUniformValues();
          expect(
            modelUniforms.picking.highlightColor,
            'model highlightColor uniform is populated'
          ).toEqual([1, 0, 0, HALF_BYTE]);
          expect(
            modelUniforms.picking.isHighlightActive,
            'model selectedColor uniform is disabled (model reset)'
          ).toBe(false);
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});
