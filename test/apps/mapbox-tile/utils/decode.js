import Protobuf from 'pbf';
import {VectorTile} from '@mapbox/vector-tile';
import {worldToLngLat} from 'viewport-mercator-project';
import {vectorTileFeatureToGeoJSON} from './feature';

const TILE_SIZE = 512;

export function decodeTiles(x, y, z, arrayBuff) {
  const tile = new VectorTile(new Protobuf(arrayBuff));

  const result = [];
  const projectFunc = project.bind(null, x, y, z);

  for (const layerName in tile.layers) {
    const vectorTileLayer = tile.layers[layerName];
    for (let i = 0; i < vectorTileLayer.length; i++) {
      const vectorTileFeature = vectorTileLayer.feature(i);
      const features = vectorTileFeatureToGeoJSON(vectorTileFeature, projectFunc);
      features.forEach(f => {
        f.properties.layer = layerName;
        result.push(f);
      });
    }
  }
  return result;
}

function project(x, y, z, line, extent) {
  const sizeToPixel = extent / TILE_SIZE;
  const scale = Math.pow(2, z);

  for (let ii = 0; ii < line.length; ii++) {
    const p = line[ii];

    // LNGLAT
    line[ii] = worldToLngLat(
      [x * TILE_SIZE + p[0] / sizeToPixel, y * TILE_SIZE + p[1] / sizeToPixel],
      scale
    );
  }
}
