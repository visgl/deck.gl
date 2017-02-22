import {Layer, assembleShaders} from 'deck.gl';

import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const defaultProps = {
  xRange: [-1, 1],
  zRange: [-1, 1],
  resolution: [100, 100]
};

/* Utils */

function normalize(vector) {
  const [x, y, z] = vector;
  const len = Math.sqrt(x * x + y * y + z * z);
  return len ? [x / len, y / len, z / len] : vector;
}

function crossProduct(v0, v1) {
  return [
    v0[1] * v1[2] - v0[2] * v1[1],
    v0[2] * v1[0] - v0[0] * v1[2],
    v0[0] * v1[1] - v0[1] * v1[0]
  ];
}

export default class GraphLayer extends Layer {

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices},
      positions: {size: 3, update: this.calculatePositions, noAlloc: true},
      normals: {size: 3, update: this.calculateNormals, noAlloc: true},
      colors: {size: 4, type: GL.UNSIGNED_BYTE, update: this.calculateColors, noAlloc: true}
    });

    gl.getExtension('OES_element_index_uint');
    this.setState({
      model: this.getModel(gl),
      bounds: [[0, 0], [0, 0], [0, 0]]
    });
  }

  getShaders(id) {
    return {
      vs: readFileSync(join(__dirname, './graph-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './graph-layer-fragment.glsl'), 'utf8')
    };
  }

  getModel(gl) {
    // a square that minimally cover the unit circle
    const shaders = assembleShaders(gl, this.getShaders());

    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES
      }),
      vertexCount: 0,
      isIndexed: true
    });
  }

  draw({uniforms}) {
    const {bounds} = this.state;
    const {viewport: {width, height}} = this.context;

    const size = Math.max(...bounds.map(b => b[1] - b[0])) || 1;

    this.state.model.render({
      ...uniforms,
      center: bounds.map(b => (b[0] + b[1]) / 2),
      size
    });
  }


  _forEachVertex(cb) {
    const {resolution: [xCount, zCount], xRange, zRange} = this.props;
    const xStep = (xRange[1] - xRange[0]) / (xCount - 1);
    const zStep = (zRange[1] - zRange[0]) / (zCount - 1);

    let i = 0;
    for (let xIndex = 0; xIndex < xCount; xIndex++) {
      for (let zIndex = 0; zIndex < zCount; zIndex++) {
        const x = xIndex * xStep + xRange[0];
        const z = zIndex * zStep + zRange[0];
        cb(x, z, i++);
      }
    }
  }

  calculateIndices(attribute) {
    const {resolution: [xCount, zCount]} = this.props;
    // squares = (nx - 1) * (nz - 1)
    // triangles = squares * 2
    // indices = triangles * 3
    const indicesCount = (xCount - 1) * (zCount - 1) * 2 * 3;
    const indices = new Uint32Array(indicesCount);

    let i = 0;
    for (let xIndex = 0; xIndex < xCount - 1; xIndex++) {
      for (let zIndex = 0; zIndex < zCount - 1; zIndex++) {
        /*
         *   i0   i1
         *    +---+---
         *    | / |   
         *    +---+---
         *    |   |
         *   i2   i3
         */
        const i0 = zIndex * xCount + xIndex;
        const i1 = i0 + 1;
        const i2 = i0 + xCount;
        const i3 = i2 + 1;

        indices[i++] = i0;
        indices[i++] = i2;
        indices[i++] = i1;
        indices[i++] = i1;
        indices[i++] = i2;
        indices[i++] = i3;
      }
    }

    attribute.value = indices;
    this.state.model.setVertexCount(indicesCount);
  }

  calculatePositions(attribute) {
    const {resolution: [xCount, zCount], xRange, zRange, getY} = this.props;
    let minY = Infinity;
    let maxY = -Infinity;

    const value = new Float32Array(xCount * zCount * 3);
    this._forEachVertex((x, z, i) => {
      const y = getY(x, z);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      value[i * 3] = x;
      value[i * 3 + 1] = y;
      value[i * 3 + 2] = z;
    });

    attribute.value = value;
    this.setState({bounds: [xRange, [minY, maxY], zRange]});
  }

  calculateNormals(attribute) {
    const {resolution: [xCount, zCount], xRange, zRange, getY} = this.props;

    const EPSILON = 1e-7;
    const ex = EPSILON * (xRange[1] - xRange[0]);
    const ez = EPSILON * (zRange[1] - zRange[0]);

    const value = new Float32Array(xCount * zCount * 3);
    this._forEachVertex((x, z, i) => {
      const y0 = getY(x, z);
      const y1 = getY(x + ex, z);
      const y2 = getY(x, z + ez);
      const normal = normalize(crossProduct(
        [ex, y1 - y0, 0],
        [0, y2 - y0, ez]
      ));

      value[i * 3] = normal[0];
      value[i * 3 + 1] = normal[1];
      value[i * 3 + 2] = normal[2];
    });

    attribute.value = value;
  }

  calculateColors(attribute) {
    const {resolution: [xCount, zCount], getY, getColor} = this.props;

    const value = new Uint8ClampedArray(xCount * zCount * 4);
    this._forEachVertex((x, z, i) => {
      const color = getColor(x, getY(x, z), z);
      value[i * 4] = color[0];
      value[i * 4 + 1] = color[1];
      value[i * 4 + 2] = color[2];
      value[i * 4 + 3] = isNaN(color[3]) ?  255 : color[3];
    });

    attribute.value = value;
  }

}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
