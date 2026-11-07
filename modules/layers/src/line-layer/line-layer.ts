// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  project32,
  color,
  picking,
  UNIT,
  LayerProps,
  LayerDataSource,
  Unit,
  Position,
  Accessor,
  Color,
  UpdateParameters,
  DefaultProps,
  _GPUVectorModel as DeckGPUVectorModel
} from '@deck.gl/core';
import {GPUVectorModel, GPUVectorGeometry, Geometry, makeGPUVectorGeometry} from '@luma.gl/engine';
import {LineLayerColumns, hasLineColumns, type LineColumnProps} from './line-layer-columns';

import {lineUniforms, LineProps} from './line-layer-uniforms';
import {shaderWGSL} from './line-layer.wgsl';
import vs from './line-layer-vertex.glsl';
import fs from './line-layer-fragment.glsl';

const defaultSourcePosition = (x: any) => x.sourcePosition;
const defaultTargetPosition = (x: any) => x.targetPosition;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;

const defaultProps: DefaultProps<LineLayerProps> = {
  getSourcePosition: {type: 'accessor', value: defaultSourcePosition},
  getTargetPosition: {type: 'accessor', value: defaultTargetPosition},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getWidth: {type: 'accessor', value: 1},
  sourcePositions: {type: 'object', value: null, optional: true},
  targetPositions: {type: 'object', value: null, optional: true},
  colors: {type: 'object', value: null, optional: true},
  widths: {type: 'object', value: null, optional: true},

  widthUnits: 'pixels',
  widthScale: {type: 'number', value: 1, min: 0},
  widthMinPixels: {type: 'number', value: 0, min: 0},
  widthMaxPixels: {type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0},
  antialiasing: false
};

/** All properties supported by LineLayer. */
export type LineLayerProps<DataT = unknown> = _LineLayerProps<DataT> & LayerProps;

