// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, picking} from '@deck.gl/core';
import type {
  Color,
  Accessor,
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
export type SurfaceLayerProps<DataT = any> = _SurfaceLayerProps<DataT> & LayerProps;

type _SurfaceLayerProps<DataT> = {
  data: DataT[];
  getPosition: Accessor<DataT, Vec3>;
  getColor?: Accessor<DataT, Color>;
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
export default class SurfaceLayer<DataT = any> extends Layer<Required<_SurfaceLayerProps<DataT>>> {
  static defaultProps = defaultProps;
  static layerName: string = 'SurfaceLayer';

  state!: {
    model: Model;
    vertexCount: number;
  };

  initializeState() {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.remove(['instancePickingColors']);
    /* eslint-disable @typescript-eslint/unbound-method */
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
        accessor: 'getPosition',
        transform: this.getPosition
      },
      colors: {
        size: 4,
        accessor: 'getColor',
        type: 'uint8',
        defaultValue: [0, 0, 0, 255]
      },
      pickingColors: {
        size: 4,
        type: 'uint8',
        accessor: (_, {index}) => index,
        transform: this.getPickingColor
      }
    });
    /* eslint-enable @typescript-eslint/unbound-method */

    this.state.model = this.getModel();
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {oldProps, props, changeFlags} = params;

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
      disableWarnings: true,
      modules: [picking],
      topology: 'triangle-list',
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      vertexCount: 0
    });
  }

  draw({uniforms}) {
    const {lightStrength} = this.props;
    const {model} = this.state;

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
  getPickingColor(index: number) {
    const {data, uCount, vCount} = this.props;

    const xIndex = index % uCount;
    const yIndex = (index - xIndex) / uCount;
    const p = data[index];

    return [
      (xIndex / (uCount - 1)) * 255,
      (yIndex / (vCount - 1)) * 255,
      1,
      isFinite(p[0]) && isFinite(p[1]) && isFinite(p[2]) ? 0 : 1
    ];
  }

  decodePickingColor([r, g, b]: Color): number {
    if (b === 0) {
      return -1;
    }
    return r | (g << 8);
  }

  getPosition([x, y, z]: Vec3) {
    const {xAxis, yAxis, zAxis} = this.props;

    return [
      xAxis.scale?.(x) ?? x,
      // swap z and y: y is up in the default viewport
      zAxis.scale?.(z) ?? z,
      yAxis.scale?.(y) ?? y
    ];
  }

  getPickingInfo(opts: GetPickingInfoParams) {
    const info = opts.info as PlotLayerPickingInfo;

    if (info && info.index !== -1) {
      info.uv = [(info.index & 255) / 255, (info.index >> 8) / 255];
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
    this.state.model.setVertexCount(indicesCount);
  }
}
