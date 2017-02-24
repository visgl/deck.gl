import {Layer, assembleShaders} from 'deck.gl';

import Axes from './axes';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  data: [],
  getZ: () => 0,
  getColor: () => DEFAULT_COLOR,
  xMin: -1,
  xMax: 1,
  yMin: -1,
  yMax: 1,
  xResolution: 100,
  yResolution: 100,
  drawAxes: true,
  ticksCount: 6,
  axesOffset: 0,
  axesColor: [0, 0, 0, 255],
  lightStrength: 1
};

/*
 * @classdesc
 * A layer that plots a surface based on a z=f(x,y) equation.
 *
 * @class
 * @param {Object} [props]
 * @param {Function} [props.getZ] - method called to get z from (x,y) values
 * @param {Function} [props.getColor] - method called to get color from (x,y,z)
      returns [r,g,b,a].
 * @param {Number} [props.xMin] - low bound of x
 * @param {Number} [props.xMax] - high bound of x
 * @param {Number} [props.yMin] - low bound of y
 * @param {Number} [props.yMax] - high bound of y
 * @param {Integer} [props.xResolution] - number of samples within x range
 * @param {Integer} [props.yResolution] - number of samples within y range
 * @param {Number} [props.lightStrength] - front light strength
 * @param {Boolean} [props.drawAxes] - whether to draw axes
 * @param {Integer} [props.ticksCount] - number of ticks along each axis, see
      https://github.com/d3/d3-axis/blob/master/README.md#axis_ticks
 * @param {Number} [props.axesOffset] - amount to set back grids from the plot,
      relative to the size of the bounding box
 * @param {Array} [props.axesColor] - color of the gridlines, in [r,g,b,a]
 */
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

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.propsChanged) {
      const {xMin, xMax, yMin, yMax, xResolution, yResolution} = props;

      if (oldProps.xMin !== xMin ||
        oldProps.xMax !== xMax ||
        oldProps.yMin !== yMin ||
        oldProps.yMax !== yMax ||
        oldProps.xResolution !== xResolution ||
        oldProps.yResolution !== yResolution) {
        this.setState({
          vertexCount: xResolution * yResolution
        });
        this.state.attributeManager.invalidateAll();
      }

      this.state.axes.updateProps({ticksCount: this.props.ticksCount});
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
    const {viewport: {width, height}} = this.context;
    const {center, dim} = this.state;
    const {lightStrength, drawAxes, axesColor, axesOffset} = this.props;

    if (drawAxes) {
      this.state.axes.render({
        ...uniforms,
        center,
        dim,
        screenSize: [width, height],
        offset: axesOffset,
        strokeColor: axesColor
      });
    }

    this.state.model.render({
      ...uniforms,
      center,
      dim,
      lightStrength
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
    const {xResolution, yResolution} = this.props;

    const xIndex = i % xResolution;
    const yIndex = (i - xIndex) / xResolution;

    return [
      xIndex / (xResolution - 1) * 255,
      yIndex / (yResolution - 1) * 255,
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
      const {xMin, xMax, yMin, yMax, getZ} = this.props;
      const x = info.index[0] * (xMax - xMin) + xMin;
      const y = info.index[1] * (yMax - yMin) + yMin;
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
    this.state.axes.updateProps({bounds, ticksCount: this.props.ticksCount});
  }

  calculateIndices(attribute) {
    const {xResolution, yResolution} = this.props;
    // # of squares = (nx - 1) * (ny - 1)
    // # of triangles = squares * 2
    // # of indices = triangles * 3
    const indicesCount = (xResolution - 1) * (yResolution - 1) * 2 * 3;
    const indices = new Uint32Array(indicesCount);

    let i = 0;
    for (let xIndex = 0; xIndex < xResolution - 1; xIndex++) {
      for (let yIndex = 0; yIndex < yResolution - 1; yIndex++) {
        /*
         *   i0   i1
         *    +--.+---
         *    | / |
         *    +'--+---
         *    |   |
         *   i2   i3
         */
        const i0 = yIndex * xResolution + xIndex;
        const i1 = i0 + 1;
        const i2 = i0 + xResolution;
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
    const {xMin, xMax, yMin, yMax, xResolution, yResolution, getZ} = this.props;

    // step between samples
    const xDelta = (xMax - xMin) / (xResolution - 1);
    const yDelta = (yMax - yMin) / (yResolution - 1);

    // calculate z range
    let zMin = Infinity;
    let zMax = -Infinity;

    const value = new Float32Array(vertexCount * attribute.size);

    let i = 0;
    for (let yIndex = 0; yIndex < yResolution; yIndex++) {
      for (let xIndex = 0; xIndex < xResolution; xIndex++) {
        const x = xIndex * xDelta + xMin;
        const y = yIndex * yDelta + yMin;
        let z = getZ(x, y);
        const isZFinite = isFinite(z);
        if (!isZFinite) {
          z = 0;
        }

        zMin = Math.min(zMin, z);
        zMax = Math.max(zMax, z);

        // swap z and y: y is up in the default viewport
        value[i++] = x;
        value[i++] = z;
        value[i++] = y;
        value[i++] = isZFinite ? 0 : 1;
      }
    }

    attribute.value = value;
    this._setBounds([[xMin, xMax], [zMin, zMax], [yMin, yMax]]);
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
