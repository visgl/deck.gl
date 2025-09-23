// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {MapView} from '@deck.gl/core';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';
import {default as TriangleLayer} from '@deck.gl/aggregation-layers/heatmap-layer/triangle-layer';

const getPosition = d => d.COORDINATES;

const viewport0 = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -122, latitude: 38, zoom: 10}
});

const viewport1 = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 0, latitude: 10, zoom: 10}
});

const viewport2_slightChange = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 0.01, latitude: 10, zoom: 10}
});

const viewport3_bigChange = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 10, latitude: 0, zoom: 10}
});

const viewport4_zoomChange = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 10, latitude: 0, zoom: 9.9}
});

test('HeatmapLayer', t => {
  const testCases = generateLayerTests({
    Layer: HeatmapLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      t.ok(layer.state.worldBounds, 'should update state.worldBounds');
    }
  });

  testLayer({Layer: HeatmapLayer, testCases, onError: t.notOk});

  t.end();
});

test('HeatmapLayer#updates', t => {
  testLayer({
    Layer: HeatmapLayer,
    onError: t.notOk,
    viewport: viewport0,
    testCases: [
      {
        props: {
          data: FIXTURES.points,
          getPosition,
          pickable: false
        },
        onAfterUpdate({layer, subLayer}) {
          const {worldBounds, viewportCorners} = layer.state;

          t.ok(subLayer instanceof TriangleLayer, 'Sublayer Triangle layer rendered');

          t.ok(worldBounds, 'should compute worldBounds');
          t.ok(viewportCorners, 'should compute viewportCorners');
        }
      },
      {
        updateProps: {
          colorRange: HeatmapLayer.defaultProps.colorRange.slice()
        },
        spies: ['_updateColorTexture', '_updateBounds'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(subLayers.length === 1, 'Sublayer rendered');

          t.ok(spies._updateColorTexture.called, 'should update color texture');
          t.notOk(
            spies._updateBounds.called,
            'viewport not changed, should not call _updateBounds'
          );
          spies._updateColorTexture.restore();
          spies._updateBounds.restore();
        }
      },
      {
        viewport: viewport1, // viewport changed
        spies: [
          '_updateColorTexture',
          '_updateBounds',
          '_updateWeightmap',
          '_updateTextureRenderingBounds'
        ],
        onAfterUpdate({layer, subLayers, spies}) {
          const {zoom} = layer.state;
          t.notOk(spies._updateColorTexture.called, 'should not update color texture');
          t.ok(spies._updateBounds.called, 'viewport changed, should call _updateBounds');
          t.ok(spies._updateWeightmap.called, 'boundsChanged changed, should _updateWeightmap');
          t.ok(
            spies._updateTextureRenderingBounds.called,
            'vieport changed, should call _updateTextureRenderingBounds'
          );
          t.equal(zoom, viewport1.zoom, 'should update state.zoom');
          spies._updateColorTexture.restore();
          spies._updateBounds.restore();
          spies._updateWeightmap.restore();
          spies._updateTextureRenderingBounds.restore();
        }
      },
      {
        viewport: viewport2_slightChange, // panned slightly, no zoom change
        spies: ['_updateBounds', '_updateWeightmap', '_updateTextureRenderingBounds'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(spies._updateBounds.called, 'viewport changed slightly, should call _updateBounds');
          t.notOk(
            spies._updateWeightmap.called,
            'viewport changed slightly, should not call _updateWeightmap'
          );
          t.ok(
            spies._updateTextureRenderingBounds.called,
            'viewport changed slightly, should call _updateTextureRenderingBounds'
          );
          spies._updateBounds.restore();
          spies._updateWeightmap.restore();
          spies._updateTextureRenderingBounds.restore();
        }
      },
      {
        viewport: viewport3_bigChange, // panned too far, no zoom change
        spies: ['_updateBounds', '_updateWeightmap'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(spies._updateBounds.called, 'viewport panned too far, should call _updateBounds');
          t.ok(
            spies._updateWeightmap.called,
            'viewport panned too far, should call _updateWeightmap'
          );
          spies._updateBounds.restore();
          spies._updateWeightmap.restore();
        }
      },
      {
        viewport: viewport4_zoomChange, // only zoom change
        spies: ['_updateBounds', '_debouncedUpdateWeightmap'],
        onAfterUpdate({layer, subLayers, spies}) {
          const {zoom} = layer.state;
          t.ok(spies._updateBounds.called, 'viewport zoom changed, should call _updateBounds');
          t.ok(
            spies._debouncedUpdateWeightmap.called,
            'viewport zoom changed, should call _debouncedUpdateWeightmap'
          );
          spies._updateBounds.restore();
          spies._debouncedUpdateWeightmap.restore();
          t.equal(
            zoom,
            viewport4_zoomChange.zoom,
            'viewport zoom changed, should update state.zoom'
          );
        }
      },
      {
        updateProps: {
          radiusPixels: 2.123 // change from default value (30)
        },
        viewport: viewport4_zoomChange, // keep the same viewport
        spies: ['_updateWeightmap'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(spies._updateWeightmap.called, 'should update weight map on uniform change');
          spies._updateWeightmap.restore();
        }
      }
    ]
  });

  t.end();
});

test('HeatmapLayer#binaryData', t => {
  const pointCount = 2;
  const positions = new Float32Array(pointCount * 2);
  const weights = new Float32Array(pointCount);

  // Generate test data
  positions[0] = -122.4;
  positions[1] = 37.8; // San Francisco
  positions[2] = -122.3;
  positions[3] = 37.7; // Nearby point

  weights[0] = 100;
  weights[1] = 50;

  const binaryData = {
    length: pointCount,
    attributes: {
      getPosition: {
        value: positions,
        size: 2
      },
      getWeight: {
        value: weights,
        size: 1
      }
    }
  };

  testLayer({
    Layer: HeatmapLayer,
    onError: t.notOk,
    viewport: viewport0,
    testCases: [
      {
        props: {
          data: binaryData,
          radiusPixels: 30
        },
        onAfterUpdate({layer, subLayer}) {
          t.ok(layer, 'HeatmapLayer should render with binary data');
          t.ok(subLayer instanceof TriangleLayer, 'Should create TriangleLayer sublayer');
          t.equal(
            layer.getNumInstances(),
            pointCount,
            'Should correctly count binary data instances'
          );

          // Verify weightsTransform was created properly
          t.ok(layer.state.weightsTransform, 'Should have weightsTransform');
          t.ok(layer.state.weightsTexture, 'Should have weightsTexture');

          const positionAttribute = layer.state.weightsTransform.model.bufferLayout.find(
            a => a.name === 'positions'
          ).attributes[0];
          t.ok(positionAttribute, 'Should have position attribute');
          t.equal(positionAttribute.format, 'float32x2', 'bufferLayout should match binary data');
        }
      }
    ]
  });

  t.end();
});
