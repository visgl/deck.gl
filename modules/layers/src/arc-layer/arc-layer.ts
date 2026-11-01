// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  project32,
  color,
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
  DefaultProps,
  _GPUVectorModel as GPUVectorModel
} from '@deck.gl/core';

import type {Model} from '@luma.gl/engine';
import {ArcLayerColumns, hasArcColumns, type ArcColumnProps} from './arc-layer-columns';

import {arcUniforms, ArcProps} from './arc-layer-uniforms';
import {shaderWGSL} from './arc-layer.wgsl';
import vs from './arc-layer-vertex.glsl';
import fs from './arc-layer-fragment.glsl';

const defaultSourcePosition = (row: any) => row.sourcePosition;
const defaultTargetPosition = (row: any) => row.targetPosition;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;

const defaultProps: DefaultProps<ArcLayerProps> = {
  sourcePositions: {type: 'object', value: null, optional: true},
  targetPositions: {type: 'object', value: null, optional: true},
  sourceColors: {type: 'object', value: null, optional: true},
  targetColors: {type: 'object', value: null, optional: true},
  widths: {type: 'object', value: null, optional: true},
  heights: {type: 'object', value: null, optional: true},
  tilts: {type: 'object', value: null, optional: true},
  getSourcePosition: {type: 'accessor', value: defaultSourcePosition},
  getTargetPosition: {type: 'accessor', value: defaultTargetPosition},
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
  widthMaxPixels: {type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0},
  antialiasing: false
};

/** All properties supported by ArcLayer. */
export type ArcLayerProps<DataT = unknown> = _ArcLayerProps<DataT> & LayerProps;

/** Properties added by ArcLayer. */
type _ArcLayerProps<DataT> = ArcColumnProps & {
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
   * When enabled, computes edge coverage in the shader. When disabled, relies on render-target
   * multisampling. Shader-computed coverage can cause artifacts where arcs overlap. Only the edges
   * along the width of the arc are smoothed - the two ends are not.
   * @default false
   * @see https://luma.gl/docs/api-guide/gpu/gpu-antialiasing
   */
  antialiasing?: boolean;

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
    columns?: ArcLayerColumns;
  } & Layer['state'];

  /** Bypasses attribute generation while Arrow columns drive the model. */
  protected _getAttributeManager() {
    return hasArcColumns(this.props) ? null : super._getAttributeManager();
  }

  getNumInstances(): number {
    return this.state?.columns ? this.state.columns.length : super.getNumInstances();
  }

  get isLoaded(): boolean {
    return !this.state?.columns?.loading && super.isLoaded;
  }

  finalizeState(context) {
    this.state.columns?.destroy();
    super.finalizeState(context);
  }

  getBounds(): [number[], number[]] | null {
    return this.getAttributeManager()?.getBounds([
      'instanceSourcePositions',
      'instanceTargetPositions'
    ]);
  }

  getShaders() {
    const {antialiasing} = this.props;
    return super.getShaders({
      vs,
      fs,
      source: shaderWGSL,
      defines: antialiasing ? {ANTIALIASING: 1} : {},
      modules: [project32, color, picking, arcUniforms]
    }); // 'project' module added by default.
  }

  // This layer has its own wrapLongitude logic
  get wrapLongitude() {
    return false;
  }

  initializeState() {
    if (hasArcColumns(this.props)) {
      if (this.props.extensions.length)
        throw new Error('Arc Arrow columns do not support extensions');
      return;
    }
    this.initializeAccessorAttributes();
  }

  private initializeAccessorAttributes() {
    const attributeManager = this.getAttributeManager()!;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
        transition: true,
        accessor: 'getSourcePosition'
      },
      instanceTargetPositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
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
    if (hasArcColumns(this.props)) {
      if (this.props.extensions.length)
        throw new Error('Arc Arrow columns do not support extensions');
      const entering = !this.state.columns;
      if (entering) {
        this.internalState!.attributeManager?.finalize();
        this.internalState!.attributeManager = null;
        this.state.columns = new ArcLayerColumns(this.context.device);
      }
      if (
        entering ||
        params.changeFlags.extensionsChanged ||
        params.props.antialiasing !== params.oldProps.antialiasing
      ) {
        this.state.model?.destroy();
        this.state.model = this._getModel();
      }
      if (this.internalState!.isAsyncPropLoading('data')) return;
      if (
        params.changeFlags.dataChanged ||
        params.changeFlags.updateTriggersChanged ||
        params.changeFlags.projectionChanged ||
        this.state.columns!.needsUpdate(params.props, params.oldProps)
      ) {
        void this.state.columns!.update(
          this.props,
          () => {
            this.setState({});
            this.setNeedsUpdate();
          },
          error => this.raiseError(error, 'converting Arrow columns'),
          {
            transform: this.usePositionTransforms().transform?.bind(this),
            fp64: this.use64bitPositions(),
            requireRows:
              (!this.props.sourcePositions &&
                this.props.getSourcePosition === defaultSourcePosition) ||
              (!this.props.targetPositions &&
                this.props.getTargetPosition === defaultTargetPosition)
          }
        );
      }
      return;
    }
    if (this.state.columns) {
      this.state.columns.destroy();
      this.state.columns = undefined;
      this.internalState!.attributeManager = super._getAttributeManager();
      this.initializeAccessorAttributes();
      this.state.model?.destroy();
      this.state.model = this._getModel();
    }
    super.updateState(params);
    const {props, oldProps, changeFlags} = params;
    if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
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
      rowIndexOffset: 0,
      widthUnits: UNIT[widthUnits],
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      greatCircle,
      useShortestPath:
        wrapLongitude && !this.state.preproject && this.state.sourceCrs?.signature === 'WGS84'
    };

    const model = this.state.model!;
    model.shaderInputs.setProps({arc: arcProps});
    model.setVertexCount(numSegments * 2);
    if (this.state.columns)
      this.state.columns.draw(model as GPUVectorModel, this.context.renderPass, offset =>
        model.shaderInputs.setProps({arc: {rowIndexOffset: offset}})
      );
    else model.draw(this.context.renderPass);
  }

  protected _getModel(): Model {
    return new GPUVectorModel(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout:
        this.state.columns?.getBufferLayouts() ?? this.getAttributeManager()!.getBufferLayouts(),
      topology: 'triangle-strip',
      isInstanced: true
    });
  }
}
