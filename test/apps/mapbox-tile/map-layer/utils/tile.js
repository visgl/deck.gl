/* global fetch */
import {VectorTile} from '@mapbox/vector-tile';
import {worldToLngLat, getDistanceScales} from 'viewport-mercator-project';
import Protobuf from 'pbf';

import {vectorTileFeatureToGeoJSON} from './feature';

const TILE_SIZE = 512;

export default class Tile {
  constructor({source, x, y, z}) {
    this.sourceURL = source
      .replace('{x}', x)
      .replace('{y}', y)
      .replace('{z}', z);

    this.x = x;
    this.y = y;
    this.z = z;

    this._data = null;
    this._loader = null;
    this.isVisible = false;

    this._project = this._project.bind(this);

    this._init();
  }

  get data() {
    return this._data || this._loader;
  }

  get isLoaded() {
    return this._data !== null;
  }

  overlaps(tile) {
    const {x, y, z} = this;
    const m = Math.pow(2, tile.z - z);
    return Math.floor(tile.x / m) === x && Math.floor(tile.y / m) === y;
  }

  _init() {
    const scale = Math.pow(2, this.z);

    this.scale = scale;

    this.center = worldToLngLat([(this.x + 0.5) * TILE_SIZE, (this.y + 0.5) * TILE_SIZE], scale);

    this.distanceScales = getDistanceScales({
      longitude: this.center[0],
      latitude: this.center[1],
      zoom: this.z,
      scale,
      highPrecision: true
    });

    this._loader = this._loadData();
  }

  _loadData() {
    return fetch(this.sourceURL)
      .then(resp => resp.arrayBuffer())
      .then(data => {
        const tile = new VectorTile(new Protobuf(data));
        const result = [];
        for (const layerName in tile.layers) {
          const vectorTileLayer = tile.layers[layerName];

          for (let i = 0; i < vectorTileLayer.length; i++) {
            const vectorTileFeature = vectorTileLayer.feature(i);
            const features = vectorTileFeatureToGeoJSON(vectorTileFeature, this._project);
            features.forEach(f => {
              f.properties.layer = layerName;
              result.push(f);
            });
          }
        }
        this._data = result;

        return result;
      });
  }

  _project(line, extent) {
    const sizeToPixel = extent / TILE_SIZE;
    const b = extent / 2;
    const {pixelsPerMeter, pixelsPerMeter2} = this.distanceScales;

    for (let ii = 0; ii < line.length; ii++) {
      const p = line[ii];

      // LNGLAT
      // line[ii] = worldToLngLat([
      //   this.x * TILE_SIZE + p[0] / sizeToPixel,
      //   this.y * TILE_SIZE + p[1] / sizeToPixel
      // ], this.scale);

      // METER_OFFSET
      p[1] = (b - p[1]) / sizeToPixel / pixelsPerMeter[1];
      p[0] = (p[0] - b) / sizeToPixel / (pixelsPerMeter[0] + pixelsPerMeter2[0] * p[1]);
    }
  }
}
