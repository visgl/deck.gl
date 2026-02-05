// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  LayerManager,
  CompositeLayer,
  Layer,
  COORDINATE_SYSTEM,
  WebMercatorViewport
} from '@deck.gl/core';
import {device, testLayer, testInitializeLayer} from '@deck.gl/test-utils/vitest';

const SUB_LAYER_ID = 'sub-layer-id';
const BASE_LAYER_ID = 'composite-layer-id';

const BASE_LAYER_PROPS = {
  opacity: 0.2,
  pickable: true,
  visible: false,
  parameters: {},
  getPolygonOffset: null,
  highlightedObjectIndex: 3,
  autoHighlight: true,
  highlightColor: [1, 1, 1],
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  coordinateOrigin: [1, 1, 1],
  wrapLongitude: false,
  modelMatrix: [1]
};

const SUB_LAYER_PROPS = {
  opacity: 0.3,
  newForwardProp: 'NFP',
  updateTriggers: {
    getColor: 'c',
    getPosition: 10
  }
};

// used for _subLayerProps to override sublayer props
const OVERRIDE_PROPS = {
  opacity: 0.5,
  newProp: 'abc',
  updateTriggers: {
    getColor: 'b',
    getCoverage: 100
  }
};

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

class TestCompositeLayer extends CompositeLayer {
  initializeState() {
    this.state = {scale: 1};
  }

  renderLayers() {
    return [
      new TestLayer(this.getSubLayerProps(), {
        scale: this.state.scale
      })
    ];
  }
}

TestCompositeLayer.layerName = 'TestCompositeLayer';

test('CompositeLayer#constructor', () => {
  const layer = new TestCompositeLayer(Object.assign({id: BASE_LAYER_ID}, BASE_LAYER_PROPS));
  expect(layer, 'CompositeLayer created').toBeTruthy();
  expect(layer.id, 'CompositeLayer id set correctly').toBe(BASE_LAYER_ID);
  expect(layer.props, 'CompositeLayer props not null').toBeTruthy();
});

test('CompositeLayer#getSubLayerProps', () => {
  const layer = new TestCompositeLayer(Object.assign({id: BASE_LAYER_ID}, BASE_LAYER_PROPS));

  // TODO - add table driven test cases for all forwarded sublayer props
  const baseProps = layer.getSubLayerProps();
  console.log(JSON.stringify(baseProps));
  for (const propName in BASE_LAYER_PROPS) {
    expect(baseProps[propName], `CompositeLayer baseLayerProp ${propName} ok`).toBe(
      BASE_LAYER_PROPS[propName]
    );
  }

  const layerManager = new LayerManager(device);
  layerManager.setLayers([layer]);
  const sublayers = layer.getSubLayers();
  const subProps = sublayers[0].props;
  for (const propName in BASE_LAYER_PROPS) {
    expect(subProps[propName], `CompositeLayer subLayerProp ${propName} ok`).toBe(
      BASE_LAYER_PROPS[propName]
    );
  }
  layerManager.finalize();
});

test('CompositeLayer#getSubLayerProps(override)', () => {
  const TEST_CASES = [
    {
      name: 'No sublayer props',
      baseLayerProps: BASE_LAYER_PROPS,
      // sublayerProps not defined
      overrideProps: OVERRIDE_PROPS,
      // result just contains base layer props
      expected: BASE_LAYER_PROPS
    },
    {
      name: 'With sub layer props and no override props',
      baseLayerProps: BASE_LAYER_PROPS,
      sublayerProps: SUB_LAYER_PROPS,
      // overrideProps not defined
      // sub layer props take precendence
      expected: Object.assign(
        {id: `${BASE_LAYER_ID}-${SUB_LAYER_ID}`},
        BASE_LAYER_PROPS,
        SUB_LAYER_PROPS,
        {
          updateTriggers: Object.assign({all: undefined}, SUB_LAYER_PROPS.updateTriggers)
        }
      )
    },
    {
      name: 'With overriding sub layer props',
      baseLayerProps: BASE_LAYER_PROPS,
      sublayerProps: SUB_LAYER_PROPS,
      overrideProps: OVERRIDE_PROPS,
      // overriding sub layer props take precendence
      expected: Object.assign(
        {id: `${BASE_LAYER_ID}-${SUB_LAYER_ID}`},
        BASE_LAYER_PROPS,
        SUB_LAYER_PROPS,
        OVERRIDE_PROPS,
        {
          updateTriggers: Object.assign(
            {all: undefined},
            SUB_LAYER_PROPS.updateTriggers,
            OVERRIDE_PROPS.updateTriggers
          )
        }
      )
    }
  ];

  for (const tc of TEST_CASES) {
    const {name, sublayerProps, baseLayerProps, overrideProps, expected} = tc;
    const layer = new TestCompositeLayer(
      Object.assign({id: BASE_LAYER_ID}, baseLayerProps, {
        _subLayerProps: {[SUB_LAYER_ID]: overrideProps}
      })
    );
    const combinedSublayerProps = layer.getSubLayerProps(
      sublayerProps && Object.assign({id: SUB_LAYER_ID}, sublayerProps)
    );
    for (const propName in expected) {
      expect(
        combinedSublayerProps[propName],
        `${name} : ${propName} sub layer prop should get set correctly`
      ).toEqual(expected[propName]);
    }
  }
});

