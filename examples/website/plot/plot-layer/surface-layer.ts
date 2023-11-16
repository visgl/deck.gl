import {Layer, picking} from '@deck.gl/core';
import type {Color, DefaultProps, LayerDataSource, LayerProps} from '@deck.gl/core';
import {GL} from '@luma.gl/constants';
import {Model} from '@luma.gl/engine';
import {ScaleLinear} from 'd3-scale';

import surfaceVertex from './surface-vertex.glsl';
import fragmentShader from './fragment.glsl';
import {$TODO} from './types';

const DEFAULT_COLOR: Color = [0, 0, 0, 255];

const defaultProps: DefaultProps<SurfaceLayerProps> = {
  data: [],
  getPosition: () => [0, 0, 0],
  getColor: () => DEFAULT_COLOR,
  xScale: undefined,
  yScale: undefined,
  zScale: undefined,
  uCount: 100,
  vCount: 100,
  lightStrength: 0.1
};

/** All props supported by SurfaceLayer. */
export type SurfaceLayerProps<DataT = unknown> = _SurfaceLayerProps<DataT> & LayerProps;

type _SurfaceLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  getPosition?: $TODO;
  getColor?: $TODO;
  xScale?: ScaleLinear<number, number>;
  yScale?: ScaleLinear<number, number>;
  zScale?: ScaleLinear<number, number>;
  uCount?: number;
  vCount?: number;
  lightStrength?: number;
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
export default class SurfaceLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_SurfaceLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName: string = 'SurfaceLayer';

  declare state: Layer['state'] & {
    model?: Model;
    vertexCount: number;
  };

  initializeState() {
    // const {gl} = this.context;
    const noAlloc = true;

    /* eslint-disable max-len */
    this.getAttributeManager()!.add({
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

    this.state.model = this.getModel();
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.propsChanged) {
      const {uCount, vCount} = props;

      if (oldProps.uCount !== uCount || oldProps.vCount !== vCount) {
        this.state.vertexCount = uCount * vCount;
        this.getAttributeManager()!.invalidateAll();
      }
    }
  }

  getModel() {
    // 3d surface
    return new Model(this.context.device as $TODO, {
      id: `${this.props.id}-surface`,
      vs: surfaceVertex,
      fs: fragmentShader,
      modules: [picking],
      topology: 'triangle-list',
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      vertexCount: 0
    });
  }

  draw({uniforms}) {
    const {lightStrength} = this.props;

    this.state.model!.setUniforms(Object.assign({}, uniforms, {lightStrength}));
    this.state.model!.draw(this.context.renderPass as $TODO);
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
  encodePickingColor(i: number, target: number[] = []) {
    const {uCount, vCount} = this.props;

    const xIndex = i % uCount;
    const yIndex = (i - xIndex) / uCount;

    return [(xIndex / (uCount - 1)) * 255, (yIndex / (vCount - 1)) * 255, 1];
  }

  decodePickingColor([r, g, b]: Color): number {
    if (b === 0) {
      return -1;
    }
    return r | g << 8;
  }

  getPickingInfo(opts) {
    const {info} = opts;

    if (info && info.index !== -1) {
      const {getPosition} = this.props;
      const u = (info.index & 255) / 255;
      const v = (info.index >> 8) / 255;
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
    this.state.model!.setVertexCount(indicesCount);
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
    const {vertexCount} = this.state;

    // reuse the calculated [x, y, z] in positions
    const positions = this.getAttributeManager()!.attributes.positions.value!;
    const value = new Uint8ClampedArray(vertexCount! * attribute.size);

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
