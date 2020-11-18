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
        const filteredLayers = subLayers.filter(l => l.id === 'GeoJsonLayer-points');
        t.ok(filteredLayers.length === 1);

        const scatterplotLayer = filteredLayers[0];
        const uniforms = scatterplotLayer.getModels()[0].getUniforms();
        t.ok(uniforms.radiusScale === SIZE);
      }
    },
    {
      props: {
        data: FIXTURES.geojson,
        getSize: SIZE,
        pointRadiusUnits: 'pixels'
      },
      onAfterUpdate: ({subLayers}) => {
        const filteredLayers = subLayers.filter(l => l.id === 'GeoJsonLayer-points');
        t.ok(filteredLayers.length === 1);

        const scatterplotLayer = filteredLayers[0];
        const uniforms = scatterplotLayer.getModels()[0].getUniforms();
        const {viewport} = scatterplotLayer.context;
        t.ok(uniforms.radiusScale === SIZE * viewport.metersPerPixel);
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});
  t.end();
});
