
// flatten geoJSON-style geometry coordinates into array of points
export function flattenCoords(coordinates) {
  if (!Array.isArray(coordinates)) {
    return [];
  }
  if (Array.isArray(coordinates[0])) {
    return coordinates.reduce((result, coordArray) => {
      return result.concat(flattenCoords(coordArray));
    }, []);
  }
  return [coordinates];
}

// generate random points
export function pointGrid(N, bbox) {
  const dLon = bbox[2] - bbox[0];
  const dLat = bbox[3] - bbox[1];
  const aspectRatio = dLon / dLat;
  const sizeX = Math.round(Math.sqrt(N * aspectRatio));
  const sizeY = Math.round(Math.sqrt(N / aspectRatio));

  const stepX = dLon / sizeX;
  const stepY = dLat / sizeY;

  const points = Array(sizeX * sizeY);
  let index = 0;

  for (let x = 0; x < sizeX; x ++) {
    for (let y = 0; y < sizeY; y ++) {
      points[index] = [
        bbox[0] + stepX * x,
        bbox[1] + stepY * y
      ];
      index++;
    }
  }
  return points;
}

// load json from file
export function loadJson(path) {
  return fetch(path)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not OK');
    }
    return response.json();
  })
  .catch(error => console.error(error)); // eslint-disable-line
}