import {VectorTile, VectorTileFeature} from '@mapbox/vector-tile';
import {worldToLngLat, getDistanceScales} from 'viewport-mercator-project';
import Protobuf from 'pbf';

const TILE_SIZE = 512;

export default class Tile {
  constructor({source, x, y, z}) {
    this.sourceURL = source.replace('{x}', x)
      .replace('{y}', y)
      .replace('{z}', z);

    this.x = x;
    this.y = y;
    this.z = z;

    this._init();

    this.loader = null;
    this.isLoaded = false;
  }

  _init() {
    const scale = Math.pow(2, this.z);

    this.center = worldToLngLat(
      [(this.x + 0.5) * TILE_SIZE, (this.y + 0.5) * TILE_SIZE],
      scale
    );

    this.distanceScales = getDistanceScales({
      longitude: this.center[0],
      latitude: this.center[1],
      zoom: this.z,
      scale,
      highPrecision: true
    });
  }

  getData() {
    if (!this.loader) {
      this.loader = fetch(this.sourceURL)
        .then(resp => resp.arrayBuffer())
        .then(data => {
          this.isLoaded = true;

          const tile = new VectorTile(new Protobuf(data));
          const result = [];
          for (const layerName in tile.layers) {
            const vectorTileLayer = tile.layers[layerName];

            for (let i = 0; i < vectorTileLayer.length; i++) {
              const vectorTileFeature = vectorTileLayer.feature(i);
              const features = getFeatures(vectorTileFeature, this.distanceScales);
              features.forEach(f => {
                f.properties.layer = layerName;
                result.push(f);
              });
            } 
          }
          return result;
        });
    }
    return this.loader;
  }
}

/* adapted from @mapbox/vector-tile/lib/vectortilefeature.js */

function getFeatures(vectorTileFeature, {pixelsPerMeter, pixelsPerMeter2}) {
  let coords = getCoordinates(vectorTileFeature);
  const size = vectorTileFeature.extent / TILE_SIZE;
  const type = VectorTileFeature.types[vectorTileFeature.type];
  const b = vectorTileFeature.extent / 2;
  let i;
  let j;

  function project(line) {
    for (let ii = 0; ii < line.length; ii++) {
      const p = line[ii];
      p[1] = (b - p[1]) / size / pixelsPerMeter[1];
      p[0] = (p[0] - b) / size / (pixelsPerMeter[0] + pixelsPerMeter2[0] * p[1]);
    }
  }

  switch (vectorTileFeature.type) {
  case 1:
    coords = coords.map(pts => pts[0]);
    project(coords);
    break;

  case 2:
    coords.forEach(project);
    break;

  case 3:
    coords = classifyRings(coords);
    for (i = 0; i < coords.length; i++) {
      for (j = 0; j < coords[i].length; j++) {
        project(coords[i][j]);
      }
    }
    break;
  }

  var result = coords.map(coordinates => ({
    type: "Feature",
    geometry: {type, coordinates},
    properties: vectorTileFeature.properties
  }));

  return result;
}

function getCoordinates(vectorTileFeature) {
  const pbf = vectorTileFeature._pbf;
  pbf.pos = vectorTileFeature._geometry;

  const end = pbf.readVarint() + pbf.pos;
  let cmd = 1;
  let length = 0;
  let x = 0;
  let y = 0;

  const lines = [];
  let line;

  while (pbf.pos < end) {
    if (length <= 0) {
      const cmdLen = pbf.readVarint();
      cmd = cmdLen & 0x7;
      length = cmdLen >> 3;
    }

    length--;

    if (cmd === 1 || cmd === 2) {
      x += pbf.readSVarint();
      y += pbf.readSVarint();

      if (cmd === 1) { // moveTo
        if (line) lines.push(line);
        line = [];
      }

      line.push([x, y]);

    } else if (cmd === 7) {

      // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
      if (line) {
        line.push(line[0].slice()); // closePolygon
      }

    } else {
      throw new Error('unknown command ' + cmd);
    }
  }

  if (line) lines.push(line);

  return lines;
}

// classifies an array of rings into polygons with outer rings and holes

function classifyRings(rings) {
  const len = rings.length;

  if (len <= 1) return [rings];

  const polygons = [];
  let polygon;
  let ccw;

  for (let i = 0; i < len; i++) {
    const area = signedArea(rings[i]);
    if (area === 0) {
      continue;
    }

    if (ccw === undefined) {
      ccw = area < 0;
    }

    if (ccw === area < 0) {
      if (polygon) {
        polygons.push(polygon);
      }
      polygon = [rings[i]];

    } else {
      polygon.push(rings[i]);
    }
  }
  if (polygon) {
    polygons.push(polygon);
  }

  return polygons;
}

function signedArea(ring) {
  let sum = 0;
  for (let i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
    p1 = ring[i];
    p2 = ring[j];
    sum += (p2[0] - p1[0]) * (p1[1] + p2[1]);
  }
  return sum;
}
