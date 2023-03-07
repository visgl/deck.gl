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
  picking,
  UNIT,
  LayerProps,
  LayerDataSource,
  Unit,
  Position,
  Accessor,
  Color,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';

import vs from './line-layer-vertex.glsl';
import fs from './line-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<LineLayerProps> = {
  getSourcePosition: {type: 'accessor', value: x => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: x => x.targetPosition},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getWidth: {type: 'accessor', value: 1},

  widthUnits: 'pixels',
  widthScale: {type: 'number', value: 1, min: 0},
  widthMinPixels: {type: 'number', value: 0, min: 0},
  widthMaxPixels: {type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0}
};

/** All properties supported by LineLayer. */
export type LineLayerProps<DataT = any> = _LineLayerProps<DataT> & LayerProps;

/** Properties added by LineLayer. */
type _LineLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'pixels'
   */
  widthUnits?: Unit;

  /**
   * The scaling multiplier for the width of each line.
   * @default 1
   */
  widthScale?: number;

  /**
   * The minimum line width in pixels.
   * @default 0
   */
  widthMinPixels?: number;

  /**
   * The maximum line width in pixels.
   * @default Number.MAX_SAFE_INTEGER
   */
  widthMaxPixels?: number;

  /**
   * Source position of each object.
   * @default object => object.sourcePosition
   */
  getSourcePosition?: Accessor<DataT, Position>;

  /**
   * Target position of each object.
   * @default object => object.targetPosition
   */
  getTargetPosition?: Accessor<DataT, Position>;

  /**
   * The rgba color is in the format of `[r, g, b, [a]]`.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;

  /**
   * Width of each object
   * @default 1
   */
  getWidth?: Accessor<DataT, number>;
};

/**
 * A layer that renders straight lines joining pairs of source and target coordinates.
 */
export default class LineLayer<DataT = any, ExtraProps extends {} = {}> extends Layer<
  ExtraProps & Required<_LineLayerProps<DataT>>
> {
  static layerName = 'LineLayer';
  static defaultProps = defaultProps;

  getBounds(): [number[], number[]] | null {
    return this.getAttributeManager()?.getBounds([
      'instanceSourcePositions',
      'instanceTargetPositions'
    ]);
  }

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]});
  }

  // This layer has its own wrapLongitude logic
  get wrapLongitude(): boolean {
    return false;
  }

  initializeState() {
    const attributeManager = this.getAttributeManager()!;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getSourcePosition'
      },
      instanceTargetPositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getTargetPosition'
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: true,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceWidths: {
        size: 1,
        transition: true,
        accessor: 'getWidth',
        defaultValue: 1
      }
    });
    /* eslint-enable max-len */
  }

  updateState(params: UpdateParameters<this>): void {
    super.updateState(params);

    if (params.changeFlags.extensionsChanged) {
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager()!.invalidateAll();
    }
  }

  draw({uniforms}): void {
    const {widthUnits, widthScale, widthMinPixels, widthMaxPixels, wrapLongitude} = this.props;

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        widthUnits: UNIT[widthUnits],
        widthScale,
        widthMinPixels,
        widthMaxPixels,
        useShortestPath: wrapLongitude ? 1 : 0
      })
      .draw();

    if (wrapLongitude) {
      // Render a second copy for the clipped lines at the 180th meridian
      this.state.model
        .setUniforms({
          useShortestPath: -1
        })
        .draw();
    }
  }

  protected _getModel(gl: WebGLRenderingContext): Model {
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];

    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_STRIP,
        attributes: {
          positions: new Float32Array(positions)
        }
      }),
      isInstanced: true
    });
  }
}
