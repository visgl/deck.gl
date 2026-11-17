// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';

import {PathLayer, PolygonLayer, SolidPolygonLayer} from 'deck.gl';

import * as FIXTURES from 'deck.gl-test/data';

test('PolygonLayer', () => {
  const testCases = generateLayerTests({
    Layer: PolygonLayer,
    sampleProps: {
      data: FIXTURES.polygons.slice(0, 3),
      getPolygon: f => f,
      getFillColor: (f, {index}) => [index, 0, 0]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate({layer}) {
      if (layer.props.data && layer.props.data.length) {
        expect(layer.state.paths.length, 'should update state.paths').toBeTruthy();
      }
      if (Object.prototype.hasOwnProperty.call(layer.props, '_dataDiff') && layer.props._dataDiff) {
        expect(
          Array.isArray(layer.state.pathsDiff),
          'created diff for sub path layer'
        ).toBeTruthy();
      }
    }
  });

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathLayer packs normalized per-vertex colors and keeps typed bytes', () => {
  const data = [
    {
      path: [
        [0, 0],
        [1, 0],
        [1, 1]
      ]
    }
  ];
  const byteColor = new Uint8Array([65, 32, 16, 128]);
  const getColor = () => [[1, 0.5, 0, 0], byteColor, [0, 1, 0]];

  testLayer({
    Layer: PathLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {props: {data, getPath: row => row.path, getColor}},
      {
        onBeforeUpdate: ({layer}) => {
          layer.context.layerManager.setProps({normalizedColors: true});
        },
        onAfterUpdate: ({layer}) => {
          const {instanceColors} = layer.getAttributeManager()!.attributes;
          expect(Array.from(instanceColors.value!.slice(0, 12))).toEqual([
            255, 128, 0, 0, 65, 32, 16, 128, 0, 255, 0, 255
          ]);
        }
      }
    ]
  });
});

test('SolidPolygonLayer packs normalized fills and wireframes', () => {
  const data = [
    {
      polygon: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0]
      ]
    }
  ];
  testLayer({
    Layer: SolidPolygonLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          data,
          getPolygon: row => row.polygon,
          extruded: true,
          wireframe: true,
          getFillColor: [0, 0.5, 1],
          getLineColor: () => [1, 0, 0, 0]
        }
      },
      {
        onBeforeUpdate: ({layer}) => {
          layer.context.layerManager.setProps({normalizedColors: true});
        },
        onAfterUpdate: ({layer}) => {
          const {fillColors, lineColors} = layer.getAttributeManager()!.attributes;
          expect(Array.from(fillColors.value!)).toEqual(
            Array.from(new Float32Array([0, 128 / 255, 1, 1]))
          );
          expect(Array.from(lineColors.value!.slice(0, 4))).toEqual([255, 0, 0, 0]);
        }
      }
    ]
  });
});

test('PolygonLayer forwards normalized strokes and wireframes as bytes', () => {
  const data = [
    {
      polygon: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0]
      ]
    }
  ];
  const getLineColor = () => [1, 0.5, 0, 0];
  testLayer({
    Layer: PolygonLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {props: {data, getPolygon: row => row.polygon, getLineColor}},
      {
        onBeforeUpdate: ({layer}) => {
          layer.context.layerManager.setProps({normalizedColors: true});
        },
        onAfterUpdate: ({subLayers}) => {
          const fill = subLayers.find(layer => layer.id.endsWith('-fill'))!;
          const stroke = subLayers.find(layer => layer.id.endsWith('-stroke'))!;
          expect(fill.props.getFillColor).toEqual([0, 0, 0, 255]);
          const {instanceColors} = stroke.getAttributeManager()!.attributes;
          expect(Array.from(instanceColors.value!.slice(0, 4))).toEqual([255, 128, 0, 0]);
        }
      },
      {
        updateProps: {extruded: true, wireframe: true, getFillColor: [0, 1, 0, 0]},
        onAfterUpdate: ({subLayers}) => {
          const fill = subLayers.find(layer => layer.id.endsWith('-fill'))!;
          expect(fill.props.getFillColor).toEqual([0, 255, 0, 0]);
          const {lineColors} = fill.getAttributeManager()!.attributes;
          expect(Array.from(lineColors.value!.slice(0, 4))).toEqual([255, 128, 0, 0]);
        }
      }
    ]
  });
});
