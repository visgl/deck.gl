// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import AggregationLayer from '@deck.gl/aggregation-layers/heatmap-layer/aggregation-layer';
import {Layer} from 'deck.gl';
import {DataFilterExtension} from '@deck.gl/extensions';
import {testLayer} from '@deck.gl/test-utils';

const BASE_LAYER_ID = 'composite-layer-id';
const defaultProps = {
  cellSize: 10,
  prop1: 5
};

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

const DIMENSIONS = {
  data: {
    props: ['cellSize']
  }
};

class TestAggregationLayer extends AggregationLayer {
  initializeState() {
    super.initializeAggregationLayer(DIMENSIONS);
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      aOne: {
        size: 1,
        accessor: 'getAOne'
      },
      aTwo: {
        size: 1,
        accessor: 'getATwo'
      }
    });
  }

  renderLayers() {
    return [
      new TestLayer(this.getSubLayerProps(), {
        scale: this.state.scale
      })
    ];
  }

  updateState(opts) {
    // clear state
    this.setState({aggregationDirty: false});
    super.updateState(opts);
    this.setState({
      aggregationDirty: this.isAggregationDirty(opts, {
        dimension: this.state.dimensions.data,
        compareAll: true
      }),
      anyAttributeChanged: this.isAttributeChanged(),
      aOneAttributeChanged: this.isAttributeChanged('aOne')
    });
  }
  updateShaders(shaderOptions) {}
  //
  // updateAttributes(changedAttributes) {}
}

TestAggregationLayer.layerName = 'TestAggregationLayer';
TestAggregationLayer.defaultProps = defaultProps;

test('AggregationLayer#constructor', () => {
  const layer = new TestAggregationLayer(Object.assign({id: BASE_LAYER_ID}, defaultProps));
  expect(layer, 'AggregationLayer created').toBeTruthy();
});

test('AggregationLayer#updateState', () => {
  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: TestAggregationLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props: {
          data: [0, 1],
          getAOne: x => 1,
          getATwo: x => 2,
          cellSize: 400,
          prop1: 10
        },
        onAfterUpdate({layer}) {
          expect(layer.getAttributeManager(), 'should create AttributeManager').toBeTruthy();
          expect(
            layer.state.aggregationDirty,
            'Aggregation should be dirty on the first update'
          ).toBeTruthy();
          expect(
            layer.state.anyAttributeChanged,
            'All attributes should change on first update'
          ).toBeTruthy();
          expect(
            layer.state.aOneAttributeChanged,
            'Attribute should change on first update'
          ).toBeTruthy();
        }
      },
      {
        updateProps: {
          prop1: 20,
          // change attribute two
          updateTriggers: {
            getATwo: 1
          }
        },
        spies: ['updateShaders', 'updateAttributes'],
        onAfterUpdate({spies, layer}) {
          expect(spies.updateAttributes, 'should always call updateAttributes').toHaveBeenCalled();
          expect(
            spies.updateShaders,
            'should not call updateShaders when extensions not changed'
          ).not.toHaveBeenCalled();
          expect(layer.state.aggregationDirty, 'Aggregation should not be dirty').toBeFalsy();
          expect(layer.state.anyAttributeChanged, 'Should change one attribute').toBeTruthy();
          expect(layer.state.aOneAttributeChanged, 'Should not update attribute').toBeFalsy();
        }
      },
      {
        updateProps: {
          cellSize: 21
        },
        spies: ['updateShaders', 'updateAttributes'],
        onAfterUpdate({layer}) {
          expect(
            layer.state.aggregationDirty,
            'Aggregation should be dirty when an aggregation prop is changed'
          ).toBeTruthy();
        }
      },
      {
        updateProps: {
          extensions: [new DataFilterExtension({filterSize: 2})] // default value is true
        },
        spies: ['updateShaders'],
        onAfterUpdate({spies, layer}) {
          expect(
            spies.updateShaders,
            'should call updateShaders when extensions changed'
          ).toHaveBeenCalled();
          expect(
            layer.state.aggregationDirty,
            'Aggregation should be dirty when extensions changed'
          ).toBeTruthy();
        }
      },
      {
        updateProps: {
          extensions: [new DataFilterExtension({filterSize: 2})]
        },
        spies: ['updateState'],
        onAfterUpdate({spies, layer}) {
          expect(
            spies.updateState,
            'should not call updateState nothing changed'
          ).not.toHaveBeenCalled();
        }
      },
      {
        updateProps: {
          filterEnabled: false // default true earlier
        },
        onAfterUpdate({layer}) {
          expect(
            layer.state.aggregationDirty,
            'Aggregation should be dirty when extension prop is changed'
          ).toBeTruthy();
        }
      }
    ]
  });
});
