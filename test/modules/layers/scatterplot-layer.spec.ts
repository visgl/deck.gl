// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';
import {UNIT, Layer} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
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
