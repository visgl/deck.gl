import {cutPolylineByGrid} from '@math.gl/polygon';

// Returns: a flat array of path positions
export function normalizePath(path, size, gridResolution) {
  let flatPath = path;
  if (Array.isArray(path[0])) {
    const length = path.length * size;
    flatPath = new Array(length);
    for (let i = 0; i < path.length; i++) {
      for (let j = 0; j < size; j++) {
        flatPath[i * size + j] = path[i][j] || 0;
      }
    }
  }
  if (gridResolution) {
    return cutPolylineByGrid(flatPath, {size, gridResolution});
  }
  return flatPath;
}
