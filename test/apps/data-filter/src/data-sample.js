// generate points in a grid
export function featureGrid(N, bbox) {
  const dLon = bbox[2] - bbox[0];
  const dLat = bbox[3] - bbox[1];
  const aspectRatio = dLon / dLat;
  const sizeX = Math.round(Math.sqrt(N * aspectRatio));
  const sizeY = Math.round(Math.sqrt(N / aspectRatio));

  const stepX = dLon / sizeX;
  const stepY = dLat / sizeY;
  const radius = Math.min(stepX, stepY) / 4;

  const features = Array(sizeX * sizeY);
  let index = 0;

  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      const p = [bbox[0] + stepX * x, bbox[1] + stepY * y];
      features[index] =
        Math.random() < 0.5 ? getPointFeature(p, radius) : getPolygonFeature(p, radius);
      index++;
    }
  }

  return features;
}

function getColor(p) {
  const r = ((p[0] % 255) + 255) % 255;
  const g = ((p[1] % 255) + 255) % 255;
  const b = 128;

  return [r, g, b];
}

function getPointFeature(coordinates, radius) {
  return {
    type: 'Feature',
    geometry: {type: 'Point', coordinates},
    properties: {centroid: coordinates, color: getColor(coordinates), radius}
  };
}

function getPolygonFeature(centroid, radius) {
  const sides = Math.round(Math.random() * 9 + 3);

  const vertices = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    vertices.push([centroid[0] + Math.cos(angle) * radius, centroid[1] + Math.sin(angle) * radius]);
  }
  vertices.push(vertices[0]);

  return {
    type: 'Feature',
    geometry: {type: 'Polygon', coordinates: [vertices]},
    properties: {centroid, color: getColor(centroid)}
  };
}

export default featureGrid(10000, [-1e4, -1e4, 1e4, 1e4]);
