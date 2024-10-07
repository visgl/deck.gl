// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {testLayer, generateLayerTests, getLayerUniforms} from '@deck.gl/test-utils';
import {geojsonToBinary} from '@loaders.gl/gis';

import {GeoJsonLayer} from 'deck.gl';
import {DataFilterExtension} from '@deck.gl/extensions';

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
  const geojsonData = JSON.parse(JSON.stringify(FIXTURES.geojson.features)).slice(0, 7);
  const binaryData = geojsonToBinary(geojsonData);

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
      data: binaryData
    }
  });

  const binaryDataWithAttributes = {
    ...binaryData,
    points: {
      ...binaryData.points,
      attributes: {
        getRadius: {
          size: 1,
          value: binaryData.points.featureIds.value.map((_, i) => i)
        }
      }
    },
    lines: {
      ...binaryData.lines,
      attributes: {
        getWidth: {
          size: 1,
          value: binaryData.lines.featureIds.value.map((_, i) => i)
        }
      }
    },
    polygons: {
      ...binaryData.polygons,
      attributes: {
        getColor: {
          size: 3,
          value: new Uint16Array(binaryData.polygons.featureIds.value.length * 3).fill(255)
        }
      }
    }
  };

  testCases.push({
    title: 'GeoJsonLayer#binaryAttributes',
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({subLayers}) => {
      // Polygons-fill
      t.ok(
        subLayers[0].props.data.attributes.getColor,
        'polygon-fill subLayer should receive passed binary attribute'
      );
      // Polygons-stroke
      t.ok(
        subLayers[1].props.data.attributes.getColor,
        'polygon-stroke subLayer should receive passed binary attribute'
      );
      // Lines
      t.ok(
        subLayers[2].props.data.attributes.getWidth,
        'linestrings subLayer should receive passed binary attribute'
      );
      // Points
      t.ok(
        subLayers[3].props.data.attributes.getRadius,
        'points subLayer should receive passed binary attribute'
      );
    },
    props: {
      // TODO: Set a right geojson example as the provided from 'deck.gl-data' contains 'GeometryCollection' types that are not compatible with geojsonToBinary
      data: binaryDataWithAttributes
    }
  });

  const binaryDataWithGetFilterValue = {
    ...binaryData,
    ...['points', 'lines', 'polygons'].reduce((acc, key) => {
      acc[key] = {
        ...binaryData[key],
        attributes: {
          getFilterValue: {
            size: 1,
            value: binaryData[key].featureIds.value.map(_ => 0)
          }
        }
      };
      return acc;
    }, {})
  };

  testCases.push({
    title: 'GeoJsonLayer#DataFilterExtensionWithBinaryAttributes',
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({subLayers, subLayer}) => {
      t.ok(
        subLayers.every(_subLayer => _subLayer.props.data.attributes.getFilterValue),
        'every subLayer should receive getFilterValue binary attribute'
      );
      const uniforms = getLayerUniforms(subLayer, 'dataFilter');
      t.is(uniforms.min, 1, 'has correct uniforms');
      t.is(uniforms.max, 1, 'has correct uniforms');
      t.is(uniforms.useSoftMargin, false, 'has correct uniforms');
      t.is(uniforms.enabled, true, 'has correct uniforms');
    },
    updateProps: {
      data: binaryDataWithGetFilterValue,
      filterRange: [1, 1],
      extensions: [new DataFilterExtension()]
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
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            t.is(
              uniforms.picking.isHighlightActive,
              subLayer.id === 'geojson-points-circle',
              `auto highlight is set for ${subLayer.id}`
            );
            if (uniforms.picking.isHighlightActive) {
              t.deepEqual(
                uniforms.picking.highlightedObjectColor,
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
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            t.is(
              uniforms.picking.isHighlightActive,
              subLayer.id === 'geojson-points-circle',
              `auto highlight is set for ${subLayer.id}`
            );
            if (uniforms.picking.isHighlightActive) {
              t.deepEqual(
                uniforms.picking.highlightedObjectColor,
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
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            t.is(
              uniforms.picking.isHighlightActive,
              subLayer.id !== 'geojson-points-circle',
              `auto highlight is set for ${subLayer.id}`
            );
            if (uniforms.picking.isHighlightActive) {
              t.deepEqual(
                uniforms.picking.highlightedObjectColor,
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
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            t.is(
              uniforms.picking.isHighlightActive,
              false,
              `auto highlight is set for ${subLayer.id}`
            );
          }
        }
      }
    ]
  });

  t.end();
});
