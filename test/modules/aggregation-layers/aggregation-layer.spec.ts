// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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

test('AggregationLayer#constructor', t => {
  const layer = new TestAggregationLayer(Object.assign({id: BASE_LAYER_ID}, defaultProps));
  t.ok(layer, 'AggregationLayer created');
  t.end();
});

test('AggregationLayer#updateState', t => {
  testLayer({
    Layer: TestAggregationLayer,
    onError: t.notOk,
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
          t.ok(layer.getAttributeManager(), 'should create AttributeManager');
          t.ok(layer.state.aggregationDirty, 'Aggregation should be dirty on the first update');
          t.ok(layer.state.anyAttributeChanged, 'All attributes should change on first update');
          t.ok(layer.state.aOneAttributeChanged, 'Attribute should change on first update');
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
          t.ok(spies.updateAttributes.called, 'should always call updateAttributes');
          t.notOk(
            spies.updateShaders.called,
            'should not call updateShaders when extensions not changed'
          );
          t.notOk(layer.state.aggregationDirty, 'Aggregation should not be dirty');
          t.ok(layer.state.anyAttributeChanged, 'Should change one attribute');
          t.notOk(layer.state.aOneAttributeChanged, 'Should not update attribute');
        }
      },
      {
        updateProps: {
          cellSize: 21
        },
        spies: ['updateShaders', 'updateAttributes'],
        onAfterUpdate({layer}) {
          t.ok(
            layer.state.aggregationDirty,
            'Aggregation should be dirty when an aggregation prop is changed'
          );
        }
      },
      {
        updateProps: {
          extensions: [new DataFilterExtension({filterSize: 2})] // default value is true
        },
        spies: ['updateShaders'],
        onAfterUpdate({spies, layer}) {
          t.ok(spies.updateShaders.called, 'should call updateShaders when extensions changed');
          t.ok(layer.state.aggregationDirty, 'Aggregation should be dirty when extensions changed');
        }
      },
      {
        updateProps: {
          extensions: [new DataFilterExtension({filterSize: 2})]
        },
        spies: ['updateState'],
        onAfterUpdate({spies, layer}) {
          t.notOk(spies.updateState.called, 'should not call updateState nothing changed');
        }
      },
      {
        updateProps: {
          filterEnabled: false // default true earlier
        },
        onAfterUpdate({layer}) {
          t.ok(
            layer.state.aggregationDirty,
            'Aggregation should be dirty when extension prop is changed'
          );
        }
      }
    ]
  });

  t.end();
});
