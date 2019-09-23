import {Layer} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model} from '@luma.gl/core';

import surfaceVertex from './surface-vertex.glsl';
import fragmentShader from './fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  data: [],
  getPosition: () => [0, 0, 0],
  getColor: () => DEFAULT_COLOR,
  xScale: null,
  yScale: null,
  zScale: null,
  uCount: 100,
  vCount: 100,
  lightStrength: 0.1
};

/*
 * @classdesc
 * A layer that plots a surface based on a z=f(x,y) equation.
 *
 * @class
 * @param {Object} [props]
 * @param {Function} [props.getPosition] - method called to get [x, y, z] from (u,v) values
 * @param {Function} [props.getColor] - method called to get color from (x,y,z)
      returns [r,g,b,a].
 * @param {d3.scale} [props.xScale] - a d3 scale for the x axis
 * @param {d3.scale} [props.yScale] - a d3 scale for the y axis
 * @param {d3.scale} [props.zScale] - a d3 scale for the z axis
 * @param {Integer} [props.uCount] - number of samples within x range
 * @param {Integer} [props.vCount] - number of samples within y range
 * @param {Number} [props.lightStrength] - front light strength
 */
export default class SurfaceLayer extends Layer {
  initializeState() {
    const {gl} = this.context;
    const attributeManager = this.getAttributeManager();
    const noAlloc = true;

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices, noAlloc},
      positions: {size: 4, accessor: 'getPosition', update: this.calculatePositions, noAlloc},
      colors: {
        size: 4,
        accessor: ['getPosition', 'getColor'],
        type: GL.UNSIGNED_BYTE,
        update: this.calculateColors,
        noAlloc
      },
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors, noAlloc}
    });
    /* eslint-enable max-len */

    gl.getExtension('OES_element_index_uint');
    this.setState({
      model: this.getModel(gl)
    });
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.propsChanged) {
      const {uCount, vCount} = props;

      if (oldProps.uCount !== uCount || oldProps.vCount !== vCount) {
        this.setState({
          vertexCount: uCount * vCount
        });
        this.state.attributeManager.invalidateAll();
      }
    }
  }

  getModel(gl) {
    // 3d surface
    return new Model(gl, {
      id: `${this.props.id}-surface`,
      vs: surfaceVertex,
      fs: fragmentShader,
      modules: ['picking'],
      drawMode: GL.TRIANGLES,
      vertexCount: 0,
      isIndexed: true
    });
  }

  draw({uniforms}) {
    const {lightStrength} = this.props;

    this.state.model
      .setUniforms(
        Object.assign({}, uniforms, {
          lightStrength
        })
      )
      .draw();
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
    const {uCount, vCount} = this.props;

    const xIndex = i % uCount;
    const yIndex = (i - xIndex) / uCount;

    return [(xIndex / (uCount - 1)) * 255, (yIndex / (vCount - 1)) * 255, 1];
  }

  decodePickingColor([r, g, b]) {
    if (b === 0) {
      return -1;
    }
    return [r / 255, g / 255];
  }

  getPickingInfo(opts) {
    const {info} = opts;

    if (info && info.index !== -1) {
      const [u, v] = info.index;
      const {getPosition} = this.props;

      info.sample = getPosition(u, v);
    }

    return info;
  }

  calculateIndices(attribute) {
    const {uCount, vCount} = this.props;
    // # of squares = (nx - 1) * (ny - 1)
    // # of triangles = squares * 2
    // # of indices = triangles * 3
    const indicesCount = (uCount - 1) * (vCount - 1) * 2 * 3;
    const indices = new Uint32Array(indicesCount);

    let i = 0;
    for (let xIndex = 0; xIndex < uCount - 1; xIndex++) {
      for (let yIndex = 0; yIndex < vCount - 1; yIndex++) {
        /*
         *   i0   i1
         *    +--.+---
         *    | / |
         *    +'--+---
         *    |   |
         *   i2   i3
         */
        const i0 = yIndex * uCount + xIndex;
        const i1 = i0 + 1;
        const i2 = i0 + uCount;
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
  /* eslint-disable max-statements */
  calculatePositions(attribute) {
    const {vertexCount} = this.state;
    const {uCount, vCount, getPosition, xScale, yScale, zScale} = this.props;

    const value = new Float32Array(vertexCount * attribute.size);

    let i = 0;
    for (let vIndex = 0; vIndex < vCount; vIndex++) {
      for (let uIndex = 0; uIndex < uCount; uIndex++) {
        const u = uIndex / (uCount - 1);
        const v = vIndex / (vCount - 1);
        const [x, y, z] = getPosition(u, v);

        const isXFinite = isFinite(x);
        const isYFinite = isFinite(y);
        const isZFinite = isFinite(z);

        // swap z and y: y is up in the default viewport
        value[i++] = isXFinite ? xScale(x) : xScale.range()[0];
        value[i++] = isZFinite ? zScale(z) : zScale.range()[0];
        value[i++] = isYFinite ? yScale(y) : yScale.range()[0];
        value[i++] = isXFinite && isYFinite && isZFinite ? 0 : 1;
      }
    }

    attribute.value = value;
  }
  /* eslint-enable max-statements */

  calculateColors(attribute) {
    const {vertexCount, attributeManager} = this.state;

    // reuse the calculated [x, y, z] in positions
    const positions = attributeManager.attributes.positions.value;
    const value = new Uint8ClampedArray(vertexCount * attribute.size);

    // Support constant colors
    let {getColor} = this.props;
    getColor = typeof getColor === 'function' ? getColor : () => getColor;

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

SurfaceLayer.layerName = 'SurfaceLayer';
SurfaceLayer.defaultProps = defaultProps;
