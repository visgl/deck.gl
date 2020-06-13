import test from 'tape-catch';
import {testLayer} from '@deck.gl/test-utils';
import {MVTLayer} from '@deck.gl/geo-layers';
import ClipExtension from '@deck.gl/geo-layers/mvt-layer/clip-extension';
import {GeoJsonLayer} from '@deck.gl/layers';

import * as FIXTURES from 'deck.gl-test/data';

const geoJSONData = [
  {
    id: 1,
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0.80908203125, 0.8935546875],
          [0.8095703125, 0.89404296875],
          [0.80908203125, 0.89404296875],
          [0.80908203125, 0.8935546875]
        ]
      ]
    },
    properties: {
      cartodb_id: 148
    }
  }
];

test('ClipExtension', t => {
  const testCases = [
    {
      props: {
        id: 'clip-extension-test',
        data: FIXTURES.geojson,
        stroked: true,
        filled: true,
        extensions: [new ClipExtension()],
        clipBounds: [0, -30, 90, 30]
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          const uniforms = layer.getModels()[0].getUniforms();
          if (layer.id.endsWith('points')) {
            t.ok(uniforms.clip_bounds && uniforms.clip_bounds[0] === 0, 'has clip_bounds uniform');
          } else {
            t.ok(
              uniforms.clip_bounds && uniforms.clip_bounds[0] === 256,
              'has clip_bounds uniform'
            );
          }
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});

test.skip('MVT Highlight', t => {
  class TestMVTLayer extends MVTLayer {
    getTileData() {
      return geoJSONData;
    }
  }

  const testCases = [
    {
      props: {
        data: ['https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'],
        id: 'mvt-highlight-test',
        filled: true,
        pickable: true,
        autoHighlight: true,
        highlightedFeatureId: 1
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          t.ok(layer.props.pickable, 'MVT Sublayer is pickable');
          t.ok(layer.props.autoHighlight, 'AutoHighlight should be disabled');
          t.equal(layer.props.highlightedObjectIndex, 0, 'Feature highlighted has index 0');
        }
      }
    }
  ];

  testLayer({Layer: TestMVTLayer, testCases, onError: t.notOk});

  t.end();
});
