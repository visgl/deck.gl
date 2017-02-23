import {Layer, assembleShaders} from 'deck.gl';
import {scaleLinear} from 'd3-scale';

import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const defaultProps = {
  data: [],
  xRange: [-1, 1],
  yRange: [-1, 1],
  resolution: [100, 100],
  ticksCount: 6,
  axisOffset: 0,
  axisColor: [0, 0, 0, 255],
  fade: 1
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

function arrayEqual(arr0, arr1) {
  return arr0 && arr1 && arr0.length === arr1.length && arr0.every((a, i) => a === arr1[i]);
}

function flatten(arrayOfArrays) {
  return arrayOfArrays.reduce((acc, arr) => acc.concat(arr), []);
}

function getTicks([min, max], ticksCount) {
  return scaleLinear().domain([min, max])
    .ticks(ticksCount)
    .map(t => (t - min) / (max - min) - 0.5);
}

export default class GraphLayer extends Layer {

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices},
      positions: {size: 4, accessor: 'getZ', update: this.calculatePositions, noAlloc: true},
      colors: {size: 4, accessor: ['getZ', 'getColor'], type: GL.UNSIGNED_BYTE, update: this.calculateColors, noAlloc: true}
    });
    /* eslint-enable max-len */

    gl.getExtension('OES_element_index_uint');
    this.setState({
      ...this.getModels(gl),
      center: [0, 0, 0],
      size: 1
    });
  }

  updateState({oldProps, props}) {
    if (!arrayEqual(oldProps.xRange, props.xRange) ||
      !arrayEqual(oldProps.yRange, props.yRange) ||
      !arrayEqual(oldProps.resolution, props.resolution)) {
      this.state.attributeManager.invalidateAll();
    }
  }

  getModels(gl) {
    // 3d surface
    const graphShaders = assembleShaders(gl, {
      vs: readFileSync(join(__dirname, './graph-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './fragment.glsl'), 'utf8')
    });

    const graphModel = new Model({
      gl,
      id: `${this.props.id}-graph`,
      vs: graphShaders.vs,
      fs: graphShaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES
      }),
      vertexCount: 0,
      isIndexed: true
    });

    // axis grids
    const axisShaders = assembleShaders(gl, {
      vs: readFileSync(join(__dirname, './axis-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './fragment.glsl'), 'utf8')
    });

    // draw rectangle around slice
    const axisPositions = [
      -1, -1, 0, -1, 1, 0,
      -1, 1, 0, 1, 1, 0,
      1, 1, 0, 1, -1, 0,
      1, -1, 0, -1, -1, 0
    ];
    const axisNormals = [
      -1, 0, 0, -1, 0, 0,
      0, 1, 0, 0, 1, 0,
      1, 0, 0, 1, 0, 0,
      0, -1, 0, 0, -1, 0
    ];
    const axisModel = new Model({
      gl,
      id: `${this.props.id}-axis`,
      vs: axisShaders.vs,
      fs: axisShaders.fs,
      geometry: new Geometry({
        drawMode: GL.LINES,
        positions: new Float32Array(axisPositions),
        normals: new Float32Array(axisNormals)
      }),
      isInstanced: true
    });

    return {
      model: graphModel,
      axisModel
    };
  }

  draw({uniforms}) {
    const {center, size} = this.state;
    const {fade, axisColor, axisOffset} = this.props;

    this.state.axisModel.render({
      ...uniforms,
      offset: axisOffset,
      strokeColor: axisColor
    });

    this.state.model.render({
      ...uniforms,
      center,
      size,
      fade
    });
  }

  _setBounds(bounds) {
    this.setState({
      center: bounds.map(b => (b[0] + b[1]) / 2),
      size: Math.max(...bounds.map(b => b[1] - b[0])) || 1
    });

    // generate axis
    const {axisModel} = this.state;
    const {ticksCount} = this.props;
    const xTicks = getTicks(bounds[0], ticksCount);
    const yTicks = getTicks(bounds[1], ticksCount);
    const zTicks = getTicks(bounds[2], ticksCount);

    const normals = [].concat(
      xTicks.map(t => [1, 0, 0]),
      yTicks.map(t => [0, 1, 0]),
      zTicks.map(t => [0, 0, 1])
    );

    axisModel.setAttributes({
      instancePositions: {
        size: 1,
        value: new Float32Array(flatten([xTicks, yTicks, zTicks])),
        instanced: true
      },
      instanceNormals: {size: 3, value: new Float32Array(flatten(normals)), instanced: true}
    });
    axisModel.setInstanceCount(normals.length);
  }

  _forEachVertex(func) {
    const {resolution: [xCount, yCount], xRange, yRange} = this.props;
    const xStep = (xRange[1] - xRange[0]) / (xCount - 1);
    const yStep = (yRange[1] - yRange[0]) / (yCount - 1);

    let i = 0;
    for (let xIndex = 0; xIndex < xCount; xIndex++) {
      for (let yIndex = 0; yIndex < yCount; yIndex++) {
        const x = xIndex * xStep + xRange[0];
        const y = yIndex * yStep + yRange[0];
        func(x, y, i++);
      }
    }
  }

  calculateIndices(attribute) {
    const {resolution: [xCount, yCount]} = this.props;
    // squares = (nx - 1) * (ny - 1)
    // triangles = squares * 2
    // indices = triangles * 3
    const indicesCount = (xCount - 1) * (yCount - 1) * 2 * 3;
    const indices = new Uint32Array(indicesCount);

    let i = 0;
    for (let xIndex = 0; xIndex < xCount - 1; xIndex++) {
      for (let yIndex = 0; yIndex < yCount - 1; yIndex++) {
        /*
         *   i0   i1
         *    +---+---
         *    | / |
         *    +---+---
         *    |   |
         *   i2   i3
         */
        const i0 = yIndex * xCount + xIndex;
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

  // the fourth component is a flag for z:NaN
  calculatePositions(attribute) {
    const {resolution: [xCount, yCount], xRange, yRange, getZ} = this.props;
    let minZ = Infinity;
    let maxZ = -Infinity;

    const value = new Float32Array(xCount * yCount * 4);
    this._forEachVertex((x, y, i) => {
      let z = getZ(x, y);
      const isZNaN = isNaN(z);
      if (isZNaN) {
        z = 0;
      }

      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);

      value[i * 4] = x;
      value[i * 4 + 1] = z;
      value[i * 4 + 2] = y;
      value[i * 4 + 3] = isZNaN ? 1 : 0;
    });

    attribute.value = value;
    this._setBounds([xRange, [minZ, maxZ], yRange]);
  }

  calculateColors(attribute) {
    const {resolution: [xCount, yCount], getZ, getColor} = this.props;

    const value = new Uint8ClampedArray(xCount * yCount * 4);
    this._forEachVertex((x, y, i) => {
      const color = getColor(x, y, getZ(x, y) || 0);
      value[i * 4] = color[0];
      value[i * 4 + 1] = color[1];
      value[i * 4 + 2] = color[2];
      value[i * 4 + 3] = isNaN(color[3]) ? 255 : color[3];
    });

    attribute.value = value;
  }

}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