test('CompositeLayer#getSubLayerProps(accessor)', () => {
  class TestWrapperLayer extends CompositeLayer {
    initializeState() {}

    updateState({props}) {
      this.setState({
        data: props.data.map((d, i) => this.getSubLayerRow({position: [0, 0]}, d, i))
      });
    }

    renderLayers() {
      return [
        new TestLayer(
          {
            getColor: this.getSubLayerAccessor(this.props.getColor)
          },
          this.getSubLayerProps({id: 'wrapped'}),
          {
            data: this.state.data
          }
        ),
        new TestLayer(
          {
            getColor: this.props.getColor
          },
          this.getSubLayerProps({id: 'pass-through'}),
          {
            data: this.props.data
          }
        )
      ];
    }
  }

  TestWrapperLayer.layerName = 'TestWrapperLayer';
  TestWrapperLayer.defaultProps = {
    getColor: {type: 'accessor', value: [0, 0, 0]}
  };

  const testCases = [
    {
      props: {
        id: 'wrapper-layer',
        data: [{color: [255, 0, 0]}],
        getColor: d => d.color
      },
      onAfterUpdate: ({subLayers}) => {
        let props = subLayers[0].props;
        expect(
          props.getColor(props.data[0]),
          `sublayer ${subLayers[0].id} getColor returns correct result`
        ).toEqual([255, 0, 0]);
        props = subLayers[1].props;
        expect(
          props.getColor(props.data[0]),
          `sublayer ${subLayers[1].id} getColor returns correct result`
        ).toEqual([255, 0, 0]);
      }
    },
    {
      updateProps: {
        _subLayerProps: {
          wrapped: {
            getColor: d => d.color
          },
          'pass-through': {
            getColor: d => d.color
          }
        }
      },
      onAfterUpdate: ({subLayers}) => {
        let props = subLayers[0].props;
        expect(
          props.getColor(props.data[0]),
          `sublayer ${subLayers[0].id} getColor returns correct result`
        ).toEqual([255, 0, 0]);
        props = subLayers[1].props;
        expect(
          props.getColor(props.data[0]),
          `sublayer ${subLayers[1].id} getColor returns correct result`
        ).toEqual([255, 0, 0]);
      }
    }
  ];

  testLayer({Layer: TestWrapperLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('CompositeLayer#getSubLayerRow, getSubLayerAccessor', () => {
  const layer = new TestCompositeLayer(Object.assign({id: BASE_LAYER_ID}, BASE_LAYER_PROPS));

  const originalRow = {id: 'original datum', value: 100};
  const sublayerRow = layer.getSubLayerRow({id: 'sublayer datum'}, originalRow, 0);

  let accessor = layer.getSubLayerAccessor(1);
  expect(accessor, 'returns valid accessor').toBe(1);

  accessor = layer.getSubLayerAccessor(d => d.value);
  expect(accessor(originalRow), 'returns valid accessor').toBe(100);
  expect(accessor(sublayerRow), 'returns valid accessor').toBe(100);

  accessor = layer.getSubLayerAccessor((d, {index}) => index);
  expect(accessor(originalRow, {index: 1}), 'returns valid accessor').toBe(1);
  expect(accessor(sublayerRow, {index: 1}), 'returns valid accessor').toBe(0);

  expect(
    layer.getPickingInfo({
      info: {object: originalRow, index: 1}
    }),
    'returns correct picking info'
  ).toEqual({object: originalRow, index: 1});
  expect(
    layer.getPickingInfo({
      info: {object: sublayerRow, index: 1}
    }),
    'returns correct picking info'
  ).toEqual({object: originalRow, index: 0});
});

test('CompositeLayer#setState', () => {
  const layerManager = new LayerManager(device);
  const compositeLayer = new TestCompositeLayer(BASE_LAYER_PROPS);
  let subLayer = null;

  layerManager.setLayers([compositeLayer]);
  subLayer = compositeLayer.getSubLayers()[0];
  expect(subLayer.props.scale, 'sublayer has default props').toBe(1);

  layerManager.updateLayers();
  expect(subLayer, 'composite layer should not rerender').toBe(compositeLayer.getSubLayers()[0]);

  compositeLayer.setState({scale: 2});
  layerManager.updateLayers();
  expect(subLayer, 'composite layer should rerender').not.toBe(compositeLayer.getSubLayers()[0]);
  subLayer = compositeLayer.getSubLayers()[0];
  expect(subLayer.props.scale, 'sublayer has updated props from state').toBe(2);

  layerManager.finalize();
});

test('CompositeLayer#isLoaded', () => {
  const layer = new TestCompositeLayer({
    data: Promise.resolve([]),
    onDataLoad: () => {
      expect(layer.isLoaded, 'data is loaded').toBeTruthy();
      finalize();
    }
  });

  const {finalize} = testInitializeLayer({layer, finalize: false});

  expect(layer.isLoaded, 'is loading data').toBeFalsy();
});

test('CompositeLayer#onViewportChange', () => {
  class CompLayer extends CompositeLayer {
    shouldUpdateState({changeFlags}) {
      return changeFlags.somethingChanged;
    }

    renderLayers() {
      return [
        new TestLayer(
          this.getSubLayerProps({
            id: 'sublayer'
          }),
          {
            zoom: this.context.viewport.zoom
          }
        )
      ];
    }
  }

  const testCases = [
    {
      viewport: new WebMercatorViewport({
        longitude: 0,
        latitude: 0,
        zoom: 0,
        width: 100,
        height: 100
      }),
      props: {},
      onAfterUpdate: ({subLayer}) => {
        expect(subLayer.props.zoom, 'Sub layer prop is populated').toBe(0);
        expect(subLayer.state, 'Sub layer is added to the stack').toBeTruthy();
      }
    },
    {
      viewport: new WebMercatorViewport({
        longitude: 0,
        latitude: 0,
        zoom: 1,
        width: 100,
        height: 100
      }),
      onAfterUpdate: ({subLayer}) => {
        expect(subLayer.props.zoom, 'Sub layer prop is populated').toBe(1);
        expect(subLayer.state, 'Sub layer is added to the stack').toBeTruthy();
      }
    }
  ];

  testLayer({Layer: CompLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
