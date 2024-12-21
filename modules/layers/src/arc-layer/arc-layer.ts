// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

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

import {Model} from '@luma.gl/engine';

import {arcUniforms, ArcProps} from './arc-layer-uniforms';
import vs from './arc-layer-vertex.glsl';
import fs from './arc-layer-fragment.glsl';

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<ArcLayerProps> = {
  getSourcePosition: {type: 'accessor', value: (x: any) => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: (x: any) => x.targetPosition},
  getSourceColor: {type: 'accessor', value: DEFAULT_COLOR},
  getTargetColor: {type: 'accessor', value: DEFAULT_COLOR},
  getWidth: {type: 'accessor', value: 1},
  getHeight: {type: 'accessor', value: 1},
  getTilt: {type: 'accessor', value: 0},

  greatCircle: false,
  numSegments: {type: 'number', value: 50, min: 1},

  widthUnits: 'pixels',
  widthScale: {type: 'number', value: 1, min: 0},
  widthMinPixels: {type: 'number', value: 0, min: 0},
  widthMaxPixels: {type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0}
};

/** All properties supported by ArcLayer. */
export type ArcLayerProps<DataT = unknown> = _ArcLayerProps<DataT> & LayerProps;

/** Properties added by ArcLayer. */
type _ArcLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /**
   * If `true`, create the arc along the shortest path on the earth surface.
   * @default false
   */
  greatCircle?: boolean;

  /**
   * The number of segments used to draw each arc.
   * @default 50
   */
  numSegments?: number;

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

  state!: {
    model?: Model;
  };

  getBounds(): [number[], number[]] | null {
    return this.getAttributeManager()?.getBounds([
      'instanceSourcePositions',
      'instanceTargetPositions'
    ]);
  }

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking, arcUniforms]}); // 'project' module added by default.
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
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getSourcePosition'
      },
      instanceTargetPositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getTargetPosition'
      },
      instanceSourceColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getSourceColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceTargetColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
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

  updateState(params: UpdateParameters<this>): void {
    super.updateState(params);

    if (params.changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {
      widthUnits,
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      greatCircle,
      wrapLongitude,
      numSegments
    } = this.props;
    const arcProps: ArcProps = {
      numSegments,
      widthUnits: UNIT[widthUnits],
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      greatCircle,
      useShortestPath: wrapLongitude
    };

    const model = this.state.model!;
    model.shaderInputs.setProps({arc: arcProps});
    model.setVertexCount(numSegments * 2);
    model.draw(this.context.renderPass);
  }

  protected _getModel(): Model {
    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      topology: 'triangle-strip',
      isInstanced: true
    });
  }
}
