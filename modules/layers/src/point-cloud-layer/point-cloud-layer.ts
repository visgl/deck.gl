// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  project32,
  picking,
  UNIT,
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Unit,
  AccessorFunction,
  Position,
  Accessor,
  Color,
  Material,
  DefaultProps
} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {gouraudMaterial} from '@luma.gl/shadertools';

import {pointCloudUniforms, PointCloudProps} from './point-cloud-layer-uniforms';
import vs from './point-cloud-layer-vertex.glsl';
import fs from './point-cloud-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];
const DEFAULT_NORMAL: [number, number, number] = [0, 0, 1];

const defaultProps: DefaultProps<PointCloudLayerProps> = {
  sizeUnits: 'pixels',
  pointSize: {type: 'number', min: 0, value: 10}, //  point radius in pixels

  getPosition: {type: 'accessor', value: (x: any) => x.position},
  getNormal: {type: 'accessor', value: DEFAULT_NORMAL},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},

  material: true,

  // Depreated
  radiusPixels: {deprecatedFor: 'pointSize'}
};

// support loaders.gl point cloud format
function normalizeData(data) {
  const {header, attributes} = data;
  if (!header || !attributes) {
    return;
  }

  data.length = header.vertexCount;

  if (attributes.POSITION) {
    attributes.instancePositions = attributes.POSITION;
  }
  if (attributes.NORMAL) {
    attributes.instanceNormals = attributes.NORMAL;
  }
  if (attributes.COLOR_0) {
    const {size, value} = attributes.COLOR_0;
    attributes.instanceColors = {size, type: 'unorm8', value};
  }
}

/** All properties supported by PointCloudLayer. */
export type PointCloudLayerProps<DataT = unknown> = _PointCloudLayerProps<DataT> & LayerProps;

/** Properties added by PointCloudLayer. */
type _PointCloudLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * The units of the point size, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'pixels'
   */
  sizeUnits?: Unit;

  /**
   * Global radius of all points, in units specified by `sizeUnits`
   * @default 10
   */
  pointSize?: number;

  /**
   * @deprecated Use `pointSize` instead
   */
  radiusPixels?: number;

  /**
   * Material settings for lighting effect.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;

  /**
   * Method called to retrieve the position of each object.
   * @default object => object.position
   */
  getPosition?: AccessorFunction<DataT, Position>;

  /**
   * The normal of each object, in `[nx, ny, nz]`.
   * @default [0, 0, 1]
   */
  getNormal?: Accessor<DataT, [number, number, number]>;

  /**
   * The rgba color is in the format of `[r, g, b, [a]]`
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
};

/** Render a point cloud with 3D positions, normals and colors. */
export default class PointCloudLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_PointCloudLayerProps<DataT>>
> {
  static layerName = 'PointCloudLayer';
  static defaultProps = defaultProps;

  state!: {
    model?: Model;
  };

  getShaders() {
    return super.getShaders({
      vs,
      fs,
      modules: [project32, gouraudMaterial, picking, pointCloudUniforms]
    });
  }

  initializeState() {
    this.getAttributeManager()!.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceNormals: {
        size: 3,
        transition: true,
        accessor: 'getNormal',
        defaultValue: DEFAULT_NORMAL
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getColor',
        defaultValue: DEFAULT_COLOR
      }
    });
  }

  updateState(params: UpdateParameters<this>): void {
    const {changeFlags, props} = params;
    super.updateState(params);
    if (changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
    }
    if (changeFlags.dataChanged) {
      normalizeData(props.data);
    }
  }

  draw({uniforms}) {
    const {pointSize, sizeUnits} = this.props;
    const model = this.state.model!;
    const pointCloudProps: PointCloudProps = {
      sizeUnits: UNIT[sizeUnits],
      radiusPixels: pointSize
    };
    model.shaderInputs.setProps({pointCloud: pointCloudProps});
    model.draw(this.context.renderPass);
  }

  protected _getModel(): Model {
    // a triangle that minimally cover the unit circle
    const positions: number[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
    }

    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: new Geometry({
        topology: 'triangle-list',
        attributes: {
          positions: new Float32Array(positions)
        }
      }),
      isInstanced: true
    });
  }
}
