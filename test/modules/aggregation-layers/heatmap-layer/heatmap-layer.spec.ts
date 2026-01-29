// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
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

test('HeatmapLayer', () => {
  const testCases = generateLayerTests({
    Layer: HeatmapLayer,
    sampleProps: {
      data: FIXTURES.points.slice(0, 3),
      getPosition
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate({layer}) {
      expect(layer.state.worldBounds, 'should update state.worldBounds').toBeTruthy();
    }
  });

  testLayer({Layer: HeatmapLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test.skip('HeatmapLayer#updates', t => {
  testLayer({
    Layer: HeatmapLayer,
    onError: err => expect(err).toBeFalsy(),
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

          expect(
            subLayer instanceof TriangleLayer,
            'Sublayer Triangle layer rendered'
          ).toBeTruthy();

          expect(worldBounds, 'should compute worldBounds').toBeTruthy();
          expect(viewportCorners, 'should compute viewportCorners').toBeTruthy();
        }
      },
      {
        updateProps: {
          colorRange: HeatmapLayer.defaultProps.colorRange.slice()
        },
        spies: ['_updateColorTexture', '_updateBounds'],
        onAfterUpdate({layer, subLayers, spies}) {
          expect(subLayers.length === 1, 'Sublayer rendered').toBeTruthy();

          expect(spies._updateColorTexture, 'should update color texture').toHaveBeenCalled();
          expect(
            spies._updateBounds,
            'viewport not changed, should not call _updateBounds'
          ).not.toHaveBeenCalled();
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
          expect(
            spies._updateColorTexture,
            'should not update color texture'
          ).not.toHaveBeenCalled();
          expect(
            spies._updateBounds,
            'viewport changed, should call _updateBounds'
          ).toHaveBeenCalled();
          expect(
            spies._updateWeightmap,
            'boundsChanged changed, should _updateWeightmap'
          ).toHaveBeenCalled();
          expect(
            spies._updateTextureRenderingBounds,
            'vieport changed, should call _updateTextureRenderingBounds'
          ).toHaveBeenCalled();
          expect(zoom, 'should update state.zoom').toBe(viewport1.zoom);
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
          expect(
            spies._updateBounds,
            'viewport changed slightly, should call _updateBounds'
          ).toHaveBeenCalled();
          expect(
            spies._updateWeightmap,
            'viewport changed slightly, should not call _updateWeightmap'
          ).not.toHaveBeenCalled();
          expect(
            spies._updateTextureRenderingBounds,
            'viewport changed slightly, should call _updateTextureRenderingBounds'
          ).toHaveBeenCalled();
          spies._updateBounds.restore();
          spies._updateWeightmap.restore();
          spies._updateTextureRenderingBounds.restore();
        }
      },
      {
        viewport: viewport3_bigChange, // panned too far, no zoom change
        spies: ['_updateBounds', '_updateWeightmap'],
        onAfterUpdate({layer, subLayers, spies}) {
          expect(
            spies._updateBounds,
            'viewport panned too far, should call _updateBounds'
          ).toHaveBeenCalled();
          expect(
            spies._updateWeightmap,
            'viewport panned too far, should call _updateWeightmap'
          ).toHaveBeenCalled();
          spies._updateBounds.restore();
          spies._updateWeightmap.restore();
        }
      },
      {
        viewport: viewport4_zoomChange, // only zoom change
        spies: ['_updateBounds', '_debouncedUpdateWeightmap'],
        onAfterUpdate({layer, subLayers, spies}) {
          const {zoom} = layer.state;
          expect(
            spies._updateBounds,
            'viewport zoom changed, should call _updateBounds'
          ).toHaveBeenCalled();
          expect(
            spies._debouncedUpdateWeightmap,
            'viewport zoom changed, should call _debouncedUpdateWeightmap'
          ).toHaveBeenCalled();
          spies._updateBounds.restore();
          spies._debouncedUpdateWeightmap.restore();
          expect(zoom, 'viewport zoom changed, should update state.zoom').toBe(
            viewport4_zoomChange.zoom
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
          expect(
            spies._updateWeightmap,
            'should update weight map on uniform change'
          ).toHaveBeenCalled();
          spies._updateWeightmap.restore();
        }
      }
    ]
  });
});

test('HeatmapLayer#binaryData', () => {
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
    onError: err => expect(err).toBeFalsy(),
    viewport: viewport0,
    testCases: [
      {
        props: {
          data: binaryData,
          radiusPixels: 30
        },
        onAfterUpdate({layer, subLayer}) {
          expect(layer, 'HeatmapLayer should render with binary data').toBeTruthy();
          expect(
            subLayer instanceof TriangleLayer,
            'Should create TriangleLayer sublayer'
          ).toBeTruthy();
          expect(layer.getNumInstances(), 'Should correctly count binary data instances').toBe(
            pointCount
          );

          // Verify weightsTransform was created properly
          expect(layer.state.weightsTransform, 'Should have weightsTransform').toBeTruthy();
          expect(layer.state.weightsTexture, 'Should have weightsTexture').toBeTruthy();

          const positionAttribute = layer.state.weightsTransform.model.bufferLayout.find(
            a => a.name === 'positions'
          ).attributes[0];
          expect(positionAttribute, 'Should have position attribute').toBeTruthy();
          expect(positionAttribute.format, 'bufferLayout should match binary data').toBe(
            'float32x2'
          );
        }
      }
    ]
  });
});
