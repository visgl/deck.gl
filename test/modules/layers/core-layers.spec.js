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
  GridCellLayer,
  ColumnLayer,
  ScreenGridLayer,
  PointCloudLayer,
  PathLayer
  // TextLayer
} from 'deck.gl';

import * as FIXTURES from 'deck.gl-test/data';

import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

const GRID = [
  {position: [37, 122]},
  {position: [37.1, 122]},
  {position: [37, 122.8]},
  {position: [37.1, 122.8]}
];

test('ScreenGridLayer', t => {
  const testCases = generateLayerTests({
    Layer: ScreenGridLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES,
      gpuAggregation: false
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: ScreenGridLayer, testCases, onError: t.notOk});

  t.end();
});

test('ScatterplotLayer', t => {
  const testCases = generateLayerTests({
    Layer: ScatterplotLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer}) => {
      t.is(
        layer.state.model.getUniforms().radiusScale,
        layer.props.radiusScale,
        'should update radiusScale'
      );
    }
  });

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});

test('ArcLayer', t => {
  const testCases = generateLayerTests({
    Layer: ArcLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: ArcLayer, testCases, onError: t.notOk});

  t.end();
});

test('PointCloudLayer', t => {
  const testCases = generateLayerTests({
    Layer: PointCloudLayer,
    sampleProps: {
      data: FIXTURES.getPointCloud(),
      getPosition: d => d.position
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer}) => {
      t.is(
        layer.state.model.getUniforms().pointSize,
        layer.props.radiusPixels,
        'should update pointSize'
      );
    }
  });

  testLayer({Layer: PointCloudLayer, testCases, onError: t.notOk});

  t.end();
});

test('LineLayer', t => {
  const testCases = generateLayerTests({
    Layer: LineLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: LineLayer, testCases, onError: t.notOk});

  t.end();
});

test('ColumnLayer', t => {
  const testCases = generateLayerTests({
    Layer: ColumnLayer,
    sampleProps: {
      data: GRID,
      getPosition: d => d.position
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer}) => {
      t.ok(layer.state.edgeDistance, 'edgeDistance is populated');
    }
  });

  testLayer({Layer: ColumnLayer, testCases, onError: t.notOk});

  t.end();
});

test('GridCellLayer', t => {
  const testCases = generateLayerTests({
    Layer: GridCellLayer,
    sampleProps: {
      data: GRID,
      getPosition: d => d.position
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: GridCellLayer, testCases, onError: t.notOk});

  t.end();
});

test('IconLayer', t => {
  /* global document */
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;

  const testCases = generateLayerTests({
    Layer: IconLayer,
    sampleProps: {
      data: FIXTURES.points,
      iconAtlas: canvas,
      iconMapping: {
        marker: {x: 0, y: 0, width: 24, height: 24}
      },
      getPosition: d => d.COORDINATES,
      getIcon: d => 'marker'
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });

  testLayer({Layer: IconLayer, testCases, onError: t.notOk});

  t.end();
});

test('PathLayer', t => {
  const testCases = generateLayerTests({
    Layer: PathLayer,
    sampleProps: {
      data: FIXTURES.zigzag,
      getPath: d => d.path,
      getColor: (d, {index}) => [index, 0, 0]
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer}) => {
      t.is(
        layer.state.model.getUniforms().widthMinPixels,
        layer.props.widthMinPixels,
        'should update widthMinPixels'
      );
      t.ok(layer.getStartIndices(), 'should have vertex layout');
    }
  });

  testLayer({Layer: PathLayer, testCases, onError: t.notOk});

  t.end();
});

/* TextLayer tests don't work under Node due to fontAtlas needing canvas
test('Text#constructor', t => {
  const data = [
    {
      text: 'north',
      coordinates: [0, 100]
    },
    {
      text: 'south',
      coordinates: [0, -100]
    },
    {
      text: 'east',
      coordinates: [100, 0]
    },
    {
      text: 'west',
      coordinates: [-100, 0]
    }
  ];

  testLayer({
    Layer: TextLayer,
    testCases: [
      {props: []},
      {props: null},
      {
        props: {
          data,
          getText: d => d.text,
          getPosition: d => d.coordinates
        }
      },
      {
        updateProps: {
          data: data.slice(0, 2)
        },
        onAfterUpdate({layer, oldState}) {
          t.ok(layer.state.data.length !== oldState.data.length, 'should update state.data');
        }
      }
    ]
  });

  t.end();
});
*/
