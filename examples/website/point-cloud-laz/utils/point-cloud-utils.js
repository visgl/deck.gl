// Fit point cloud in a 1x1x1 box centered at [0, 0, 0]
export function normalize(points) {
  let xMin = Infinity;
  let yMin = Infinity;
  let zMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  let zMax = -Infinity;

  for (let i = 0; i < points.length; i++) {
    xMin = Math.min(xMin, points[i][0]);
    yMin = Math.min(yMin, points[i][1]);
    zMin = Math.min(zMin, points[i][2]);
    xMax = Math.max(xMax, points[i][0]);
    yMax = Math.max(yMax, points[i][1]);
    zMax = Math.max(zMax, points[i][2]);
  }

  const scale = Math.max(xMax - xMin, yMax - yMin, zMax - zMin);
  const xMid = (xMin + xMax) / 2;
  const yMid = (yMin + yMax) / 2;
  const zMid = (zMin + zMax) / 2;

  for (let i = 0; i < points.length; i++) {
    points[i][0] = (points[i][0] - xMid) / scale;
    points[i][1] = (points[i][1] - yMid) / scale;
    points[i][2] = (points[i][2] - zMid) / scale;
  }
}
