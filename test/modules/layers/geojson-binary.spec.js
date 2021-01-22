import test from 'tape-catch';
import {geojsonToBinary} from '@loaders.gl/gis';
import {calculatePickingColors} from '@deck.gl/layers/geojson-layer/geojson-binary';
import {_binaryToFeature, _findIndexBinary} from '@deck.gl/layers';
import {Layer} from '@deck.gl/core';

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
      cartodb_id: 148,
      name: 'First'
    }
  },
  {
    id: 2,
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0.90908203125, 0.9935546875],
          [0.9095703125, 0.99404296875],
          [0.90908203125, 0.99404296875],
          [0.90908203125, 0.9935546875]
        ]
      ]
    },
    properties: {
      cartodb_id: 149,
      name: 'Second'
    }
  }
];

const geoJSONBinaryData = geojsonToBinary(geoJSONData);
const dummyLayer = new Layer();
const pickingColorsSample = Uint8ClampedArray.from([
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  2,
  0,
  0,
  2,
  0,
  0,
  2,
  0,
  0,
  2,
  0,
  0
]);

test('calculatePickingColors', t => {
  const customPickingColors = calculatePickingColors(
    geoJSONBinaryData,
    dummyLayer.encodePickingColor
  );
  t.deepEqual(
    Object.keys(customPickingColors),
    ['points', 'lines', 'polygons'],
    'creates a picking color object for the three types of geometry'
  );
  t.deepEqual(
    customPickingColors.polygons,
    pickingColorsSample,
    'creates a right picking colors array for binary geojson'
  );

  t.end();
});

test('binaryToFeature', t => {
  const feature = _binaryToFeature(geoJSONBinaryData.polygons, 1);
  const expectedFeature = {
    properties: {
      cartodb_id: 149,
      name: 'Second'
    }
  };
  t.deepEqual(feature, expectedFeature, 'finds a feature by its feature index');

  t.end();
});

test('findIndexBinaryByNumericProp', t => {
  const index = _findIndexBinary(geoJSONBinaryData, 'cartodb_id', 149);
  t.equal(index, 4, 'finds the index of a feature by one of its numeric properties');

  t.end();
});

test('findIndexBinaryByTextProperty', t => {
  const index = _findIndexBinary(geoJSONBinaryData, 'name', 'Second');
  t.equal(index, 4, 'finds the index of a feature by one of its properties');

  t.end();
});
