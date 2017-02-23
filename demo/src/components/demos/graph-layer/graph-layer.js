import {Layer, assembleShaders} from 'deck.gl';

import Axes from './axes';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const defaultProps = {
  data: [],
  xRange: [-1, 1],
  yRange: [-1, 1],
  resolution: [100, 100],
  ticksCount: 6,
  drawAxes: true,
  axesOffset: 0,
  axesColor: [0, 0, 0, 255],
  fade: 1
};

/* Utils */

function arrayEqual(arr0, arr1) {
  return arr0 && arr1 && arr0.length === arr1.length && arr0.every((a, i) => a === arr1[i]);
}

export default class GraphLayer extends Layer {

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices},
      positions: {size: 4, accessor: 'getZ', update: this.calculatePositions, noAlloc: true},
      colors: {size: 4, accessor: ['getZ', 'getColor'], type: GL.UNSIGNED_BYTE, update: this.calculateColors, noAlloc: true},
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors, noAlloc: true}
    });
    /* eslint-enable max-len */

    gl.getExtension('OES_element_index_uint');
    this.setState({
      model: this.getModels(gl),
      axes: new Axes({gl, id: this.props.id}),
      center: [0, 0, 0],
      dim: [1, 1, 1]
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

    return new Model({
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

  }

  draw({uniforms}) {
    const {center, dim} = this.state;
    const {fade, drawAxes, axesColor, axesOffset} = this.props;

    if (drawAxes) {
      this.state.axes.render({
        ...uniforms,
        center,
        dim,
        offset: axesOffset,
        strokeColor: axesColor
      });
    }

    this.state.model.render({
      ...uniforms,
      center,
      dim,
      fade
    });
  }

  encodePickingColor(i) {
    const {resolution: [xCount, yCount]} = this.props;

    const xIndex = i % xCount;
    const yIndex = (i - xIndex) / xCount;

    return [
      xIndex / (xCount - 1) * 255,
      yIndex / (yCount - 1) * 255,
      255
    ];
  }

  decodePickingColor([r, g, b]) {
    if (b === 0) {
      return -1;
    }

    const {resolution: [xCount, yCount]} = this.props;
    const xIndex = Math.round(r / 255 * (xCount - 1));
    const yIndex = Math.round(g / 255 * (yCount - 1));

    return yIndex * xCount + xIndex;
  }

  pick(props) {
    super.pick(props);
    const {info} = props;

    if (info && info.index >= 0) {
      const {resolution: [xCount, yCount], xRange, yRange, getZ} = this.props;

      const xRatio = info.color[0] / 255;
      const yRatio = info.color[1] / 255;

      const x = xRatio * (xRange[1] - xRange[0]) + xRange[0];
      const y = yRatio * (yRange[1] - yRange[0]) + yRange[0];
      const z = getZ(x, y);

      info.sample = [x, y, z];
    }
  }

  _setBounds(bounds) {
    this.setState({
      center: bounds.map(b => (b[0] + b[1]) / 2),
      dim: bounds.map(b => b[1] - b[0])
    });

    // update axes
    this.state.axes.update(bounds, this.props.ticksCount);
  }

  _forEachVertex(func) {
    const {resolution: [xCount, yCount], xRange, yRange} = this.props;
    const xDelta = (xRange[1] - xRange[0]) / (xCount - 1);
    const yDelta = (yRange[1] - yRange[0]) / (yCount - 1);

    let i = 0;
    for (let yIndex = 0; yIndex < yCount; yIndex++) {
      for (let xIndex = 0; xIndex < xCount; xIndex++) {
        const x = xIndex * xDelta + xRange[0];
        const y = yIndex * yDelta + yRange[0];
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

  calculatePickingColors(attribute) {
    const {resolution: [xCount, yCount]} = this.props;

    const value = new Uint8ClampedArray(xCount * yCount * 3);
    this._forEachVertex((x, y, i) => {
      const pickingColor = this.encodePickingColor(i);
      value[i * 3] = pickingColor[0];
      value[i * 3 + 1] = pickingColor[1];
      value[i * 3 + 2] = pickingColor[2];
    });

    attribute.value = value;
  }

}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
