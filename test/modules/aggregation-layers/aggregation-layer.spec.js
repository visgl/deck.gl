// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
import AggregationLayer from '@deck.gl/aggregation-layers/aggregation-layer';
import {Layer} from 'deck.gl';
import {DataFilterExtension} from '@deck.gl/extensions';
import {testLayer} from '@deck.gl/test-utils';

const BASE_LAYER_ID = 'composite-layer-id';
const PROPS = {
  cellSize: 10,
  prop1: 5
};

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

const AGGREGATION_PROPS = ['cellSize'];

class TestAggregationLayer extends AggregationLayer {
  initializeState() {
    super.initializeState(AGGREGATION_PROPS);
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
    this.setState({aggregationDirty: this._isAggregationDirty(opts)});
  }
  updateShaders(shaderOptions) {}
  //
  // updateAttributes(changedAttributes) {}
}

TestAggregationLayer.layerName = 'TestAggregationLayer';

test('AggregationLayer#constructor', t => {
  const layer = new TestAggregationLayer(Object.assign({id: BASE_LAYER_ID}, PROPS));
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
          cellSize: 400,
          prop1: 10
        },
        onAfterUpdate({layer}) {
          t.ok(layer.getAttributeManager(), 'should create AttributeManager');
          t.ok(layer.state.aggregationDirty, 'Aggregation should be dirty on the first update');
        }
      },
      {
        updateProps: {
          prop1: 20
        },
        spies: ['updateShaders', 'updateAttributes'],
        onAfterUpdate({spies, layer}) {
          t.ok(spies.updateAttributes.called, 'should always call updateAttributes');
          t.notOk(
            spies.updateShaders.called,
            'should not call updateShaders when extensions not changed'
          );
          t.notOk(layer.state.aggregationDirty, 'Aggregation should not be dirty');
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
            'Aggregation should not be dirty when extension prop is changed'
          );
        }
      }
    ]
  });

  t.end();
});
