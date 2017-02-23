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
    const noAlloc = true;

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices, noAlloc},
      positions: {size: 4, accessor: 'getZ', update: this.calculatePositions, noAlloc},
      colors: {size: 4, accessor: ['getZ', 'getColor'], type: GL.UNSIGNED_BYTE, update: this.calculateColors, noAlloc},
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors, noAlloc}
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
    const {xRange, yRange, resolution} = props;

    if (!arrayEqual(oldProps.xRange, xRange) ||
      !arrayEqual(oldProps.yRange, yRange) ||
      !arrayEqual(oldProps.resolution, resolution)) {
      this.setState({
        vertexCount: resolution[0] * resolution[1]
      });
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

  /*
   * y 1
   *   ^
   *   |
   *   |
   *   |
   *   0--------> 1
   *              x
   */
  encodePickingColor(i) {
    const {resolution: [xCount, yCount]} = this.props;

    const xIndex = i % xCount;
    const yIndex = (i - xIndex) / xCount;

    return [
      xIndex / (xCount - 1) * 255,
      yIndex / (yCount - 1) * 255,
      1
    ];
  }

  decodePickingColor([r, g, b]) {
    if (b === 0) {
      return null;
    }
    return [r / 255, g / 255];
  }

  pick(props) {
    super.pick(props);
    const {info} = props;

    if (info && info.index) {
      const {xRange, yRange, getZ} = this.props;
      const x = info.index[0] * (xRange[1] - xRange[0]) + xRange[0];
      const y = info.index[1] * (yRange[1] - yRange[0]) + yRange[0];
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

  calculateIndices(attribute) {
    const {resolution: [xCount, yCount]} = this.props;
    // # of squares = (nx - 1) * (ny - 1)
    // # of triangles = squares * 2
    // # of indices = triangles * 3
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

  // the fourth component is a flag for invalid z (NaN or Infinity)
  calculatePositions(attribute) {
    const {vertexCount} = this.state;
    const {resolution: [xCount, yCount], xRange, yRange, getZ} = this.props;

    // step between samples
    const xDelta = (xRange[1] - xRange[0]) / (xCount - 1);
    const yDelta = (yRange[1] - yRange[0]) / (yCount - 1);

    // calculate z range
    let minZ = Infinity;
    let maxZ = -Infinity;

    const value = new Float32Array(vertexCount * attribute.size);

    let i = 0;
    for (let yIndex = 0; yIndex < yCount; yIndex++) {
      for (let xIndex = 0; xIndex < xCount; xIndex++) {
        const x = xIndex * xDelta + xRange[0];
        const y = yIndex * yDelta + yRange[0];
        let z = getZ(x, y);
        const isZFinite = isFinite(z);
        if (!isZFinite) {
          z = 0;
        }

        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);

        // swap z and y: y is up in the default viewport
        value[i++] = x;
        value[i++] = z;
        value[i++] = y;
        value[i++] = isZFinite ? 0 : 1;
      }
    }

    attribute.value = value;
    this._setBounds([xRange, [minZ, maxZ], yRange]);
  }

  calculateColors(attribute) {
    const {vertexCount, attributeManager} = this.state;
    const {getColor} = this.props;

    // reuse the calculated [x, y, z] in positions
    const positions = attributeManager.attributes.positions.value;
    const value = new Uint8ClampedArray(vertexCount * attribute.size);

    for (let i = 0; i < vertexCount; i++) {
      const index = i * 4;
      const color = getColor(positions[index], positions[index + 2], positions[index + 1]);
      value[i * 4] = color[0];
      value[i * 4 + 1] = color[1];
      value[i * 4 + 2] = color[2];
      value[i * 4 + 3] = isNaN(color[3]) ? 255 : color[3];
    }

    attribute.value = value;
  }

  calculatePickingColors(attribute) {
    const {vertexCount} = this.state;

    const value = new Uint8ClampedArray(vertexCount * attribute.size);

    for (let i = 0; i < vertexCount; i++) {
      const pickingColor = this.encodePickingColor(i);
      value[i * 3] = pickingColor[0];
      value[i * 3 + 1] = pickingColor[1];
      value[i * 3 + 2] = pickingColor[2];
    }

    attribute.value = value;
  }

}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
