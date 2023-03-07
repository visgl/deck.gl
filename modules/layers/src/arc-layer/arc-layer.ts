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
  UpdateParameters,
  LayerProps,
  LayerDataSource,
  Unit,
  AccessorFunction,
  Position,
  Accessor,
  Color,
  DefaultProps
} from '@deck.gl/core';

import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';

import vs from './arc-layer-vertex.glsl';
import fs from './arc-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<ArcLayerProps> = {
  getSourcePosition: {type: 'accessor', value: x => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: x => x.targetPosition},
  getSourceColor: {type: 'accessor', value: DEFAULT_COLOR},
  getTargetColor: {type: 'accessor', value: DEFAULT_COLOR},
  getWidth: {type: 'accessor', value: 1},
  getHeight: {type: 'accessor', value: 1},
  getTilt: {type: 'accessor', value: 0},

  greatCircle: false,

  widthUnits: 'pixels',
  widthScale: {type: 'number', value: 1, min: 0},
  widthMinPixels: {type: 'number', value: 0, min: 0},
  widthMaxPixels: {type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0}
};

/** All properties supported by ArcLayer. */
export type ArcLayerProps<DataT = any> = _ArcLayerProps<DataT> & LayerProps;

/** Properties added by ArcLayer. */
type _ArcLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * If `true`, create the arc along the shortest path on the earth surface.
   * @default false
   */
  greatCircle?: boolean;

  /**
   * The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`
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
   * Method called to retrieve the source position of each object.
   * @default object => object.sourcePosition
   */
  getSourcePosition?: AccessorFunction<DataT, Position>;

  /**
   * Method called to retrieve the target position of each object.
   * @default object => object.targetPosition
   */
  getTargetPosition?: AccessorFunction<DataT, Position>;

  /**
   * The rgba color is in the format of `[r, g, b, [a]]`.
   * @default [0, 0, 0, 255]
   */
  getSourceColor?: Accessor<DataT, Color>;

  /**
   * The rgba color is in the format of `[r, g, b, [a]]`.
   * @default [0, 0, 0, 255]
   */
  getTargetColor?: Accessor<DataT, Color>;

  /**
   * The line width of each object, in units specified by `widthUnits`.
   * @default 1
   */
  getWidth?: Accessor<DataT, number>;

  /**
   * Multiplier of layer height. `0` will make the layer flat.
   * @default 1
   */
  getHeight?: Accessor<DataT, number>;

  /**
   * Use to tilt the arc to the side if you have multiple arcs with the same source and target positions.
   * @default 0
   */
  getTilt?: Accessor<DataT, number>;
};

/** Render raised arcs joining pairs of source and target coordinates. */
export default class ArcLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ArcLayerProps<DataT>>
> {
  static layerName = 'ArcLayer';
  static defaultProps = defaultProps;

  state!: Layer['state'] & {
    model?: Model;
  };

  getBounds(): [number[], number[]] | null {
    return this.getAttributeManager()?.getBounds([
      'instanceSourcePositions',
      'instanceTargetPositions'
    ]);
  }

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]}); // 'project' module added by default.
  }

  // This layer has its own wrapLongitude logic
  get wrapLongitude() {
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
      instanceSourceColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: true,
        accessor: 'getSourceColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceTargetColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: true,
        accessor: 'getTargetColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceWidths: {
        size: 1,
        transition: true,
        accessor: 'getWidth',
        defaultValue: 1
      },
      instanceHeights: {
        size: 1,
        transition: true,
        accessor: 'getHeight',
        defaultValue: 1
      },
      instanceTilts: {
        size: 1,
        transition: true,
        accessor: 'getTilt',
        defaultValue: 0
      }
    });
    /* eslint-enable max-len */
  }

  updateState(opts: UpdateParameters<this>): void {
    super.updateState(opts);
    // Re-generate model if geometry changed
    if (opts.changeFlags.extensionsChanged) {
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager()!.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {widthUnits, widthScale, widthMinPixels, widthMaxPixels, greatCircle, wrapLongitude} =
      this.props;

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        greatCircle,
        widthUnits: UNIT[widthUnits],
        widthScale,
        widthMinPixels,
        widthMaxPixels,
        useShortestPath: wrapLongitude
      })
      .draw();
  }

  protected _getModel(gl: WebGLRenderingContext): Model {
    let positions: number[] = [];
    const NUM_SEGMENTS = 50;
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions = positions.concat([i, 1, 0, i, -1, 0]);
    }

    const model = new Model(gl, {
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

    model.setUniforms({numSegments: NUM_SEGMENTS});

    return model;
  }
}
