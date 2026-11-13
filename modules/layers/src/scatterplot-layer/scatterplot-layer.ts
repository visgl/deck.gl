// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  color,
  project32,
  picking,
  UNIT,
  _GPUVectorModel as DeckGPUVectorModel
} from '@deck.gl/core';
import type {FixedSizeList, Float, Int} from 'apache-arrow';
import {GPUVectorModel, GPUVectorGeometry, Geometry, makeGPUVectorGeometry} from '@luma.gl/engine';

import {scatterplotUniforms, ScatterplotProps} from './scatterplot-layer-uniforms';
import vs from './scatterplot-layer-vertex.glsl';
import fs from './scatterplot-layer-fragment.glsl';
import {getShaderWGSL} from './scatterplot-layer.wgsl';
import {
  ScatterplotLayerColumns,
  hasScatterplotColumns,
  type ScatterplotColumnProps
} from './scatterplot-layer-columns';

import type {
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Accessor,
  ArrowAccessor,
  Unit,
  Position,
  Color,
  DefaultProps
} from '@deck.gl/core';

const defaultPosition = (row: any) => row.position;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;

/** All props supported by the ScatterplotLayer */
export type ScatterplotLayerProps<DataT = unknown> = _ScatterplotLayerProps<DataT> & LayerProps;

/** Props added by the ScatterplotLayer */
type _ScatterplotLayerProps<DataT> = ScatterplotColumnProps & {
  data: LayerDataSource<DataT>;
  /**
   * The units of the radius, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'meters'
   */
  radiusUnits?: Unit;
  /**
   * Radius multiplier.
   * @default 1
   */
  radiusScale?: number;
  /**
   * The minimum radius in pixels. This prop can be used to prevent the circle from getting too small when zoomed out.
   * @default 0
   */
  radiusMinPixels?: number;
  /**
   * The maximum radius in pixels. This prop can be used to prevent the circle from getting too big when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  radiusMaxPixels?: number;

  /**
   * The units of the stroke width, one of `'meters'`, `'common'`, and `'pixels'`.
   * @default 'meters'
   */
  lineWidthUnits?: Unit;
  /**
   * Stroke width multiplier.
   * @default 1
   */
  lineWidthScale?: number;
  /**
   * The minimum stroke width in pixels. This prop can be used to prevent the line from getting too thin when zoomed out.
   * @default 0
   */
  lineWidthMinPixels?: number;
  /**
   * The maximum stroke width in pixels. This prop can be used to prevent the circle from getting too thick when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;

  /**
   * Draw the outline of points.
   * @default false
   */
  stroked?: boolean;
  /**
   * Draw the filled area of points.
   * @default true
   */
  filled?: boolean;
  /**
   * If `true`, rendered circles always face the camera. If `false` circles face up (i.e. are parallel with the ground plane).
   * @default false
   */
  billboard?: boolean;
  /**
   * If `true`, circles are rendered with smoothed edges. If `false`, circles are rendered with rough edges. Antialiasing can cause artifacts on edges of overlapping circles.
   * @default true
   */
  antialiasing?: boolean;

  /**
   * Center position accessor.
   */
  getPosition?: Accessor<DataT, Position>;
  /**
   * Radius constant, row accessor, or numeric Arrow vector converted to Float32.
   * @default 1
   */
  getRadius?: ArrowAccessor<DataT, number, Int | Float>;
  /**
   * Fill color constant, row accessor, or numeric RGB/RGBA Arrow column converted to RGBA8.
   * @default [0, 0, 0, 255]
   */
  getFillColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;
  /**
   * Stroke color constant, row accessor, or numeric RGB/RGBA Arrow column converted to RGBA8.
   * @default [0, 0, 0, 255]
   */
  getLineColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;
  /**
   * Stroke width constant, row accessor, or numeric Arrow vector converted to Float32.
   * @default 1
   */
  getLineWidth?: ArrowAccessor<DataT, number, Int | Float>;
  /**
   * Pixel offset accessor, [x, y] in pixels.
   * @default [0, 0]
   */
  getPixelOffset?: Accessor<DataT, Readonly<[number, number]>>;
  /**
   * @deprecated Use `getLineWidth` instead
   */
  strokeWidth?: number;
  /**
   * @deprecated Use `stroked` instead
   */
  outline?: boolean;
  /**
   * @deprecated Use `getFillColor` and `getLineColor` instead
   */
  getColor?: Accessor<DataT, Color>;
};

