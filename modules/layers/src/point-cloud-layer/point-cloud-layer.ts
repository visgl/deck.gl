// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {
  Layer,
  project32,
  gouraudLighting,
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
import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';

import vs from './point-cloud-layer-vertex.glsl';
import fs from './point-cloud-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];
const DEFAULT_NORMAL: [number, number, number] = [0, 0, 1];

const defaultProps: DefaultProps<PointCloudLayerProps> = {
  sizeUnits: 'pixels',
  pointSize: {type: 'number', min: 0, value: 10}, //  point radius in pixels

  getPosition: {type: 'accessor', value: x => x.position},
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
    attributes.instanceColors = attributes.COLOR_0;
  }
}

/** All properties supported by PointCloudLayer. */
export type PointCloudLayerProps<DataT = any> = _PointCloudLayerProps<DataT> & LayerProps;

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

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, gouraudLighting, picking]});
  }

  initializeState() {
    this.getAttributeManager()!.addInstanced({
      instancePositions: {
        size: 3,
        type: GL.DOUBLE,
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
        type: GL.UNSIGNED_BYTE,
        normalized: true,
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
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager()!.invalidateAll();
    }
    if (changeFlags.dataChanged) {
      normalizeData(props.data);
    }
  }

  draw({uniforms}) {
    const {pointSize, sizeUnits} = this.props;

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        sizeUnits: UNIT[sizeUnits],
        radiusPixels: pointSize
      })
      .draw();
  }

  protected _getModel(gl: WebGLRenderingContext): Model {
    // a triangle that minimally cover the unit circle
    const positions: number[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
    }

    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        attributes: {
          positions: new Float32Array(positions)
        }
      }),
      isInstanced: true
    });
  }
}
