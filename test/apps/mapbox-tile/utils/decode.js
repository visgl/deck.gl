import Protobuf from 'pbf';
import {VectorTile} from '@mapbox/vector-tile';
import {vectorTileFeatureToGeoJSON} from './feature';

const PI = Math.PI;
const PI_4 = PI / 4;
const RADIANS_TO_DEGREES_2 = 360 / PI;

export function decodeTile(x, y, z, arrayBuffer) {
  const tile = new VectorTile(new Protobuf(arrayBuffer));

  const result = [];

  const scale = Math.pow(2, z);
  const projX = x / scale;
  const projY = y / scale;

  const projectFunc = project.bind(null, projX, projY, scale);

  for (const layerName in tile.layers) {
    const vectorTileLayer = tile.layers[layerName];
    for (let i = 0; i < vectorTileLayer.length; i++) {
      const vectorTileFeature = vectorTileLayer.feature(i);
      const features = vectorTileFeatureToGeoJSON(vectorTileFeature, projectFunc);
      for (const f of features) {
        f.properties.layer = layerName;
        result.push(f);
      }
    }
  }
  return result;
}

function project(x, y, scale, line, extent) {
  const pixelToCommon = 1 / extent / scale;

  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    // common space
    const cx = x + p[0] * pixelToCommon;
    const cy = y + p[1] * pixelToCommon;
    // LNGLAT
    p[0] = cx * 360 - 180;
    p[1] = (Math.atan(Math.exp(PI - cy * 2 * PI)) - PI_4) * RADIANS_TO_DEGREES_2;
  }
}
