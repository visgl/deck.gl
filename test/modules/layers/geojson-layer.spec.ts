// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests, getLayerUniforms} from '@deck.gl/test-utils/vitest';
import {geojsonToBinary} from '@loaders.gl/gis';

import {GeoJsonLayer} from 'deck.gl';
import {DataFilterExtension} from '@deck.gl/extensions';

import * as FIXTURES from 'deck.gl-test/data';
import {testPickingLayer} from './test-picking-layer';

test('GeoJsonLayer#tests', () => {
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
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      expect(layer.state.features, 'should update features').toBeTruthy();
      const hasData = layer.props && layer.props.data && Object.keys(layer.props.data).length;
      expect(subLayers.length, 'correct number of sublayers').toBe(
        !hasData ? 0 : layer.props.stroked && !layer.props.extruded ? 6 : 5
      );
    }
  });

  testCases.push({
    title: 'GeoJsonLayer#highlightedObjectIndex',
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      expect(
        subLayers.every(l => Number.isFinite(l.props.highlightedObjectIndex)),
        "sublayers' highlightedObjectIndex prop is populated"
      ).toBeTruthy();
      // check prop forwarding
      for (const l of subLayers) {
        expect(
          Object.keys(l.props).every(key => key.startsWith('_') || l.props[key] !== undefined),
          'sublayer props are defined'
        ).toBeTruthy();
      }
    },
    updateProps: {
      highlightedObjectIndex: 5
    }
  });

  // Add partial update test case
  testCases.push({
    title: 'GeoJsonLayer#partial update',
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      const {featuresDiff} = layer.state;
      expect(featuresDiff, 'created diff for subLayers').toEqual({
        polygonFeatures: [{startRow: 0, endRow: 3}],
        polygonOutlineFeatures: [{startRow: 0, endRow: 3}],
        lineFeatures: [{startRow: 0, endRow: 0}],
        pointFeatures: [{startRow: 0, endRow: 0}]
      });
      expect(
        subLayers.every(l => l.props._dataDiff),
        "sublayers' dataDiff prop is populated"
      ).toBeTruthy();
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
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      expect(
        layer.state.layerProps.points.data.featureIds &&
          layer.state.layerProps.lines.data.featureIds &&
          layer.state.layerProps.polygons.data.featureIds &&
          layer.state.layerProps.polygonsOutline.data.featureIds,
        'should receive data in binary mode'
      ).toBeTruthy();
      expect(layer.state.binary, 'detects binary data').toBeTruthy();
      const hasData = layer.props && layer.props.data && Object.keys(layer.props.data).length;
      expect(subLayers.length, 'correct number of sublayers').toBe(
        !hasData ? 0 : layer.props.stroked && !layer.props.extruded ? 4 : 3
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
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({subLayers}) => {
      // Polygons-fill
      expect(
        subLayers[0].props.data.attributes.getColor,
        'polygon-fill subLayer should receive passed binary attribute'
      ).toBeTruthy();
      // Polygons-stroke
      expect(
        subLayers[1].props.data.attributes.getColor,
        'polygon-stroke subLayer should receive passed binary attribute'
      ).toBeTruthy();
      // Lines
      expect(
        subLayers[2].props.data.attributes.getWidth,
        'linestrings subLayer should receive passed binary attribute'
      ).toBeTruthy();
      // Points
      expect(
        subLayers[3].props.data.attributes.getRadius,
        'points subLayer should receive passed binary attribute'
      ).toBeTruthy();
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
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({subLayers, subLayer}) => {
      expect(
        subLayers.every(_subLayer => _subLayer.props.data.attributes.getFilterValue),
        'every subLayer should receive getFilterValue binary attribute'
      ).toBeTruthy();
      const uniforms = getLayerUniforms(subLayer, 'dataFilter');
      expect(uniforms.min, 'has correct uniforms').toBe(1);
      expect(uniforms.max, 'has correct uniforms').toBe(1);
      expect(uniforms.useSoftMargin, 'has correct uniforms').toBe(false);
      expect(uniforms.enabled, 'has correct uniforms').toBe(true);
    },
    updateProps: {
      data: binaryDataWithGetFilterValue,
      filterRange: [1, 1],
      extensions: [new DataFilterExtension()]
    }
  });

  testLayer({Layer: GeoJsonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('GeoJsonLayer#picking', async () => {
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
          console.log('hover over point feature');

          expect(info.object.properties, 'info.object populated').toBeTruthy();
          expect(info.object.geometry.type, 'info.object populated').toBe('Point');

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            expect(
              uniforms.picking.isHighlightActive,
              `auto highlight is set for ${subLayer.id}`
            ).toBe(subLayer.id === 'geojson-points-circle');
            if (uniforms.picking.isHighlightActive) {
              expect(
                uniforms.picking.highlightedObjectColor,
                'highlighted index is set correctly'
              ).toEqual([1, 0, 0]);
            }
          }
        }
      },
      {
        pickedColor: new Uint8Array([2, 0, 0, 0]),
        pickedLayerId: 'geojson-points-circle',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          console.log('hover over point feature');

          expect(info.object.properties, 'info.object populated').toBeTruthy();
          expect(info.object.geometry.type, 'info.object populated').toBe('Point');

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            expect(
              uniforms.picking.isHighlightActive,
              `auto highlight is set for ${subLayer.id}`
            ).toBe(subLayer.id === 'geojson-points-circle');
            if (uniforms.picking.isHighlightActive) {
              expect(
                uniforms.picking.highlightedObjectColor,
                'highlighted index is set correctly'
              ).toEqual([2, 0, 0]);
            }
          }
        }
      },
      {
        pickedColor: new Uint8Array([6, 0, 0, 1]),
        pickedLayerId: 'geojson-polygons-fill',
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          console.log('hover over polygon feature');

          expect(info.object.properties, 'info.object populated').toBeTruthy();
          expect(info.object.geometry.type, 'info.object populated').toBe('Polygon');

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            expect(
              uniforms.picking.isHighlightActive,
              `auto highlight is set for ${subLayer.id}`
            ).toBe(subLayer.id !== 'geojson-points-circle');
            if (uniforms.picking.isHighlightActive) {
              expect(
                uniforms.picking.highlightedObjectColor,
                'highlighted index is set correctly'
              ).toEqual([6, 0, 0]);
            }
          }
        }
      },
      {
        pickedColor: new Uint8Array([0, 0, 0, 0]),
        pickedLayerId: null,
        mode: 'hover',
        onAfterUpdate: ({layer, subLayers, info}) => {
          console.log('pointer leave');

          expect(info.object, 'info.object is null').toBeFalsy();

          for (const subLayer of subLayers) {
            const uniforms = subLayer.getModels()[0].shaderInputs.getUniformValues();
            expect(
              uniforms.picking.isHighlightActive,
              `auto highlight is set for ${subLayer.id}`
            ).toBe(false);
          }
        }
      }
    ]
  });
});
