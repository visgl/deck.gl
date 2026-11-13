// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {FixedSizeList, Float, Int} from 'apache-arrow';

import {
  Layer,
  _GPUVectorModel as DeckGPUVectorModel,
  project32,
  color,
  picking,
  UNIT,
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Unit,
  Position,
  Accessor,
  ArrowAccessor,
  Color,
  Material,
  DefaultProps,
  gouraudMaterial,
  phongMaterial
} from '@deck.gl/core';
import type {BufferLayout} from '@luma.gl/core';
import {
  Geometry,
  GPUVectorModel,
  type GPUVectorGeometry,
  makeGPUVectorGeometry,
  makeInterleavedGeometry
} from '@luma.gl/engine';
import {
  ColumnLayerColumns,
  hasColumnLayerColumns,
  type ColumnLayerColumnProps
} from './column-layer-columns';
import ColumnGeometry from './column-geometry';

import {columnUniforms, ColumnProps} from './column-layer-uniforms';
import {getColumnLayerWGSL as source} from './column-layer.wgsl';
import vs from './column-layer-vertex.glsl';
import fs from './column-layer-fragment.glsl';

const defaultPosition = (x: any) => x.position;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;

const GEOMETRY_BUFFER_LAYOUT: BufferLayout = {
  name: 'geometry',
  stepMode: 'vertex',
  byteStride: 24,
  attributes: [
    {attribute: 'positions', format: 'float32x3', byteOffset: 0},
    {attribute: 'normals', format: 'float32x3', byteOffset: 12}
  ]
};

