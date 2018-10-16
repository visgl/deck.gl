/* adapted from @mapbox/vector-tile/lib/vectortilefeature.js for better perf */
/* eslint-disable */
import {VectorTileFeature} from '@mapbox/vector-tile';

export function vectorTileFeatureToGeoJSON(vectorTileFeature, project) {
  let coords = getCoordinates(vectorTileFeature);
  const type = VectorTileFeature.types[vectorTileFeature.type];
  const extent = vectorTileFeature.extent;
  let i;
  let j;

  switch (vectorTileFeature.type) {
    case 1:
      coords = coords.map(pts => pts[0]);
      project(coords, extent);
      break;

    case 2:
      for (i = 0; i < coords.length; i++) {
        project(coords[i], extent);
      }
      break;

    case 3:
      coords = classifyRings(coords);
      for (i = 0; i < coords.length; i++) {
        for (j = 0; j < coords[i].length; j++) {
          project(coords[i][j], extent);
        }
      }
      break;

    default:
      return [];
  }

  return coords.map(coordinates => ({
    type: 'Feature',
    geometry: {type, coordinates},
    properties: vectorTileFeature.properties
  }));
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

      if (cmd === 1) {
        // moveTo
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
      throw new Error(`unknown command ${cmd}`);
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
