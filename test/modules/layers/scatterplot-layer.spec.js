import test from 'tape-catch';
import {testLayer} from '@deck.gl/test-utils';
import {GeoJsonLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';

const SIZE = 1;

test('ScatterplotLayer points size by radiusUnits prop', t => {
  const testCases = [
    {
      props: {
        data: FIXTURES.geojson,
        getSize: SIZE,
        pointRadiusUnits: 'meters'
      },
      onAfterUpdate: ({subLayers}) => {
        const filteredLayers = subLayers.filter(l => l.id === 'GeoJsonLayer-points-circle');
        t.ok(filteredLayers.length === 1);

        const scatterplotLayer = filteredLayers[0];
        const uniforms = scatterplotLayer.getModels()[0].getUniforms();
        t.notOk(uniforms.pixelRadius);
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
        t.ok(filteredLayers.length === 1);

        const scatterplotLayer = filteredLayers[0];
        const uniforms = scatterplotLayer.getModels()[0].getUniforms();
        t.ok(uniforms.pixelRadius);
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});
  t.end();
});
