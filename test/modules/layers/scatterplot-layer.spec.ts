// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';
import {UNIT, Layer} from '@deck.gl/core';
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
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
        updateProps: {normalizedColors: true},
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
