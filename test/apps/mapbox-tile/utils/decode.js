import Protobuf from 'pbf';
import {VectorTile} from '@mapbox/vector-tile';
import {vectorTileFeatureToGeoJSON} from './feature';

const TILE_SIZE = 512;

export function decodeTile(x, y, z, arrayBuffer) {
  const tile = new VectorTile(new Protobuf(arrayBuffer));

  const result = [];

  const scale = Math.pow(2, z);
  const projX = (x * TILE_SIZE) / scale;
  const projY = (y * TILE_SIZE) / scale;

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
  const pixelToCommon = TILE_SIZE / extent / scale;

  for (let i = 0; i < line.length; i++) {
    const p = line[i];
    // convert to deck.gl common space
    p[0] = x + p[0] * pixelToCommon;
    p[1] = TILE_SIZE - y - p[1] * pixelToCommon;
  }
}
