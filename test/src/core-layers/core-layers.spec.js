// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
/* eslint-disable func-style, no-console, max-len */
import test from 'tape-catch';

import {
  ScatterplotLayer,
  IconLayer,
  ArcLayer,
  LineLayer,
  ScreenGridLayer,
  PointCloudLayer,
  PathLayer
} from 'deck.gl';

import {
  testCreateLayer,
  testCreateEmptyLayer,
  testNullLayer,
  testLayerUpdates
} from '@deck.gl/test-utils';

import * as FIXTURES from 'deck.gl/test/data';

const getPointPosition = d => d.COORDINATES;

test('ScreenGridLayer#constructor', t => {
  const LayerComponent = ScreenGridLayer;
  const data = FIXTURES.points;

  const TEST_CASES = {
    INITIAL_PROPS: {
      data,
      getPosition: getPointPosition
    },
    UPDATES: [
      {
        updateProps: {
          cellSizePixels: 10
        },
        assert: (layer, oldState) => {
          t.ok(layer.state !== oldState, 'should update layer state');
          t.ok(layer.state.cellScale !== oldState.cellScale, 'should update cellScale');
          t.ok(
            layer.state.cellScale === layer.state.model.uniforms.cellScale,
            'should update uniform cellScale'
          );
          t.ok(
            layer.state.maxCount === layer.state.model.uniforms.maxCount,
            'should update uniform maxCount'
          );
        }
      },
      {
        updateProps: {
          minColor: [0, 0, 0]
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.deepEqual(layer.state.model.uniforms.minColor, [0, 0, 0], 'should update minColor');
        }
      }
    ]
  };

  testCreateLayer(t, LayerComponent, {data, pickable: true});
  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  testLayerUpdates(t, {LayerComponent, testCases: TEST_CASES});

  t.end();
});

test('ScatterplotLayer#constructor', t => {
  const LayerComponent = ScatterplotLayer;
  const data = FIXTURES.points;

  const TEST_CASES = {
    INITIAL_PROPS: {
      data,
      radiusScale: 5,
      getPosition: getPointPosition
    },
    UPDATES: [
      {
        updateProps: {
          radiusScale: 10
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.radiusScale === 10, 'should update radiusScale');
        }
      },
      {
        updateProps: {
          fp64: true
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(
            layer.getAttributeManager().attributes.instancePositions64xyLow,
            'should add instancePositions64xyLow'
          );
        }
      }
    ]
  };

  testCreateLayer(t, LayerComponent, {data, pickable: true});
  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  testLayerUpdates(t, {LayerComponent, testCases: TEST_CASES});

  t.end();
});

test('ArcLayer#constructor', t => {
  const LayerComponent = ArcLayer;
  const data = FIXTURES.routes;

  const TEST_CASES = {
    INITIAL_PROPS: {
      data,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    UPDATES: [
      {
        updateProps: {
          strokeWidth: 10
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.strokeWidth === 10, 'should update strokeWidth');
        }
      }
    ]
  };

  testCreateLayer(t, LayerComponent, {data, pickable: true});
  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  testLayerUpdates(t, {LayerComponent, testCases: TEST_CASES});

  t.end();
});

test('PointCloudLayer#constructor', t => {
  const LayerComponent = PointCloudLayer;
  const data = FIXTURES.getPointCloud();

  const TEST_CASES = {
    INITIAL_PROPS: {
      data
    },
    UPDATES: [
      {
        updateProps: {
          radiusPixels: 10
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.radiusPixels === 10, 'should update strokeWidth');
        }
      }
    ]
  };

  testCreateLayer(t, LayerComponent, {data, pickable: true});
  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  testLayerUpdates(t, {LayerComponent, testCases: TEST_CASES});

  t.end();
});

test('LineLayer#constructor', t => {
  const LayerComponent = LineLayer;
  const data = FIXTURES.routes;

  const TEST_CASES = {
    INITIAL_PROPS: {
      data,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    UPDATES: [
      {
        updateProps: {
          strokeWidth: 10
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.strokeWidth === 10, 'should update strokeWidth');
        }
      },
      {
        updateProps: {
          fp64: true
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(
            layer.getAttributeManager().attributes.instanceSourceTargetPositions64xyLow,
            'should add instancePositions64xyLow'
          );
        }
      }
    ]
  };

  testCreateLayer(t, LayerComponent, {data, pickable: true});
  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  testLayerUpdates(t, {LayerComponent, testCases: TEST_CASES});

  t.end();
});

test('IconLayer#constructor', t => {
  const LayerComponent = IconLayer;
  const data = FIXTURES.points;

  const TEST_CASES = {
    INITIAL_PROPS: {
      data,
      sizeScale: 24,
      getPosition: getPointPosition
    },
    UPDATES: [
      {
        updateProps: {
          sizeScale: 10
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
        }
      },
      {
        updateProps: {
          fp64: true
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(
            layer.getAttributeManager().attributes.instancePositions64xyLow,
            'should add instancePositions64xyLow'
          );
        }
      }
    ]
  };

  testCreateLayer(t, LayerComponent, {data, pickable: true});
  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  testLayerUpdates(t, {LayerComponent, testCases: TEST_CASES});

  t.end();
});

test('PathLayer#constructor', t => {
  const LayerComponent = PathLayer;
  const data = FIXTURES.zigzag;

  const TEST_CASES = {
    INITIAL_PROPS: {
      data
    },
    UPDATES: [
      {
        updateProps: {
          widthMinPixels: 10
        },
        assert: (layer, oldState) => {
          t.ok(layer.state, 'should update layer state');
          t.ok(layer.state.model.uniforms.widthMinPixels === 10, 'should update strokeWidth');
        }
        // }, {
        //   updateProps: {
        //     fp64: true
        //   },
        //   assert: (layer, oldState) => {
        //     t.ok(layer.state, 'should update layer state');
        //     t.ok(layer.getAttributeManager().attributes.instanceStartEndPositions64xyLow,
        //       'should add instancePositions64xyLow');
        //   }
      }
    ]
  };

  testCreateLayer(t, LayerComponent, {data, pickable: true});
  testCreateEmptyLayer(t, LayerComponent);
  testNullLayer(t, LayerComponent);
  testLayerUpdates(t, {LayerComponent, testCases: TEST_CASES});

  t.end();
});
