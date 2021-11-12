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

import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {geojsonToBinary} from '@loaders.gl/gis';

import {GeoJsonLayer} from 'deck.gl';

import * as FIXTURES from 'deck.gl-test/data';
import {testPickingLayer} from './test-picking-layer';

test('GeoJsonLayer#tests', t => {
  const testCases = generateLayerTests({
    Layer: GeoJsonLayer,
    sampleProps: {
      data: FIXTURES.geojson,
      pointType: 'circle+icon+text',
      textBackground: true,
      iconAtlas: {data: new Uint8ClampedArray(4), width: 1, height: 1},
      iconMapping: {
        marker: {x: 0, y: 0, width: 1, height: 1}
      },
      getIcon: () => 'marker'
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      t.ok(layer.state.features, 'should update features');
      const hasData = layer.props && layer.props.data && Object.keys(layer.props.data).length;
      t.is(
        subLayers.length,
        !hasData ? 0 : layer.props.stroked && !layer.props.extruded ? 6 : 5,
        'correct number of sublayers'
      );
    }
  });

  testCases.push({
    title: 'GeoJsonLayer#highlightedObjectIndex',
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      t.ok(
        subLayers.every(l => Number.isFinite(l.props.highlightedObjectIndex)),
        "sublayers' highlightedObjectIndex prop is populated"
      );
      // check prop forwarding
      for (const l of subLayers) {
        t.ok(
          Object.keys(l.props).every(key => key.startsWith('_') || l.props[key] !== undefined),
          'sublayer props are defined'
        );
      }
    },
    updateProps: {
      highlightedObjectIndex: 5
    }
  });

  // Add partial update test case
  testCases.push({
    title: 'GeoJsonLayer#partial update',
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      const {featuresDiff} = layer.state;
      t.deepEquals(
        featuresDiff,
        {
          polygonFeatures: [{startRow: 0, endRow: 3}],
          polygonOutlineFeatures: [{startRow: 0, endRow: 3}],
          lineFeatures: [{startRow: 0, endRow: 0}],
          pointFeatures: [{startRow: 0, endRow: 0}]
        },
        'created diff for subLayers'
      );
      t.ok(
        subLayers.every(l => l.props._dataDiff),
        "sublayers' dataDiff prop is populated"
      );
    },
    updateProps: {
      data: Object.assign({}, FIXTURES.choropleths),
      _dataDiff: () => [{startRow: 0, endRow: 3}]
    }
  });

  // TODO: @loaders.gl binaryToGeojson should no modify input data
  // TODO: Set a right geojson example as the provided from 'deck.gl-data' contains 'GeometryCollection' types that are not compatible with geojsonToBinary
  const binaryData = JSON.parse(JSON.stringify(FIXTURES.geojson.features)).slice(0, 7);

  testCases.push({
    title: 'GeoJsonLayer#binary',
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      t.ok(
        layer.state.layerProps.points.data.featureIds &&
          layer.state.layerProps.lines.data.featureIds &&
          layer.state.layerProps.polygons.data.featureIds &&
          layer.state.layerProps.polygonsOutline.data.featureIds,
        'should receive data in binary mode'
      );
      t.ok(layer.state.binary, 'detects binary data');
      const hasData = layer.props && layer.props.data && Object.keys(layer.props.data).length;
      t.is(
        subLayers.length,
        !hasData ? 0 : layer.props.stroked && !layer.props.extruded ? 4 : 3,
        'correct number of sublayers'
      );
    },
    props: {
      // TODO: Set a right geojson example as the provided from 'deck.gl-data' contains 'GeometryCollection' types that are not compatible with geojsonToBinary
      data: geojsonToBinary(binaryData)
    }
  });

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});

test('GeoJsonLayer#picking', async t => {
  await testPickingLayer({
    layer: new GeoJsonLayer({
      id: 'geojson',
      data: FIXTURES.geojson,
      pickable: true,
      autoHighlight: true
    }),
    testCases: [
      {
        pickedColor: new Uint8Array([1, 0, 0, 0]),
        pickedLayerId: 'geojson-points-circle',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.comment('hover over point feature');

          t.ok(info.object.properties, 'info.object populated');
          t.is(info.object.geometry.type, 'Point', 'info.object populated');

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].getUniforms();
            t.is(
              uniforms.picking_uSelectedColorValid,
              subLayer.id === 'geojson-points-circle' ? 1 : 0,
              `auto highlight is set for ${subLayer.id}`
            );
            if (uniforms.picking_uSelectedColorValid) {
              t.deepEqual(
                uniforms.picking_uSelectedColor,
                [1, 0, 0],
                'highlighted index is set correctly'
              );
            }
          }
        }
      },
      {
        pickedColor: new Uint8Array([2, 0, 0, 0]),
        pickedLayerId: 'geojson-points-circle',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.comment('hover over point feature');

          t.ok(info.object.properties, 'info.object populated');
          t.is(info.object.geometry.type, 'Point', 'info.object populated');

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].getUniforms();
            t.is(
              uniforms.picking_uSelectedColorValid,
              subLayer.id === 'geojson-points-circle' ? 1 : 0,
              `auto highlight is set for ${subLayer.id}`
            );
            if (uniforms.picking_uSelectedColorValid) {
              t.deepEqual(
                uniforms.picking_uSelectedColor,
                [2, 0, 0],
                'highlighted index is set correctly'
              );
            }
          }
        }
      },
      {
        pickedColor: new Uint8Array([6, 0, 0, 1]),
        pickedLayerId: 'geojson-polygons-fill',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.comment('hover over polygon feature');

          t.ok(info.object.properties, 'info.object populated');
          t.is(info.object.geometry.type, 'Polygon', 'info.object populated');

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].getUniforms();
            t.is(
              uniforms.picking_uSelectedColorValid,
              subLayer.id === 'geojson-points-circle' ? 0 : 1,
              `auto highlight is set for ${subLayer.id}`
            );
            if (uniforms.picking_uSelectedColorValid) {
              t.deepEqual(
                uniforms.picking_uSelectedColor,
                [6, 0, 0],
                'highlighted index is set correctly'
              );
            }
          }
        }
      },
      {
        pickedColor: new Uint8Array([0, 0, 0, 0]),
        pickedLayerId: null,
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          t.comment('pointer leave');

          t.notOk(info.object, 'info.object is null');

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].getUniforms();
            t.is(
              uniforms.picking_uSelectedColorValid,
              0,
              `auto highlight is set for ${subLayer.id}`
            );
          }
        }
      }
    ]
  });

  t.end();
});
