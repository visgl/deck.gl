import test from 'tape-promise/tape';
import {geojsonToBinary} from '@loaders.gl/gis';
import {calculatePickingColors} from '@deck.gl/layers/geojson-layer/geojson-binary';
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
