import {Layer, picking} from '@deck.gl/core';
import type {
  Color,
  DefaultProps,
  LayerProps,
  GetPickingInfoParams,
  Attribute,
  UpdateParameters
} from '@deck.gl/core';
import {Model} from '@luma.gl/engine';
import surfaceVertex from './surface-vertex.glsl';
import fragmentShader from './surface-fragment.glsl';

import type {Axis, Vec3, PlotLayerPickingInfo} from './types';

const defaultProps: DefaultProps<SurfaceLayerProps> = {
  data: [],
  getColor: {type: 'accessor', value: [128, 128, 128, 255]},
  uCount: 100,
  vCount: 100,
  lightStrength: 0.1
};

/** All props supported by SurfaceLayer. */
export type SurfaceLayerProps = _SurfaceLayerProps & LayerProps;

type _SurfaceLayerProps = {
  data: Vec3[];
  getColor?: Color | ((position: [x: number, y: number, z: number]) => Color);
  xAxis: Axis;
  yAxis: Axis;
  zAxis: Axis;
  uCount?: number;
  vCount?: number;
  lightStrength?: number;
};

/**
 * A layer that plots a surface based on a z=f(x,y) equation.
 */
export default class SurfaceLayer extends Layer<Required<_SurfaceLayerProps>> {
  static defaultProps = defaultProps;
  static layerName: string = 'SurfaceLayer';

  state!: {
    model?: Model;
    vertexCount: number;
  };

  initializeState() {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.remove(['instancePickingColors']);
    /* eslint-disable max-len */
    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        update: this.calculateIndices,
        noAlloc: true
      },
      positions: {
        size: 3, 
        type: 'float64',
        accessor: (p, context) => this.transformPosition(p, context.target)
      },
      colors: {
        size: 4,
        accessor: ['getColor'],
        type: 'uint8',
        defaultValue: [0, 0, 0, 255]
      },
      pickingColors: {
        size: 4,
        type: 'uint8',
        accessor: (_, context) => this.encodePickingColor(context.index, context.target)
      }
    });
    /* eslint-enable max-len */

    this.state.model = this.getModel();
  }

  updateState({oldProps, props, changeFlags}: UpdateParameters<this>) {
    if (changeFlags.propsChanged) {
      const {uCount, vCount} = props;

      if (oldProps.uCount !== uCount || oldProps.vCount !== vCount) {
        this.state.vertexCount = uCount * vCount;
        if (props.data.length < uCount * vCount) {
          throw new Error('SurfaceLayer: insufficient data');
        }
        this.getAttributeManager()!.invalidate('indices');
      }
    }
  }

  getModel() {
    // 3d surface
    return new Model(this.context.device, {
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
    const {model} = this.state;

    // This is a non-instanced model
    model.setInstanceCount(0);
    model.setUniforms(uniforms);
    model.setUniforms({lightStrength});
    model.draw(this.context.renderPass);
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
    const {data, uCount, vCount} = this.props;

    const xIndex = i % uCount;
    const yIndex = (i - xIndex) / uCount;
    const p = data[i];

    target[0] = (xIndex / (uCount - 1)) * 255;
    target[1] = (yIndex / (vCount - 1)) * 255;
    target[2] = 1;
    // the fourth component is a flag for invalid z (NaN or Infinity)
    target[3] = isFinite(p[0]) && isFinite(p[1]) && isFinite(p[2]) ? 0 : 1;

    return target;
  }

  decodePickingColor([r, g, b]: Color): number {
    if (b === 0) {
      return -1;
    }
    return r | (g << 8);
  }

  getPickingInfo(opts: GetPickingInfoParams) {
    const info = opts.info as PlotLayerPickingInfo;

    if (info && info.index !== -1) {
      info.uv = [
        (info.index & 255) / 255,
        (info.index >> 8) / 255
      ];
    }

    return info;
  }

  calculateIndices(attribute: Attribute) {
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

  transformPosition([x, y, z]: Vec3, target: number[]) {
    const {
      xAxis,
      yAxis,
      zAxis
    } = this.props;

    target[0] = xAxis.scale?.(x) || x || 0;
    // swap z and y: y is up in the default viewport
    target[1] = zAxis.scale?.(z) || z || 0;
    target[2] = yAxis.scale?.(y) || y || 0;

    return target;
  }
}
