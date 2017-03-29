import PLYParser from './ply-parser';

/**
 * loads binary data
 * @param {string} url
 * @return {Promise} promise that resolves to the binary data
 */
/* global XMLHttpRequest */
export function loadBinary(url) {
  let request = null;
  const promise = new Promise((resolve, reject) => {
    request = new XMLHttpRequest();
    try {
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = () => {
        if (request.status === 200) {
          resolve(request.response);
        }
        reject(new Error('Could not get binary data'));
      };
      request.onerror = error => reject(error);

      request.send();

    } catch (error) {
      reject(error);
    }
  });
  // Make abort() available
  promise.abort = request.abort.bind(request);
  return promise;
}

/**
 * parse ply data
 * @param {Binary} data
 * @return {*} parsed point cloud
 */
export function parsePLY(data, {
  normalize = true, faceNormal = true, vertexNormal = true, flip = true
} = {}) {
  // Linearize the unnecessary callback interface from PLYloader
  let result = null;
  const parser = new PLYParser();
  parser.onsuccess = parsedData => {
    result = parsedData;
  };
  parser.onerror = error => {
    throw new Error(error);
  };
  parser.parse(data);
  if (result === null) {
    throw new Error('PLY parsing failed');
  }

  if (normalize) {
    normalizeXYZ(result.vertex);
  }

  // generate normals
  if ((faceNormal && !result.face.normals) ||
    (vertexNormal && !result.vertex.nx)) {

    const {face, vertex} = generateNormals(result, flip);

    if (faceNormal && !result.face.normals) {
      result.face.normals = face;
    }

    if (vertexNormal && !result.vertex.nx) {
      result.vertex.nx = vertex.nx;
      result.vertex.ny = vertex.ny;
      result.vertex.nz = vertex.nz;
    }
  }

  return result;
}

export function generateNormals({
  vertex: {x, y, z},
  face: {vertex_indices: triangles}
}, flip) {

  const normals = {
    face: [],
    vertex: {
      nx: Array(x.length).fill(0),
      ny: Array(y.length).fill(0),
      nz: Array(z.length).fill(0)
    }
  };

  triangles.forEach(vertices => {
    // get IDs of vertex in triangle
    const v0 = vertices[0];
    const v1 = vertices[1];
    const v2 = vertices[2];
    // get edge vectors of each triganle
    const x0 = x[v2] - x[v0];
    const y0 = y[v2] - y[v0];
    const z0 = z[v2] - z[v0];
    const x1 = x[v1] - x[v0];
    const y1 = y[v1] - y[v0];
    const z1 = z[v1] - z[v0];
    // get cross-product betwee the two edge vectors
    let nx = y0 * z1 - z0 * y1;
    let ny = z0 * x1 - x0 * z1;
    let nz = x0 * y1 - y0 * x1;
    // sum per-triangle normal to adjacent vertex
    vertices.forEach(v => {
      normals.vertex.nx[v] += nx;
      normals.vertex.ny[v] += ny;
      normals.vertex.nz[v] += nz;
    });
    // normalize face normal
    const magnitude = Math.sqrt(nx * nx + ny * ny + nz * nz);
    nx = magnitude ? nx / magnitude : 0;
    ny = magnitude ? ny / magnitude : 0;
    nz = magnitude ? nz / magnitude : 0;
    // add per-triangle normal
    normals.face.push([nx, ny, nz]);
  });

  // normalize vertex normals
  normals.vertex.nx.forEach((_, i) => {
    const nx = normals.vertex.nx[i];
    const ny = normals.vertex.ny[i];
    const nz = normals.vertex.nz[i];
    let magnitude = Math.sqrt(nx * nx + ny * ny + nz * nz);
    magnitude *= flip ? -1 : 1;
    normals.vertex.nx[i] = magnitude ? normals.vertex.nx[i] / magnitude : 0;
    normals.vertex.ny[i] = magnitude ? normals.vertex.ny[i] / magnitude : 0;
    normals.vertex.nz[i] = magnitude ? normals.vertex.nz[i] / magnitude : 0;
  });

  return normals;
}

/**
 * normalize ply data position
 * @param {object} vertex with attributes x, y z
 * @return {*} normalized point cloud
 */
export function normalizeXYZ({x, y, z}) {
  const n = x.length;

  let xMin = Infinity;
  let yMin = Infinity;
  let zMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  let zMax = -Infinity;

  for (let i = 0; i < n; i++) {
    xMin = Math.min(xMin, x[i]);
    yMin = Math.min(yMin, y[i]);
    zMin = Math.min(zMin, z[i]);
    xMax = Math.max(xMax, x[i]);
    yMax = Math.max(yMax, y[i]);
    zMax = Math.max(zMax, z[i]);
  }

  const scale = Math.max(...[xMax - xMin, yMax - yMin, zMax - zMin]);

  const xMid = (xMin + xMax) / 2;
  const yMid = (yMin + yMax) / 2;
  const zMid = (zMin + zMax) / 2;

  for (let i = 0; i < n; i++) {
    x[i] = (x[i] - xMid) / scale;
    y[i] = (y[i] - yMid) / scale;
    z[i] = (z[i] - zMid) / scale;
  }
}