const defaultProps: DefaultProps<ColumnLayerProps> = {
  positions: {type: 'object', value: null, optional: true},
  elevations: {type: 'object', value: null, optional: true},
  fillColors: {type: 'object', value: null, optional: true},
  lineColors: {type: 'object', value: null, optional: true},
  lineWidths: {type: 'object', value: null, optional: true},
  diskResolution: {type: 'number', min: 4, value: 20},
  vertices: null,
  radius: {type: 'number', min: 0, value: 1000},
  angle: {type: 'number', value: 0},
  offset: {type: 'array', value: [0, 0]},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  elevationScale: {type: 'number', min: 0, value: 1},
  radiusUnits: 'meters',
  lineWidthUnits: 'meters',
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,

  extruded: true,
  wireframe: false,
  filled: true,
  stroked: false,
  flatShading: false,

  getPosition: {type: 'accessor', arrow: true, value: defaultPosition},
  getFillColor: {type: 'accessor', arrow: true, value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', arrow: true, value: DEFAULT_COLOR},
  getLineWidth: {type: 'accessor', arrow: true, value: 1},
  getElevation: {type: 'accessor', arrow: true, value: 1000},
  material: true,
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

/** All properties supported by ColumnLayer. */
export type ColumnLayerProps<DataT = unknown> = _ColumnLayerProps<DataT> & LayerProps;

/** Properties added by ColumnLayer. */
type _ColumnLayerProps<DataT> = ColumnLayerColumnProps & {
  data: LayerDataSource<DataT>;
  /**
   * The number of sides to render the disk as.
   * @default 20
   */
  diskResolution?: number;

  /**
   * isk size in units specified by `radiusUnits`.
   * @default 1000
   */
  radius?: number;

  /**
   * Disk rotation, counter-clockwise in degrees.
   * @default 0
   */
  angle?: number;

  /**
   * Replace the default geometry (regular polygon that fits inside the unit circle) with a custom one.
   * @default null
   */
  vertices?: Position[] | null;

  /**
   * Disk offset from the position, relative to the radius.
   * @default [0,0]
   */
  offset?: Readonly<[number, number]>;

  /**
   * Radius multiplier, between 0 - 1
   * @default 1
   */
  coverage?: number;

  /**
   * Column elevation multiplier.
   * @default 1
   */
  elevationScale?: number;

  /**
   * Whether to draw a filled column (solid fill).
   * @default true
   */
  filled?: boolean;

  /**
   * Whether to draw an outline around the disks.
   * @default false
   */
  stroked?: boolean;

  /**
   * Whether to extrude the columns. If set to `false`, all columns will be rendered as flat polygons.
   * @default true
   */
  extruded?: boolean;

  /**
   * Whether to generate a line wireframe of the column.
   * @default false
   */
  wireframe?: boolean;

  /**
   * If `true`, the vertical surfaces of the columns use [flat shading](https://en.wikipedia.org/wiki/Shading#Flat_vs._smooth_shading).
   * @default false
   */
  flatShading?: boolean;

  /**
   * The units of the radius.
   * @default 'meters'
   */
  radiusUnits?: Unit;

  /**
   * The units of the line width.
   * @default 'meters'
   */
  lineWidthUnits?: Unit;

  /**
   * The line width multiplier that multiplied to all outlines.
   * @default 1
   */
  lineWidthScale?: number;

  /**
   * The minimum outline width in pixels.
   * @default 0
   */
  lineWidthMinPixels?: number;

  /**
   * The maximum outline width in pixels.
   * @default Number.MAX_SAFE_INTEGER
   */
  lineWidthMaxPixels?: number;

  /**
   * Material settings for lighting effect. Applies if `extruded: true`.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;

  /**
   * Method called to retrieve the position of each column.
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default object => object.position
   */
  getPosition?: ArrowAccessor<DataT, Position, FixedSizeList<Int | Float>>;

  /**
   * @deprecated Use getFilledColor and getLineColor instead
   */
  getColor?: Accessor<DataT, Color>;

  /**
   * Fill collor value or accessor.
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default [0, 0, 0, 255]
   */
  getFillColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;

  /**
   * Line color value or accessor.
   *
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default [0, 0, 0, 255]
   */
  getLineColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;

  /**
   * The elevation of each cell in meters.
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default 1000
   */
  getElevation?: ArrowAccessor<DataT, number, Int | Float>;

  /**
   * The width of the outline of the column, in units specified by `lineWidthUnits`.
   *
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default 1
   */
  getLineWidth?: ArrowAccessor<DataT, number, Int | Float>;
};

/** Render extruded cylinders (tessellated regular polygons) at given coordinates. */
export default class ColumnLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ColumnLayerProps<DataT>>
> {
  static layerName = 'ColumnLayer';
  static defaultProps = defaultProps;

  state!: {
    fillModel?: GPUVectorModel;
    strokeModel?: GPUVectorModel;
    wireframeModel?: GPUVectorModel;
    models?: GPUVectorModel[];
    columns?: ColumnLayerColumns;
    geometries?: Map<GPUVectorModel, GPUVectorGeometry>;
    edgeDistance: number;
  };

  /** Uses prepared column bounds when Arrow positions bypass accessor generation. */
  getBounds(): [number[], number[]] | null {
    return this.state?.columns ? this.state.columns.getBounds() : super.getBounds();
  }

  /** Avoids generating legacy attributes for explicit Arrow columns. */
  protected _getAttributeManager() {
    return hasColumnLayerColumns(this.props) ? null : super._getAttributeManager();
  }

  /** Uses the column length unless an explicit instance limit was supplied. */
  getNumInstances(): number {
    return this.state?.columns && !Number.isFinite(this.props.numInstances)
      ? this.state.columns.length
      : super.getNumInstances();
  }

  /** Includes asynchronous Arrow conversion in the layer loading state. */
  get isLoaded(): boolean {
    return !this.state?.columns?.loading && super.isLoaded;
  }

  /** Releases converted columns and layer-owned geometry after model teardown. */
  finalizeState(context) {
    super.finalizeState(context);
    this.state.columns?.destroy();
    this.state.geometries?.forEach(geometry => geometry.destroy());
  }

  getShaders() {
    const defines: Record<string, any> = {};

    const {flatShading} = this.props;
    if (flatShading) {
      defines.FLAT_SHADING = 1;
    }
    return super.getShaders({
      vs,
      fs,
      source: source(flatShading),
      defines,
      modules: [
        project32,
        color,
        flatShading ? phongMaterial : gouraudMaterial,
        picking,
        columnUniforms
      ]
    });
  }

  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    if (hasColumnLayerColumns(this.props)) {
      if (this.props.extensions.length)
        throw new Error('Column Arrow columns do not support extensions');
      return;
    }
    const attributeManager = this.getAttributeManager()!;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceElevations: {
        size: 1,
        transition: true,
        accessor: 'getElevation'
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getLineColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: 'getLineWidth',
        transition: true
      }
    });
    /* eslint-enable max-len */
  }

  updateState(params: UpdateParameters<this>): void {
    const columnMode = hasColumnLayerColumns(this.props);
    const modeChanged = columnMode !== Boolean(this.state.columns);
    if (columnMode) {
      this.updateColumnState(params);
    } else {
      if (this.state.columns) {
        this.state.columns.destroy();
        this.state.columns = undefined;
        this.internalState!.attributeManager = super._getAttributeManager();
        this.initializeState();
      }
      super.updateState(params);
    }

    const {props, oldProps, changeFlags} = params;
    const regenerateModels =
      modeChanged || changeFlags.extensionsChanged || props.flatShading !== oldProps.flatShading;

    if (regenerateModels) {
      this.state.models?.forEach(model => model.destroy());
      this.state.geometries?.forEach(geometry => geometry.destroy());
      this.state.geometries = new Map();
      this.setState(this._getModels());
      this.getAttributeManager()?.invalidateAll();
    }

    const instanceCount = this.getNumInstances();
    this.state.fillModel!.setInstanceCount(instanceCount);
    this.state.strokeModel!.setInstanceCount(instanceCount);
    this.state.wireframeModel!.setInstanceCount(instanceCount);

    if (
      regenerateModels ||
      props.diskResolution !== oldProps.diskResolution ||
      props.vertices !== oldProps.vertices ||
      props.extruded !== oldProps.extruded ||
      props.stroked !== oldProps.stroked
    ) {
      this._updateGeometry(props);
    }
  }

  /** Shares conversion, accessor fallback, cancellation and chunk validation with other layers. */
  private updateColumnState(params: UpdateParameters<this>): void {
    if (this.props.extensions.length)
      throw new Error('Column Arrow columns do not support extensions');
    if (!this.state.columns) {
      this.internalState!.attributeManager?.finalize();
      this.internalState!.attributeManager = null;
      this.state.columns = new ColumnLayerColumns(this.context.device);
    }
    void this.state.columns.updateIfNeeded(params, {
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

  getGeometry(diskResolution: number, vertices: number[] | undefined, hasThinkness: boolean) {
    const geometry = new ColumnGeometry({
      radius: 1,
      height: hasThinkness ? 2 : 0,
      vertices,
      nradial: diskResolution
    });

    let meanVertexDistance = 0;
    if (vertices) {
      for (let i = 0; i < diskResolution; i++) {
        const p = vertices[i];
        const d = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
        meanVertexDistance += d / diskResolution;
      }
    } else {
      meanVertexDistance = 1;
    }
    this.setState({
      edgeDistance: Math.cos(Math.PI / diskResolution) * meanVertexDistance
    });

    return geometry;
  }

  protected _getModels() {
    const shaders = this.getShaders();
    const bufferLayout = [
      ...(this.state.columns?.getBufferLayouts() ?? this.getAttributeManager()!.getBufferLayouts()),
      GEOMETRY_BUFFER_LAYOUT
    ];

    const ModelClass = this.state.columns ? GPUVectorModel : DeckGPUVectorModel;
    const fillModel = new ModelClass(this.context.device, {
      ...shaders,
      id: `${this.props.id}-fill`,
      bufferLayout,
      isInstanced: true,
      inferDrawCount: this.state.columns ? 'instance' : 'no'
    });
    const strokeModel = new ModelClass(this.context.device, {
      ...shaders,
      id: `${this.props.id}-stroke`,
      bufferLayout,
      isInstanced: true,
      inferDrawCount: this.state.columns ? 'instance' : 'no'
    });
    const wireframeModel = new ModelClass(this.context.device, {
      ...shaders,
      id: `${this.props.id}-wireframe`,
      bufferLayout,
      isInstanced: true,
      inferDrawCount: this.state.columns ? 'instance' : 'no'
    });

    return {
      fillModel,
      strokeModel,
      wireframeModel,
      models: [wireframeModel, fillModel, strokeModel]
    };
  }

  protected _updateGeometry({diskResolution, vertices, extruded, stroked}) {
    const geometry = this.getGeometry(diskResolution, vertices, extruded || stroked);
    const positionAttribute = geometry.attributes.POSITION;
    const normalAttribute = geometry.attributes.NORMAL;

    // The fill model renders a triangle-strip with degenerate triangles and does not
    // use indices. Give it a separate Geometry without `indices` so that later buffer
    // layout rebuilds (e.g. binary-data transitions, HMR) cannot re-attach the
    // wireframe indices via `_setGeometryAttributes`.
    this._setFillGeometry(
      new Geometry({
        topology: 'triangle-strip',
        attributes: {POSITION: positionAttribute, NORMAL: normalAttribute}
      })
    );

    if (!extruded && stroked) {
      const fillVertexCount = positionAttribute.value.length / 3;
      this._setStrokeGeometry(
        new Geometry({
          topology: 'triangle-strip',
          // remove the cap
          vertexCount: fillVertexCount - diskResolution - 1,
          attributes: {POSITION: positionAttribute, NORMAL: normalAttribute}
        })
      );
    }

    if (extruded) {
      this._setWireframeGeometry(geometry);
    }
  }

  protected _setFillGeometry(geometry: Geometry): void {
    const fillGeometry = makeInterleavedGeometry(geometry, {
      attributes: ['POSITION', 'NORMAL']
    });
    const fillModel = this.state.fillModel!;
    this.setModelGeometry(fillModel, fillGeometry);
  }

  protected _setStrokeGeometry(geometry: Geometry): void {
    const strokeGeometry = makeInterleavedGeometry(geometry, {
      attributes: ['POSITION', 'NORMAL']
    });
    const strokeModel = this.state.strokeModel!;
    this.setModelGeometry(strokeModel, strokeGeometry);
  }

  protected _setWireframeGeometry(geometry: Geometry): void {
    const wireframeGeometry = makeInterleavedGeometry(geometry, {
      attributes: ['POSITION', 'NORMAL']
    });
    const wireframeModel = this.state.wireframeModel!;
    this.setModelGeometry(wireframeModel, wireframeGeometry);
    wireframeModel.setTopology('line-list');
  }

  /** Uploads generated geometry for typed models and retires its previous owned buffers. */
  private setModelGeometry(model: GPUVectorModel, geometry: Geometry): void {
    if (!this.state.columns) {
      (model as DeckGPUVectorModel).setGeometry(geometry);
      return;
    }
    const replacement = makeGPUVectorGeometry(this.context.device, geometry);
    model.setGeometry(replacement);
    this.state.geometries!.get(model)?.destroy();
    this.state.geometries!.set(model, replacement);
  }

  /** Draws aligned chunks with global picking indices and the requested instance limit. */
  protected drawModel(model: GPUVectorModel): void {
    if (!this.state.columns) {
      model.draw(this.context.renderPass);
      return;
    }
    this.state.columns.draw(model, this.context.renderPass, rowIndexOffset => {
      model.setInstanceCount(
        Math.max(0, Math.min(model.instanceCount, this.getNumInstances() - rowIndexOffset))
      );
      model.shaderInputs.setProps({column: {rowIndexOffset}});
    });
  }

  draw({uniforms}) {
    const {
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      radiusUnits,
      elevationScale,
      extruded,
      filled,
      stroked,
      wireframe,
      offset,
      coverage,
      radius,
      angle
    } = this.props;
    const fillModel = this.state.fillModel!;
    const strokeModel = this.state.strokeModel!;
    const wireframeModel = this.state.wireframeModel!;
    const {edgeDistance} = this.state;

    const columnProps: Omit<ColumnProps, 'isStroke'> = {
      radius,
      angle: (angle / 180) * Math.PI,
      offset,
      extruded,
      stroked,
      coverage,
      elevationScale,
      edgeDistance,
      radiusUnits: UNIT[radiusUnits],
      widthUnits: UNIT[lineWidthUnits],
      widthScale: lineWidthScale,
      widthMinPixels: lineWidthMinPixels,
      widthMaxPixels: lineWidthMaxPixels,
      rowIndexOffset: 0
    };

    // When drawing 3d: draw wireframe first so it doesn't get occluded by depth test
    if (extruded && wireframe) {
      wireframeModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      this.drawModel(wireframeModel);
    }

    if (filled) {
      fillModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: false
        }
      });
      this.drawModel(fillModel);
    }
    // When drawing 2d: draw fill before stroke so that the outline is always on top
    if (!extruded && stroked) {
      strokeModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      this.drawModel(strokeModel);
    }
  }
}
