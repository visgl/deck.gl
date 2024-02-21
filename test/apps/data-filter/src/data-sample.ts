import type {GeoJSON, Feature} from 'geojson';

export const SHAPE_NAMES = {
  3: 'triangle',
  4: 'square',
  5: 'pentagon',
  6: 'hexagon',
  7: 'septagon',
  8: 'octagon',
  9: 'nonagon',
  10: 'decagon',
  11: 'hendecagon',
  12: 'dodecagon',
  100: 'circle'
};

export const COLORS = {
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255]
};

export const SIZES = {
  small: 0.5,
  medium: 1,
  large: 2
};

// generate points in a grid
export function featureGrid(N, bbox): GeoJSON {
  const dLon = bbox[2] - bbox[0];
  const dLat = bbox[3] - bbox[1];
  const aspectRatio = dLon / dLat;
  const sizeX = Math.round(Math.sqrt(N * aspectRatio));
  const sizeY = Math.round(Math.sqrt(N / aspectRatio));

  const stepX = dLon / sizeX;
  const stepY = dLat / sizeY;
  const radius = Math.min(stepX, stepY) / 4;

  const features: Feature[] = Array(sizeX * sizeY);
  let index = 0;

  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      const p = [bbox[0] + stepX * x, bbox[1] + stepY * y];
      features[index] =
        Math.random() < 0.1 ? getPointFeature(p, radius) : getPolygonFeature(p, radius);
      index++;
    }
  }

  return {type: 'FeatureCollection', features};
}

function pickRandom(obj) {
  const keys = Object.keys(obj);
  const n = Math.floor(keys.length * Math.random());
  return keys[n];
}

function getPointFeature(coordinates, radius): Feature {
  return {
    type: 'Feature',
    geometry: {type: 'Point', coordinates},
    properties: {
      centroid: coordinates,
      color: pickRandom(COLORS),
      size: pickRandom(SIZES),
      radius,
      label: SHAPE_NAMES[100],
      sides: 100
    }
  };
}

function getPolygonFeature(centroid, radius): Feature {
  const sides = Math.round(Math.random() * 9 + 3);
  const size = pickRandom(SIZES);

  const vertices: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    vertices.push([
      centroid[0] + Math.cos(angle) * SIZES[size] * radius,
      centroid[1] + Math.sin(angle) * SIZES[size] * radius
    ]);
  }
  vertices.push(vertices[0]);

  return {
    type: 'Feature',
    geometry: {type: 'Polygon', coordinates: [vertices]},
    properties: {centroid, color: pickRandom(COLORS), size, label: SHAPE_NAMES[sides], sides}
  };
}

export const DATA = featureGrid(10000, [-1e4, -1e4, 1e4, 1e4]);
