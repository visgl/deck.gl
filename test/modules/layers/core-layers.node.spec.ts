// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable func-style, no-console, max-len */
import {test, expect} from 'vitest';

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

import {testLayer, generateLayerTests, getLayerUniforms} from '@deck.gl/test-utils';

const GRID = [
  {position: [37, 122]},
  {position: [37.1, 122]},
  {position: [37, 122.8]},
  {position: [37.1, 122.8]}
];

test('ScreenGridLayer', async () => {
  const testCases = generateLayerTests({
    Layer: ScreenGridLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES,
      gpuAggregation: false
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({testCase}) => console.log(testCase.title)
  });

  await testLayer({Layer: ScreenGridLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('ScatterplotLayer', async () => {
  const testCases = generateLayerTests({
    Layer: ScatterplotLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => d.COORDINATES
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer}) => {
      expect(getLayerUniforms(layer).radiusScale, 'should update radiusScale').toBe(
        layer.props.radiusScale
      );
    }
  });

  await testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('ArcLayer', async () => {
  const testCases = generateLayerTests({
    Layer: ArcLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  await testLayer({Layer: ArcLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PointCloudLayer', () => {
  const testCases = generateLayerTests({
    Layer: PointCloudLayer,
    sampleProps: {
      data: FIXTURES.getPointCloud(),
      getPosition: d => d.position
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer}) => {
      expect(getLayerUniforms(layer).pointSize, 'should update pointSize').toBe(
        layer.props.radiusPixels
      );
    }
  });

  testLayer({Layer: PointCloudLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('LineLayer', () => {
  const testCases = generateLayerTests({
    Layer: LineLayer,
    sampleProps: {
      data: FIXTURES.routes,
      getSourcePosition: d => d.START,
      getTargetPosition: d => d.END
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  testLayer({Layer: LineLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('ColumnLayer', () => {
  const testCases = generateLayerTests({
    Layer: ColumnLayer,
    sampleProps: {
      data: GRID,
      getPosition: d => d.position
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer}) => {
      expect(layer.state.edgeDistance, 'edgeDistance is populated').toBeTruthy();
    }
  });

  testLayer({Layer: ColumnLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('GridCellLayer', () => {
  const testCases = generateLayerTests({
    Layer: GridCellLayer,
    sampleProps: {
      data: GRID,
      getPosition: d => d.position
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  testLayer({Layer: GridCellLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('IconLayer', () => {
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
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  testLayer({Layer: IconLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathLayer', () => {
  const testCases = generateLayerTests({
    Layer: PathLayer,
    sampleProps: {
      data: FIXTURES.zigzag,
      getPath: d => d.path,
      getColor: (d, {index}) => [index, 0, 0]
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer}) => {
      expect(getLayerUniforms(layer).widthMinPixels, 'should update widthMinPixels').toBe(
        layer.props.widthMinPixels
      );
      expect(layer.getStartIndices(), 'should have vertex layout').toBeTruthy();
    }
  });

  testLayer({Layer: PathLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

/* TextLayer tests don't work under Node due to fontAtlas needing canvas
test('Text#constructor', () => {
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
          expect(layer.state.data.length !== oldState.data.length, 'should update state.data').toBeTruthy();
        }
      }
    ]
  });
});
*/
