// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';
import {UNIT, Layer} from '@deck.gl/core';
import {ArcLayer, GeoJsonLayer, LineLayer, ScatterplotLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';

const SIZE = 1;

test('ScatterplotLayer points radiusUnits prop', () => {
  const testCases = [
    {
      props: {
        data: FIXTURES.geojson,
        getSize: SIZE,
        pointRadiusUnits: 'meters'
      },
      onAfterUpdate: ({subLayers}) => {
        const filteredLayers = subLayers.filter(l => l.id === 'GeoJsonLayer-points-circle');

        const scatterplotLayer = filteredLayers[0] as Layer;
        const uniforms = getLayerUniforms(scatterplotLayer);
        expect(uniforms.radiusUnits, 'radiusUnits "meters"').toBe(UNIT.meters);
      }
    },
    {
      props: {
        data: FIXTURES.geojson,
        getSize: SIZE,
        pointRadiusUnits: 'pixels'
      },
      onAfterUpdate: ({subLayers}) => {
        const filteredLayers = subLayers.filter(l => l.id === 'GeoJsonLayer-points-circle');

        const scatterplotLayer = filteredLayers[0] as Layer;
        const uniforms = getLayerUniforms(scatterplotLayer);
        expect(uniforms.radiusUnits, 'radiusUnits "pixels"').toBe(UNIT.pixels);
      }
    },
    {
      props: {
        data: FIXTURES.geojson,
        getSize: SIZE,
        pointRadiusUnits: 'common'
      },
      onAfterUpdate: ({subLayers}) => {
        const filteredLayers = subLayers.filter(l => l.id === 'GeoJsonLayer-points-circle');

        const scatterplotLayer = filteredLayers[0] as Layer;
        const uniforms = getLayerUniforms(scatterplotLayer);
        expect(uniforms.radiusUnits, 'radiusUnits "common"').toBe(UNIT.common);
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('ScatterplotLayer opts plain color arrays into normalized input', () => {
  const data = [{position: [0, 0]}];
  const getLineColor = () => [1, 0, 0, 0] as const;
  const typedColor = new Uint8Array([1, 128, 255, 0]);
  testLayer({
    Layer: ScatterplotLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {data, getFillColor: [0.5, 1, 0], getLineColor},
        onAfterUpdate: ({layer}) => {
          const colors = layer.getAttributeManager()!.attributes.instanceLineColors;
          expect(Array.from(colors.value!.slice(0, 4))).toEqual([1, 0, 0, 0]);
        }
      },
      {
        onBeforeUpdate: ({layer}) => {
          layer.context.layerManager.setProps({normalizedColors: true});
        },
        onAfterUpdate: ({layer}) => {
          const {instanceFillColors, instanceLineColors} = layer.getAttributeManager()!.attributes;
          expect(Array.from(instanceFillColors.value!)).toEqual(
            Array.from(new Float32Array([128 / 255, 1, 0, 1]))
          );
          expect(Array.from(instanceLineColors.value!.slice(0, 4))).toEqual([255, 0, 0, 0]);
        }
      },
      {
        updateProps: {getFillColor: typedColor},
        onAfterUpdate: ({layer}) => {
          const colors = layer.getAttributeManager()!.attributes.instanceFillColors;
          expect(Array.from(colors.value!)).toEqual(
            Array.from(new Float32Array([1 / 255, 128 / 255, 1, 0]))
          );
        }
      }
    ]
  });
});

test('Deck color convention updates LineLayer and ArcLayer accessors', () => {
  const getSourcePosition = () => [0, 0] as const;
  const getTargetPosition = () => [1, 1] as const;
  const getColor = () => [1, 0.5, 0, 0] as const;
  const data = [{}];

  for (const [layer, attributeName] of [
    [new LineLayer({data, getSourcePosition, getTargetPosition, getColor}), 'instanceColors'],
    [
      new ArcLayer({data, getSourcePosition, getTargetPosition, getSourceColor: getColor}),
      'instanceSourceColors'
    ]
  ] as const) {
    testLayer({
      Layer: layer.constructor as typeof Layer,
      onError: error => {
        throw error;
      },
      testCases: [
        {props: layer.props},
        {
          onBeforeUpdate: ({layer: current}) => {
            current.context.layerManager.setProps({normalizedColors: true});
          },
          onAfterUpdate: ({layer: current}) => {
            const attributes = current.getAttributeManager()!.attributes;
            expect(Array.from(attributes[attributeName].value!.slice(0, 4))).toEqual([
              255, 128, 0, 0
            ]);
            if (attributes.instanceTargetColors) {
              expect(Array.from(attributes.instanceTargetColors.value!)).toEqual([0, 0, 0, 1]);
            }
          }
        }
      ]
    });
  }
});

test('GeoJsonLayer preserves byte point colors when Deck enables normalized colors', () => {
  testLayer({
    Layer: GeoJsonLayer,
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          data: [{type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [0, 0]}}],
          getFillColor: [128, 64, 32, 128]
        }
      },
      {
        onBeforeUpdate: ({layer}) => {
          layer.context.layerManager.setProps({normalizedColors: true});
        },
        onAfterUpdate: ({subLayers}) => {
          const points = subLayers.find(layer => layer instanceof ScatterplotLayer)!;
          const color = points.getAttributeManager()!.attributes.instanceFillColors.value!;
          expect(Array.from(color)).toEqual(
            Array.from(new Float32Array([128 / 255, 64 / 255, 32 / 255, 128 / 255]))
          );
        }
      }
    ]
  });
});
