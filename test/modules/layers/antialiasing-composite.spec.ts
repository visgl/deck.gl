// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {testLayer} from '@deck.gl/test-utils/vitest';

import {PolygonLayer, GeoJsonLayer} from '@deck.gl/layers';

const POLYGON = [
  {
    polygon: [
      [-122.45, 37.78],
      [-122.44, 37.79],
      [-122.43, 37.78],
      [-122.45, 37.78]
    ]
  }
];

const GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-122.45, 37.78],
          [-122.44, 37.79]
        ]
      }
    }
  ]
};

/** Read the `antialiasing` uniform off whichever sub layer renders the stroke. */
function strokeAntialiasing(subLayers) {
  const stroke = subLayers.find(l => l.constructor.layerName === 'PathLayer');
  expect(stroke, 'a PathLayer sub layer was rendered').toBeTruthy();
  return stroke.getModels()[0].shaderInputs.getUniformValues().path.antialiasing;
}

test('PolygonLayer#lineAntialiasing forwards to the stroke sub layer', () => {
  testLayer({
    Layer: PolygonLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {data: POLYGON, getPolygon: d => d.polygon, stroked: true, filled: false},
        onAfterUpdate: ({subLayers}) => {
          expect(strokeAntialiasing(subLayers), 'defaults to false').toBeFalsy();
        }
      },
      {
        updateProps: {lineAntialiasing: true},
        onAfterUpdate: ({subLayers}) => {
          expect(strokeAntialiasing(subLayers), 'reaches the PathLayer sub layer').toBe(true);
        }
      }
    ]
  });
});

test('GeoJsonLayer#lineAntialiasing forwards to the stroke sub layer', () => {
  testLayer({
    Layer: GeoJsonLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {data: GEOJSON},
        onAfterUpdate: ({subLayers}) => {
          expect(strokeAntialiasing(subLayers), 'defaults to false').toBeFalsy();
        }
      },
      {
        updateProps: {lineAntialiasing: true},
        onAfterUpdate: ({subLayers}) => {
          expect(strokeAntialiasing(subLayers), 'reaches the PathLayer sub layer').toBe(true);
        }
      }
    ]
  });
});
