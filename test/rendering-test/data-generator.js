// generate points in a grid
function pointGrid(N, bbox) {
  const dLon = bbox[2] - bbox[0];
  const dLat = bbox[3] - bbox[1];
  const aspectRatio = dLon / dLat;
  const sizeX = Math.round(Math.sqrt(N * aspectRatio));
  const sizeY = Math.round(Math.sqrt(N / aspectRatio));

  const stepX = dLon / sizeX;
  const stepY = dLat / sizeY;

  const points = Array(sizeX * sizeY);
  let index = 0;

  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      points[index] = [
        bbox[0] + stepX * x,
        bbox[1] + stepY * y
      ];
      index++;
    }
  }

  return points;
}

let _points100K = null;

export function getPoints100K() {
  _points100K = _points100K || pointGrid(1e5, [-122.9, 36.6, -121.9, 38.9]);
  return _points100K;
}