const defaultProps: DefaultProps<ScatterplotLayerProps> = {
  radiusUnits: 'meters',
  radiusScale: {type: 'number', min: 0, value: 1},
  radiusMinPixels: {type: 'number', min: 0, value: 0}, //  min point radius in pixels
  radiusMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER}, // max point radius in pixels

  lineWidthUnits: 'meters',
  lineWidthScale: {type: 'number', min: 0, value: 1},
  lineWidthMinPixels: {type: 'number', min: 0, value: 0},
  lineWidthMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  stroked: false,
  filled: true,
  billboard: false,
  antialiasing: true,

  getPosition: {type: 'accessor', value: defaultPosition},
  getRadius: {type: 'accessor', arrow: true, value: 1},
  getFillColor: {type: 'accessor', arrow: true, value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', arrow: true, value: DEFAULT_COLOR},
  getLineWidth: {type: 'accessor', arrow: true, value: 1},
  getPixelOffset: {type: 'accessor', value: [0, 0]},
  positions: {type: 'object', value: null, optional: true},
  radii: {type: 'object', value: null, optional: true},
  fillColors: {type: 'object', value: null, optional: true},
  lineColors: {type: 'object', value: null, optional: true},
  lineWidths: {type: 'object', value: null, optional: true},

  // deprecated
  strokeWidth: {deprecatedFor: 'getLineWidth'},
  outline: {deprecatedFor: 'stroked'},
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

/** Render circles at given coordinates. */
export default class ScatterplotLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ScatterplotLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName: string = 'ScatterplotLayer';

  state!: {
    model?: GPUVectorModel;
    geometry?: GPUVectorGeometry;
    columns?: ScatterplotLayerColumns;
  };

  /** Uses converted position bounds when Arrow columns bypass the attribute manager. */
  getBounds(): [number[], number[]] | null {
    return this.state?.columns ? this.state.columns.getBounds() : super.getBounds();
  }

  /** Bypasses accessor attribute generation when explicit columns drive the model. */
  protected _getAttributeManager() {
    return hasScatterplotColumns(this.props) ? null : super._getAttributeManager();
  }

  /** Uses the prepared column length as the instance count in column mode. */
  getNumInstances(): number {
    return this.state?.columns && !Number.isFinite(this.props.numInstances)
      ? this.state.columns.length
      : super.getNumInstances();
  }

  /** Keeps the layer loading until its asynchronous column conversion finishes. */
  get isLoaded(): boolean {
    return !this.state?.columns?.loading && super.isLoaded;
  }

  /** Releases column-owned resources and invalidates pending conversions on removal. */
  finalizeState(context) {
    this.state.columns?.destroy();
    super.finalizeState(context);
    this.state.geometry?.destroy();
  }

  getShaders() {
    const useRowIndexes = Boolean((this.props.data as any)?.attributes?.rowIndexes);
    return super.getShaders({
      vs,
      fs,
      source: getShaderWGSL(
        useRowIndexes,
        this.context.device.type === 'webgpu' && hasScatterplotColumns(this.props)
      ),
      defines: useRowIndexes ? {USE_ROW_INDEXES: true} : {},
      modules: [project32, color, picking, scatterplotUniforms]
    });
  }

  initializeState() {
    if (hasScatterplotColumns(this.props)) {
      if (this.props.extensions.length)
        throw new Error('Scatterplot Arrow columns do not support extensions');
      return;
    }
    this.initializeAccessorAttributes();
  }

  /** Registers the normal accessor attributes when entering or returning to accessor mode. */
  private initializeAccessorAttributes() {
    const attributes: Record<string, any> = (this.props.data as any)?.attributes?.rowIndexes
      ? {
          /** Caller-provided logical picking index per point instance. */
          rowIndexes: {
            size: 1,
            type: 'uint32',
            noAlloc: true
          }
        }
      : {};
    this.getAttributeManager()!.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition',
        ...this.usePositionTransforms()
      },
      instanceRadius: {
        size: 1,
        transition: true,
        accessor: 'getRadius',
        defaultValue: 1,
        bufferGroup: 'scatterplot-instance-data'
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: 'unorm8',
        accessor: 'getFillColor',
        defaultValue: [0, 0, 0, 255],
        bufferGroup: 'scatterplot-instance-data'
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: 'unorm8',
        accessor: 'getLineColor',
        defaultValue: [0, 0, 0, 255],
        bufferGroup: 'scatterplot-instance-data'
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: 'getLineWidth',
        defaultValue: 1,
        bufferGroup: 'scatterplot-instance-data'
      },
      instancePixelOffset: {
        size: 2,
        transition: true,
        accessor: 'getPixelOffset',
        bufferGroup: 'scatterplot-instance-data'
      },
      ...attributes
    });
  }

  updateState(params: UpdateParameters<this>) {
    if (hasScatterplotColumns(this.props)) {
      this.updateColumnState(params);
      return;
    }
    this.restoreAccessorState();
    super.updateState(params);

    if (params.changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
    }
  }

  /** Restores the accessor model and attributes after removing the Arrow columns. */
  private restoreAccessorState(): void {
    if (this.state.columns) {
      this.state.columns.destroy();
      this.state.columns = undefined;
      this.internalState!.attributeManager = super._getAttributeManager();
      this.initializeAccessorAttributes();
      this.state.model?.destroy();
      this.state.model = this._getModel();
    }
  }

  /** Updates the model and schedules conversion while Arrow columns are active. */
  private updateColumnState(params: UpdateParameters<this>): void {
    if (this.props.extensions.length)
      throw new Error('Scatterplot Arrow columns do not support extensions');
    const enteringColumns = !this.state.columns;
    if (enteringColumns) {
      this.internalState!.attributeManager?.finalize();
      this.internalState!.attributeManager = null;
      this.state.columns = new ScatterplotLayerColumns(this.context.device);
    }
    if (
      enteringColumns ||
      params.changeFlags.extensionsChanged ||
      Boolean((params.props.data as any)?.attributes?.rowIndexes) !==
        Boolean((params.oldProps.data as any)?.attributes?.rowIndexes)
    ) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
    }
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
        requireRows: !this.props.positions && this.props.getPosition === defaultPosition
      }
    });
  }

  draw({uniforms}) {
    const {
      radiusUnits,
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      stroked,
      filled,
      billboard,
      antialiasing,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels
    } = this.props;
    const scatterplotProps: ScatterplotProps = {
      stroked,
      filled,
      billboard,
      antialiasing,
      radiusUnits: UNIT[radiusUnits],
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      lineWidthUnits: UNIT[lineWidthUnits],
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      rowIndexOffset: 0
    };
    const model = this.state.model;
    if (!model) return;
    if (
      this.state.columns &&
      this.state.columns.hasRowIndexes !== Boolean((this.props.data as any)?.attributes?.rowIndexes)
    )
      return;
    model.shaderInputs.setProps({scatterplot: scatterplotProps});
    if (this.state.columns) {
      this.state.columns.draw(model, this.context.renderPass, offset => {
        model.setInstanceCount(
          Math.min(model.instanceCount, Math.max(0, this.getNumInstances() - offset))
        );
        model.shaderInputs.setProps({scatterplot: {rowIndexOffset: offset}});
      });
    } else {
      model.draw(this.context.renderPass);
    }
  }

  protected _getModel() {
    // a square that minimally cover the unit circle
    const positions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
    this.state.geometry?.destroy();
    this.state.geometry = undefined;
    const geometry = new Geometry({
      topology: 'triangle-strip',
      attributes: {positions: {size: 3, value: new Float32Array(positions)}}
    });
    const options = {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout:
        this.state.columns?.getBufferLayouts(
          Boolean((this.props.data as any)?.attributes?.rowIndexes)
        ) ?? this.getAttributeManager()!.getBufferLayouts(),
      isInstanced: true
    };
    if (this.state.columns) {
      if (this.context.device.type === 'webgpu') {
        return new GPUVectorModel(this.context.device, {
          ...options,
          topology: 'triangle-strip',
          vertexCount: 4,
          inferDrawCount: 'instance'
        });
      }
      const vectorGeometry = makeGPUVectorGeometry(this.context.device, geometry);
      this.state.geometry = vectorGeometry;
      return new GPUVectorModel(this.context.device, {
        ...options,
        geometry: vectorGeometry,
        inferDrawCount: 'instance'
      });
    }
    return new DeckGPUVectorModel(this.context.device, {
      ...options,
      geometry,
      enforceMatchingVectorLengths: false,
      inferDrawCount: 'no'
    });
  }
}
