// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {FixedSizeList, Float, Int} from 'apache-arrow';

import {
  Layer,
  color,
  project32,
  picking,
  UNIT,
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Unit,
  Position,
  ArrowAccessor,
  Color,
  Material,
  DefaultProps,
  _GPUVectorModel as DeckGPUVectorModel
} from '@deck.gl/core';
import {gouraudMaterial} from '@deck.gl/core';
import {GPUVectorModel, GPUVectorGeometry, Geometry, makeGPUVectorGeometry} from '@luma.gl/engine';
import {
  PointCloudLayerColumns,
  hasPointCloudColumns,
  type PointCloudColumnProps
} from './point-cloud-layer-columns';

import {pointCloudUniforms, PointCloudProps} from './point-cloud-layer-uniforms';
import vs from './point-cloud-layer-vertex.glsl';
import fs from './point-cloud-layer-fragment.glsl';
import {shaderWGSL} from './point-cloud-layer.wgsl';

const defaultPosition = (x: any) => x.position;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;
const DEFAULT_NORMAL = [0, 0, 1] as const;

const defaultProps: DefaultProps<PointCloudLayerProps> = {
  sizeUnits: 'pixels',
  pointSize: {type: 'number', min: 0, value: 10}, //  point radius in pixels
  antialiasing: false,

  getPosition: {type: 'accessor', arrow: true, value: defaultPosition},
  getNormal: {type: 'accessor', arrow: true, value: DEFAULT_NORMAL},
  getColor: {type: 'accessor', arrow: true, value: DEFAULT_COLOR},
  positions: {type: 'object', value: null, optional: true},
  normals: {type: 'object', value: null, optional: true},
  colors: {type: 'object', value: null, optional: true},

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
type _PointCloudLayerProps<DataT> = PointCloudColumnProps & {
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
   * When enabled, computes edge coverage in the shader. When disabled, relies on render-target
   * multisampling. Shader-computed coverage can cause artifacts where points overlap.
   * @default false
   * @see https://luma.gl/docs/api-guide/gpu/gpu-antialiasing
   */
  antialiasing?: boolean;

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
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default object => object.position
   */
  getPosition?: ArrowAccessor<DataT, Position, FixedSizeList<Int | Float>>;

  /**
   * The normal of each object, in `[nx, ny, nz]`.
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default [0, 0, 1]
   */
  getNormal?: ArrowAccessor<DataT, Readonly<[number, number, number]>, FixedSizeList<Int | Float>>;

  /**
   * The rgba color is in the format of `[r, g, b, [a]]`
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default [0, 0, 0, 255]
   */
  getColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;
};

/** Render a point cloud with 3D positions, normals and colors. */
export default class PointCloudLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_PointCloudLayerProps<DataT>>
> {
  static layerName = 'PointCloudLayer';
  static defaultProps = defaultProps;

  state!: {
    model?: GPUVectorModel;
    geometry?: GPUVectorGeometry;
    columns?: PointCloudLayerColumns;
  };

  /** Skips the attribute manager for column inputs. */
  protected _getAttributeManager() {
    return hasPointCloudColumns(this.props) ? null : super._getAttributeManager();
  }

  /** Returns source-coordinate bounds from prepared Arrow columns. */
  getBounds(): [number[], number[]] | null {
    return this.state?.columns ? this.state.columns.getBounds() : super.getBounds();
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

  /** Releases owned column and geometry resources. */
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
      modules: [project32, color, gouraudMaterial, picking, pointCloudUniforms]
    });
  }

  initializeState() {
    if (hasPointCloudColumns(this.props)) return;
    this.initializeAccessorAttributes();
  }

  private initializeAccessorAttributes() {
    this.getAttributeManager()!.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
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
    if (hasPointCloudColumns(this.props)) {
      this.updateColumnState(params);
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
    const {changeFlags, props, oldProps} = params;
    super.updateState(params);
    if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
    }
    if (changeFlags.dataChanged) {
      normalizeData(props.data);
    }
  }

  /** Updates the column model and schedules conversion as inputs change. */
  private updateColumnState(params: UpdateParameters<this>): void {
    if (this.props.extensions.length)
      throw new Error('PointCloud Arrow columns do not support extensions');
    if (params.changeFlags.dataChanged) normalizeData(this.props.data);
    const entering = !this.state.columns;
    if (entering) {
      this.internalState!.attributeManager?.finalize();
      this.internalState!.attributeManager = null;
      this.state.columns = new PointCloudLayerColumns(this.context.device);
    }
    if (
      entering ||
      params.changeFlags.extensionsChanged ||
      params.props.antialiasing !== params.oldProps.antialiasing
    ) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
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
          !this.props.positions &&
          this.props.getPosition === defaultPosition &&
          !binary?.getPosition &&
          !binary?.instancePositions
      }
    });
  }

  draw({uniforms}) {
    const {pointSize, sizeUnits} = this.props;
    const model = this.state.model!;
    const pointCloudProps: PointCloudProps = {
      sizeUnits: UNIT[sizeUnits],
      radiusPixels: pointSize,
      rowIndexOffset: 0
    };
    model.shaderInputs.setProps({pointCloud: pointCloudProps});
    if (this.state.columns) {
      this.state.columns.draw(model, this.context.renderPass, offset => {
        model.setInstanceCount(
          Math.min(model.instanceCount, Math.max(0, this.getNumInstances() - offset))
        );
        model.shaderInputs.setProps({pointCloud: {rowIndexOffset: offset}});
      });
    } else model.draw(this.context.renderPass);
  }

  protected _getModel(): GPUVectorModel {
    // a triangle that minimally cover the unit circle
    const positions: number[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
    }

    const geometry = new Geometry({
      topology: 'triangle-list',
      attributes: {positions: new Float32Array(positions)}
    });
    const options = {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout:
        this.state.columns?.getBufferLayouts() ?? this.getAttributeManager()!.getBufferLayouts(),
      isInstanced: true
    };
    this.state.geometry?.destroy();
    this.state.geometry = undefined;
    if (this.state.columns) {
      this.state.geometry = makeGPUVectorGeometry(this.context.device, geometry);
      return new GPUVectorModel(this.context.device, {
        ...options,
        geometry: this.state.geometry,
        inferDrawCount: 'instance'
      });
    }
    return new DeckGPUVectorModel(this.context.device, {...options, geometry});
  }
}
