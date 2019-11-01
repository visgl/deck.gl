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
import test from 'tape-catch';
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
