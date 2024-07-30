import test from 'tape-promise/tape';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';
import {UNIT, Layer} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';

const SIZE = 1;

test('ScatterplotLayer points radiusUnits prop', t => {
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
        t.is(uniforms.radiusUnits, UNIT.meters, 'radiusUnits "meters"');
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
        t.is(uniforms.radiusUnits, UNIT.pixels, 'radiusUnits "pixels"');
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
        t.is(uniforms.radiusUnits, UNIT.common, 'radiusUnits "common"');
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});
  t.end();
});
