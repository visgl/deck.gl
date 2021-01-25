import test from 'tape-catch';
import {geojsonToBinary} from '@loaders.gl/gis';
import {calculatePickingColors} from '@deck.gl/layers/geojson-layer/geojson-binary';
import {_binaryToFeature, _findIndexBinary} from '@deck.gl/layers';
import {Layer} from '@deck.gl/core';
import {geoJSONData, pickingColorsSample} from './data/fixtures';

const geoJSONBinaryData = geojsonToBinary(geoJSONData);
const dummyLayer = new Layer();

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