/** Properties added by LineLayer. */
type _LineLayerProps<DataT> = LineColumnProps & {
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
   * When enabled, computes edge coverage in the shader. When disabled, relies on render-target
   * multisampling. Shader-computed coverage can cause artifacts where lines overlap. Only the edges
   * along the width of the line are smoothed - the two ends are not.
   * @default false
   * @see https://luma.gl/docs/api-guide/gpu/gpu-antialiasing
   */
  antialiasing?: boolean;

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

  state!: {
    model?: GPUVectorModel;
    wrappedModel?: GPUVectorModel;
    geometry?: GPUVectorGeometry;
    columns?: LineLayerColumns;
  } & Layer['state'];

  getBounds(): [number[], number[]] | null {
    if (this.state?.columns) return this.state.columns.getBounds();
    return this.getAttributeManager()?.getBounds([
      'instanceSourcePositions',
      'instanceTargetPositions'
    ]);
  }

  /** Supplies both longitude-wrapping models to layer shader and parameter updates. */
  getModels(): GPUVectorModel[] {
    return this.state?.wrappedModel && this.state.model
      ? [this.state.model, this.state.wrappedModel]
      : super.getModels();
  }

  /** Skips the attribute manager for column inputs. */
  protected _getAttributeManager() {
    return hasLineColumns(this.props) ? null : super._getAttributeManager();
  }

  /** Returns the requested instance count or prepared column length. */
  getNumInstances(): number {
    return this.state?.columns && !Number.isFinite(this.props.numInstances)
      ? this.state.columns.length
      : super.getNumInstances();
  }

  /** Includes asynchronous column uploads in the loading state. */
  get isLoaded(): boolean {
    return !this.state?.columns?.loading && super.isLoaded;
  }

  /** Releases owned Arrow columns, geometry, and the longitude-wrapping model. */
  finalizeState(context) {
    this.state.columns?.destroy();
    super.finalizeState(context);
    this.state.geometry?.destroy();
  }

  getShaders() {
    const {antialiasing} = this.props;
    return super.getShaders({
      vs,
      fs,
      source: shaderWGSL,
      defines: antialiasing ? {ANTIALIASING: 1} : {},
      modules: [project32, color, picking, lineUniforms]
    });
  }

  // This layer has its own wrapLongitude logic
  get wrapLongitude(): boolean {
    return false;
  }

  initializeState() {
    if (hasLineColumns(this.props)) return;
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
      instanceColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
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
    if (hasLineColumns(this.props)) {
      this.updateColumnState(params);
      return;
    }
    if (this.state.columns) {
      this.state.columns.destroy();
      this.state.columns = undefined;
      this.internalState!.attributeManager = super._getAttributeManager();
      this.initializeAccessorAttributes();
      this.state.model?.destroy();
      this.state.wrappedModel?.destroy();
      this.state.wrappedModel = undefined;
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

  /** Updates the column model and schedules conversion as inputs change. */
  private updateColumnState(params: UpdateParameters<this>): void {
    if (this.props.extensions.length)
      throw new Error('Line Arrow columns do not support extensions');
    const entering = !this.state.columns;
    if (entering) {
      this.internalState!.attributeManager?.finalize();
      this.internalState!.attributeManager = null;
      this.state.columns = new LineLayerColumns(this.context.device);
    }
    if (
      entering ||
      params.changeFlags.extensionsChanged ||
      params.props.antialiasing !== params.oldProps.antialiasing
    ) {
      this.state.model?.destroy();
      this.state.wrappedModel?.destroy();
      this.state.wrappedModel = undefined;
      this.state.model = this._getModel();
      this.state.wrappedModel = this._getModel(true);
    }
    const binary = (this.props.data as any)?.attributes;
    void this.state.columns!.updateIfNeeded(params, {
      dataLoading: this.internalState!.isAsyncPropLoading('data'),
      changed: () => {
        this.setState({});
        this.setNeedsUpdate();
      },
      failed: error => this.raiseError(error, 'converting Arrow columns'),
      positionOptions: {
        transform: this.usePositionTransforms().transform?.bind(this),
        fp64: this.use64bitPositions(),
        requireRows:
          (!this.props.sourcePositions &&
            this.props.getSourcePosition === defaultSourcePosition &&
            !binary?.getSourcePosition &&
            !binary?.instanceSourcePositions) ||
          (!this.props.targetPositions &&
            this.props.getTargetPosition === defaultTargetPosition &&
            !binary?.getTargetPosition &&
            !binary?.instanceTargetPositions)
      }
    });
  }

  draw({uniforms}): void {
    const {widthUnits, widthScale, widthMinPixels, widthMaxPixels} = this.props;
    const wrapLongitude =
      this.props.wrapLongitude &&
      !this.state.preproject &&
      this.state.sourceCrs?.signature === 'WGS84';
    const model = this.state.model!;
    const lineProps: LineProps = {
      widthUnits: UNIT[widthUnits],
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      rowIndexOffset: 0,
      useShortestPath: wrapLongitude ? 1 : 0
    };
    model.shaderInputs.setProps({line: lineProps});
    if (this.state.columns) {
      this.drawColumns(model);
    } else model.draw(this.context.renderPass);

    if (wrapLongitude) {
      // Render a second copy for the clipped lines at the 180th meridian
      const wrapped = this.state.columns ? this.state.wrappedModel! : model;
      wrapped.shaderInputs.setProps({line: {...lineProps, useShortestPath: -1}});
      if (this.state.columns) this.drawColumns(wrapped);
      else wrapped.draw(this.context.renderPass);
    }
  }

  /** Draws matching chunks with global picking offsets and explicit instance limits. */
  private drawColumns(model: GPUVectorModel): void {
    this.state.columns!.draw(model, this.context.renderPass, offset => {
      model.setInstanceCount(
        Math.min(model.instanceCount, Math.max(0, this.getNumInstances() - offset))
      );
      model.shaderInputs.setProps({line: {rowIndexOffset: offset}});
    });
  }

  protected _getModel(wrapped = false): GPUVectorModel {
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];

    const geometry = new Geometry({
      topology: 'triangle-strip',
      attributes: {positions: {size: 3, value: new Float32Array(positions)}}
    });
    const options = {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout:
        this.state.columns?.getBufferLayouts() ?? this.getAttributeManager()!.getBufferLayouts(),
      isInstanced: true
    };
    if (this.state.columns) {
      if (!wrapped) {
        this.state.geometry?.destroy();
        this.state.geometry = makeGPUVectorGeometry(this.context.device, geometry);
      }
      return new GPUVectorModel(this.context.device, {
        ...options,
        geometry: this.state.geometry,
        inferDrawCount: 'instance'
      });
    }
    this.state.geometry?.destroy();
    this.state.geometry = undefined;
    return new DeckGPUVectorModel(this.context.device, {...options, geometry});
  }
}
