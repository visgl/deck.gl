// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  ArrowPathRenderer,
  convertArrowPathsToStorage,
  convertArrowPathsToAttribute,
  convertArrowTripsToStorage,
  getArrowVectorByteLength,
  makeArrowFixedSizeListVector,
  convertArrowTemporalToGPUVector,
  loadArrowRecordBatches,
  type ArrowRecordBatchLoadUpdate,
  type ArrowRecordBatchSource,
  type ArrowPathPreparedState
} from '@luma.gl/arrow';
import {type CommandEncoder, type Device} from '@luma.gl/core';
import {GPUVector, type GPUVectorFormat} from '@luma.gl/gpgpu/gpu-data';
import {GPURenderable} from '@luma.gl/experimental/gpu-tables';
import {
  PathAttributeModel,
  PathStorageModel,
  PathTripsStorageModel,
  type PathAttributeModelProps,
  type PathStorageInputProps
} from '@luma.gl/experimental/models';
import * as arrow from 'apache-arrow';
import {
  createArrowLineShaderInputs,
  FS_GLSL,
  PATH_SHADER_LAYOUT,
  PATH_STORAGE_SHADER_LAYOUT,
  STORAGE_WGSL_SHADER,
  TRIPS_STORAGE_WGSL_SHADER,
  VS_GLSL,
  WGSL_SHADER
} from './arrow-line-shaders';
import {supportsVertexStorageBuffers} from '../utils/device-limits';

/** Path rendering path selected by the Arrow path example layer. */
export type ArrowLineRendererModel = 'attribute' | 'storage' | 'trips' | 'auto';
/** Concrete path rendering path after resolving `auto`. */
export type ArrowLineRendererResolvedModel = Exclude<ArrowLineRendererModel, 'auto'>;
/** Source time column mode used by the Arrow path example. */
export type ArrowLineRendererTimeColumn = 'none' | 'xyzm' | 'timestamps';
/** DenseUnion geometry extraction mode used by the example renderer. */
export type ArrowLineRendererMode = 'lines' | 'polygons';
/** GPU-ready Float32 variable-length path coordinate type. */
export type ArrowLineCoordinateType = arrow.List<arrow.FixedSizeList<arrow.Float32>>;
/** CPU Float64 source path coordinate type converted before rendering. */
export type ArrowLineFloat64CoordinateType = arrow.List<arrow.FixedSizeList<arrow.Float64>>;
/**
 * DenseUnion source path coordinate type normalized by the example renderer.
 *
 * Top-level DenseUnion rows are converted one-for-one into prepared list rows so generated
 * segment row indices continue to refer to the full source table row.
 */
export type ArrowLineDenseUnionCoordinateType = arrow.DenseUnion;
/**
 * CPU source path coordinate type accepted by conversion helpers.
 *
 * DenseUnion inputs are accepted at the example renderer boundary and normalized into
 * `List<FixedSizeList<Float32, 4>>` before the core path models prepare GPU vectors.
 */
export type ArrowLineSourceCoordinateType =
  | ArrowLineCoordinateType
  | ArrowLineFloat64CoordinateType
  | ArrowLineDenseUnionCoordinateType;
/** GPU-ready per-vertex relative timestamp type. */
export type ArrowLineTimestampType = arrow.List<arrow.Float32>;
/** CPU source per-vertex absolute timestamp type. */
export type ArrowLineSourceTimestampType = arrow.List<arrow.TimestampMillisecond>;
/** Packed RGBA8 row color type. */
export type ArrowLineRowColorType = arrow.FixedSizeList<arrow.Uint8>;
/** Packed RGBA8 per-vertex color type. */
export type ArrowLineVertexColorType = arrow.List<arrow.FixedSizeList<arrow.Uint8>>;
/** Row or per-vertex path color source type. */
export type ArrowLineColorType = ArrowLineRowColorType | ArrowLineVertexColorType;
/** Concrete luma.gl path models owned by {@link ArrowLineRenderer}. */
export type ArrowLineRendererActiveModel =
  | PathAttributeModel
  | PathStorageModel
  | PathTripsStorageModel;

/** CPU Arrow vectors accepted by Arrow path conversion helpers. */
export type ArrowLineRendererSourceVectors = {
  /** Variable-length path coordinate rows, or DenseUnion rows normalized by this example layer. */
  paths: arrow.Vector<ArrowLineSourceCoordinateType>;
  /** Optional row or per-vertex packed path colors. */
  colors?: arrow.Vector<ArrowLineColorType>;
  /** Optional per-row path widths. */
  widths?: arrow.Vector<arrow.Float32>;
  /** Optional per-vertex absolute timestamp rows. */
  timestamps?: arrow.Vector<ArrowLineSourceTimestampType>;
};

type ArrowLineRendererNormalizedSourceVectors = Omit<ArrowLineRendererSourceVectors, 'paths'> & {
  paths: arrow.Vector<ArrowLineCoordinateType | ArrowLineFloat64CoordinateType>;
};

type DenseUnionNormalizedLines = {
  paths: arrow.Vector<ArrowLineCoordinateType>;
  sourceRowIndexChunks: Int32Array[];
  sourceRowCount: number;
};

type DenseUnionGeometryKind =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'
  | 'GeometryCollection';

/** Prepared GPUVector data consumed by the attribute path model. */
export type ArrowLineAttributeRendererData = {
  /** Resolved model this data was prepared for. */
  model: 'attribute';
  /** GPU path coordinate rows. */
  paths: PathAttributeModelProps['paths'];
  /** Optional GPU row or per-vertex colors. */
  colors?: PathAttributeModelProps['colors'];
  /** Optional GPU per-row widths. */
  widths?: PathAttributeModelProps['widths'];
  /** Optional GPU per-vertex relative timestamps. */
  timestamps?: GPUVector<'vertex-list<float32>'>;
  /** Optional view origins generated during coordinate normalization. */
  viewOrigins?: PathAttributeModelProps['viewOrigins'];
  /** Prepared path state shared by attribute path rendering. */
  pathState: ArrowPathPreparedState;
  /** Global source row index assigned to local path row zero. */
  rowIndexOffset?: number;
  /** Releases all resources owned by this prepared data object. */
  destroy: () => void;
};

/** Prepared GPUVector data consumed by storage-backed path models. */
export type ArrowLineStorageRendererData = {
  /** Resolved model this data was prepared for. */
  model: 'storage' | 'trips';
  /** GPU path coordinate rows. */
  paths: PathStorageInputProps['paths'];
  /** Optional GPU row or per-vertex colors. */
  colors?: PathStorageInputProps['colors'];
  /** Optional GPU per-row widths. */
  widths?: PathStorageInputProps['widths'];
  /** Optional GPU per-vertex relative timestamps. */
  timestamps?: PathStorageInputProps['timestamps'];
  /** Optional view origins generated during coordinate normalization. */
  viewOrigins?: PathStorageInputProps['viewOrigins'];
  /** Global source row index assigned to local path row zero. */
  rowIndexOffset?: number;
  /** Releases all resources owned by this prepared data object. */
  destroy: () => void;
};

/** Prepared GPUVector data consumed by Arrow path models. */
export type ArrowLineRendererData = ArrowLineAttributeRendererData | ArrowLineStorageRendererData;

type ArrowLineRendererInputMetadata = {
  /** Required prepared widths vector for the example metrics and render paths. */
  widths: GPUVector<'float32'>;
  /** Global source row index assigned to local path row zero. */
  rowIndexOffset: number;
  /** Bytes occupied by path coordinate and timestamp Arrow source vectors. */
  pathArrowByteLength: number;
  /** Bytes occupied by style Arrow source vectors. */
  styleArrowByteLength: number;
};

/** Prepared path data plus byte-size metrics shown by the example control panel. */
export type ArrowLineRendererInput =
  | (Omit<ArrowLineAttributeRendererData, 'widths' | 'rowIndexOffset'> &
      ArrowLineRendererInputMetadata)
  | (Omit<ArrowLineStorageRendererData, 'widths' | 'rowIndexOffset'> &
      ArrowLineRendererInputMetadata);

/** CPU Arrow source plus metric metadata used by example data generation helpers. */
export type ArrowLineRendererSourceData = {
  /** Source vectors with required widths included by the example data generator. */
  sourceVectors: ArrowLineRendererSourceVectors & {
    widths: arrow.Vector<arrow.Float32>;
  };
  /** Bytes occupied by path coordinate and timestamp Arrow source vectors. */
  pathArrowByteLength: number;
  /** Bytes occupied by style Arrow source vectors. */
  styleArrowByteLength: number;
  /** CPU time spent building the generated Arrow source vectors. */
  arrowVectorBuildTimeMs?: number;
};

/** Props for converting GPUVector path data from explicit Arrow source vectors. */
export type ArrowLineRendererPrepareDataProps = {
  /** Source Arrow vectors to prepare. */
  sourceVectors: ArrowLineRendererSourceVectors;
  /** Path rendering path. Defaults to `auto`. */
  model?: ArrowLineRendererModel;
  /** Source time column mode. Defaults to `xyzm`. */
  timeColumn?: ArrowLineRendererTimeColumn;
  /** DenseUnion extraction mode. Defaults to `lines`. */
  mode?: ArrowLineRendererMode;
  /** Optional resource id prefix. */
  id?: string;
  /** Global source row index assigned to local path row zero. */
  rowIndexOffset?: number;
};

/** Options for converting one Arrow line source or record-batch group. */
export type ArrowLineRendererConversionOptions = {
  /** Path rendering path. Defaults to `auto`. */
  model?: ArrowLineRendererModel;
  /** Source time column mode. Defaults to `xyzm`. */
  timeColumn?: ArrowLineRendererTimeColumn;
  /** DenseUnion extraction mode. Defaults to `lines`. */
  mode?: ArrowLineRendererMode;
  /** Optional resource id prefix. */
  id?: string;
  /** Global source row index assigned to local path row zero. */
  rowIndexOffset?: number;
};

/** Notification emitted after a line record batch is prepared and appended. */
export type ArrowLineRendererDataBatchUpdate = {
  /** Current retained prepared input for all loaded batches in the active stream. */
  pathInput: ArrowLineRendererInput;
  /** Number of loaded record batches. */
  loadedBatchCount: number;
  /** True for the first batch in a stream. */
  isFirstBatch: boolean;
  /** Result of applying the batch to layer props. */
  setPropsResult: ArrowLineRendererSetPropsResult;
};

/** Result returned by Arrow path layer prop updates. */
export type ArrowLineRendererSetPropsResult = {
  /** True when a new underlying path model was constructed. */
  modelChanged: boolean;
};

/** Public configuration for the Arrow path example layer. */
export type ArrowLineRendererProps = {
  /** Debug label used for generated model resources. */
  id?: string;
  /** Optional Arrow source table, record-batch iterable, or async record-batch iterator. */
  data?: ArrowRecordBatchSource | null;
  /** Path rendering path. */
  model?: ArrowLineRendererModel;
  /** Source time column mode. */
  timeColumn?: ArrowLineRendererTimeColumn;
  /** DenseUnion extraction mode. Defaults to `lines`. */
  mode?: ArrowLineRendererMode;
  /** Current Trips timestamp in relative milliseconds. */
  currentTime?: number;
  /** Trips trail length in relative milliseconds. */
  trailLength?: number;
  /** Constant fallback RGBA path color. */
  color?: [number, number, number, number];
  /** Constant fallback path width. */
  width?: number;
  /** Called after one Arrow record batch has been prepared and appended. */
  onDataBatch?: (update: ArrowLineRendererDataBatchUpdate) => void;
  /** Called when renderer-owned Arrow batch loading fails. */
  onDataError?: (error: unknown) => void;
};

type PreparedArrowLineRendererProps = Omit<
  ArrowLineRendererProps,
  'data' | 'onDataBatch' | 'onDataError'
> & {
  data: ArrowLineRendererData;
};

const DEFAULT_PATH_COLOR: [number, number, number, number] = [199, 219, 245, 235];
const DEFAULT_PATH_WIDTH = 0.0035;
const DEFAULT_PATH_TOPOLOGY = 'triangle-list' as const;
const DEFAULT_PATH_VERTEX_COUNT = 12;
const PATH_STORAGE_VERTEX_STORAGE_BUFFER_COUNT = 6;
const TRIPS_PATH_VERTEX_STORAGE_BUFFER_COUNT = 7;
const DEFAULT_RENDER_PARAMETERS = {
  depthWriteEnabled: false,
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const satisfies Record<string, unknown>;

/** Example layer that renders variable-length Arrow paths through attribute or storage models. */
export class ArrowLineRenderer extends GPURenderable<
  [Parameters<ArrowLineRendererActiveModel['draw']>[0]]
> {
  readonly device: Device;
  readonly shaderInputs = createArrowLineShaderInputs();
  props: ArrowLineRendererProps;
  model: ArrowLineRendererActiveModel | null = null;
  resolvedModel: ArrowLineRendererResolvedModel;
  private preparedPathInputs: ArrowLineRendererInput[] = [];
  private retainedPathInput: ArrowLineRendererInput | null = null;
  private dataLoadVersion = 0;
  private isDestroyed = false;

  constructor(device: Device, props: ArrowLineRendererProps) {
    super();
    this.device = device;
    this.props = props;
    this.resolvedModel = this.resolveModel(props.model ?? 'auto', props.timeColumn ?? 'xyzm');
    if (props.data) {
      this.replaceData(props);
    }
  }

  /**
   * Converts Arrow source vectors for path rendering.
   *
   * DenseUnion path coordinates are normalized to one prepared path row per top-level DenseUnion
   * row. Row-aligned style and timestamp columns remain unchanged.
   */
  static async prepareData(
    device: Device,
    props: ArrowLineRendererPrepareDataProps
  ): Promise<ArrowLineRendererData> {
    return convertArrowLineColumnsToGPUVectors(device, props.sourceVectors, {
      model: props.model,
      timeColumn: props.timeColumn,
      id: props.id,
      mode: props.mode,
      rowIndexOffset: props.rowIndexOffset
    });
  }

  setProps(props: Partial<ArrowLineRendererProps>): ArrowLineRendererSetPropsResult {
    const nextProps = {...this.props, ...props};
    const nextModel = this.resolveModel(nextProps.model ?? 'auto', nextProps.timeColumn ?? 'xyzm');
    const hasDataProp = Object.prototype.hasOwnProperty.call(props, 'data');
    const dataChanged = hasDataProp && props.data !== this.props.data;
    const dataDependentChanged =
      dataChanged ||
      props.model !== undefined ||
      props.timeColumn !== undefined ||
      props.mode !== undefined ||
      nextModel !== this.resolvedModel;
    this.props = nextProps;

    if (props.currentTime !== undefined && this.model instanceof PathTripsStorageModel) {
      this.model.setProps({currentTime: props.currentTime});
    }

    if (!dataDependentChanged) {
      return {modelChanged: false};
    }

    this.replaceData(nextProps, hasDataProp);
    return {modelChanged: true};
  }

  override needsRedraw(): false | string {
    const rendererNeedsRedraw = super.needsRedraw();
    const modelNeedsRedraw = this.model?.needsRedraw() ?? false;
    return rendererNeedsRedraw || modelNeedsRedraw;
  }

  override setNeedsRedraw(reason: string): void {
    super.setNeedsRedraw(reason);
    this.model?.setNeedsRedraw(reason);
  }

  override predraw(commandEncoder: CommandEncoder): void {
    this.model?.predraw(commandEncoder);
  }

  override draw(renderPass: Parameters<ArrowLineRendererActiveModel['draw']>[0]): void {
    this.model?.draw(renderPass);
  }

  destroy(): void {
    this.isDestroyed = true;
    this.dataLoadVersion++;
    const preparedPathInputs = this.preparedPathInputs;
    this.preparedPathInputs = [];
    this.retainedPathInput = null;
    this.model?.destroy();
    this.model = null;
    destroyArrowLineInputs(preparedPathInputs);
  }

  private resolveModel(
    modelKind: ArrowLineRendererModel,
    timeColumn: ArrowLineRendererTimeColumn
  ): ArrowLineRendererResolvedModel {
    return resolveArrowLineRendererModel(this.device, modelKind, timeColumn);
  }

  private setPreparedProps(props: PreparedArrowLineRendererProps): void {
    const nextModel = this.resolveModel(props.model ?? 'auto', props.timeColumn ?? 'xyzm');
    if (props.data.model !== nextModel) {
      throw new Error(
        `ArrowLineRenderer data was prepared for ${props.data.model} but ${nextModel} was selected`
      );
    }
    const previousModel = this.model;
    this.resolvedModel = nextModel;
    this.model = this.createModel(nextModel, props);
    previousModel?.destroy();
  }

  private clearPreparedProps(resolvedModel: ArrowLineRendererResolvedModel): void {
    const previousModel = this.model;
    this.model = null;
    this.resolvedModel = resolvedModel;
    previousModel?.destroy();
  }

  private replaceData(props: ArrowLineRendererProps, hasNewDataSource = true): void {
    this.dataLoadVersion++;
    const dataLoadVersion = this.dataLoadVersion;
    const nextModel = this.resolveModel(props.model ?? 'auto', props.timeColumn ?? 'xyzm');
    const preparedPathInputs = this.preparedPathInputs;
    this.preparedPathInputs = [];
    this.retainedPathInput = null;
    this.clearPreparedProps(nextModel);
    destroyArrowLineInputs(preparedPathInputs);

    if (!props.data || !shouldLoadLineSource(props, hasNewDataSource)) {
      return;
    }

    void this.loadData(props, dataLoadVersion);
  }

  private async loadData(props: ArrowLineRendererProps, dataLoadVersion: number): Promise<void> {
    let setPropsResult: ArrowLineRendererSetPropsResult = {modelChanged: false};
    await loadArrowRecordBatches({
      data: props.data!,
      isActive: () => this.isDataLoadActive(dataLoadVersion),
      prepareBatch: (recordBatch, context) =>
        prepareArrowLineInputFromRecordBatches(this.device, [recordBatch], {
          model: props.model,
          timeColumn: props.timeColumn,
          mode: props.mode ?? 'lines',
          rowIndexOffset: context.rowIndexOffset,
          id: `${props.id ?? 'arrow-lines'}-${context.batchIndex}`
        }),
      appendBatch: pathInput => {
        setPropsResult = this.appendPreparedPathInput(pathInput, props);
      },
      destroyBatch: pathInput => pathInput.destroy(),
      getRowCount: pathInput => pathInput.paths.length,
      getMetrics: () => null,
      onBatch: update => this.handleDataBatch(update, setPropsResult, props),
      onError: props.onDataError
    });
  }

  private appendPreparedPathInput(
    pathInput: ArrowLineRendererInput,
    props: ArrowLineRendererProps
  ): ArrowLineRendererSetPropsResult {
    this.preparedPathInputs.push(pathInput);
    const retainedPathInput = makeRetainedArrowLineInput(this.preparedPathInputs);
    this.retainedPathInput = retainedPathInput;
    this.setPreparedProps({...props, data: retainedPathInput});
    return {modelChanged: true};
  }

  private handleDataBatch(
    update: ArrowRecordBatchLoadUpdate<null, ArrowLineRendererInput>,
    setPropsResult: ArrowLineRendererSetPropsResult,
    props: ArrowLineRendererProps
  ): void {
    const pathInput = this.retainedPathInput;
    if (!pathInput) {
      return;
    }
    props.onDataBatch?.({
      pathInput,
      loadedBatchCount: update.loadedBatchCount,
      isFirstBatch: update.isFirstBatch,
      setPropsResult
    });
  }

  private isDataLoadActive(dataLoadVersion: number): boolean {
    return !this.isDestroyed && dataLoadVersion === this.dataLoadVersion;
  }

  private createModel(
    modelKind: ArrowLineRendererResolvedModel,
    props: PreparedArrowLineRendererProps
  ): ArrowLineRendererActiveModel {
    if (modelKind === 'storage' || modelKind === 'trips') {
      if (props.data.model === 'attribute') {
        throw new Error('ArrowLineRenderer storage models require storage-prepared data');
      }
      const commonProps = getArrowLineCommonModelProps(props, props.data, this.shaderInputs);
      if (modelKind === 'storage') {
        return ArrowPathRenderer.createModel(this.device, {
          model: 'storage',
          ...commonProps,
          color: props.color ?? DEFAULT_PATH_COLOR,
          width: props.width ?? DEFAULT_PATH_WIDTH,
          rowIndexBase: props.data.rowIndexOffset ?? 0,
          source: STORAGE_WGSL_SHADER,
          shaderLayout: PATH_STORAGE_SHADER_LAYOUT
        });
      }

      if (!props.data.timestamps) {
        throw new Error('ArrowLineRenderer trips model requires a timestamps column');
      }
      return ArrowPathRenderer.createModel(this.device, {
        model: 'trips',
        ...commonProps,
        timestamps: props.data.timestamps,
        currentTime: props.currentTime ?? 0,
        trailLength: props.trailLength ?? 0,
        color: props.color ?? DEFAULT_PATH_COLOR,
        width: props.width ?? DEFAULT_PATH_WIDTH,
        rowIndexBase: props.data.rowIndexOffset ?? 0,
        source: TRIPS_STORAGE_WGSL_SHADER,
        shaderLayout: PATH_STORAGE_SHADER_LAYOUT
      });
    }

    if (props.data.model !== 'attribute') {
      throw new Error('ArrowLineRenderer attribute model requires attribute-prepared data');
    }
    const commonProps = getArrowLineCommonModelProps(props, props.data, this.shaderInputs);
    return ArrowPathRenderer.createModel(this.device, {
      model: 'attribute',
      ...commonProps,
      pathState: props.data.pathState,
      source: WGSL_SHADER,
      vs: VS_GLSL,
      fs: FS_GLSL,
      shaderLayout: PATH_SHADER_LAYOUT
    });
  }
}

function getArrowLineCommonModelProps<
  DataT extends ArrowLineAttributeRendererData | ArrowLineStorageRendererData
>(
  props: PreparedArrowLineRendererProps,
  data: DataT,
  shaderInputs: ArrowLineRenderer['shaderInputs']
) {
  return {
    id: props.id,
    paths: data.paths,
    ...(data.colors ? {colors: data.colors} : {}),
    ...(data.widths ? {widths: data.widths} : {}),
    ...(data.viewOrigins ? {viewOrigins: data.viewOrigins} : {}),
    shaderInputs,
    topology: DEFAULT_PATH_TOPOLOGY,
    vertexCount: DEFAULT_PATH_VERTEX_COUNT,
    parameters: DEFAULT_RENDER_PARAMETERS
  };
}

/** Converts Arrow line columns into GPU vectors without adding example metrics. */
export async function convertArrowLineColumnsToGPUVectors(
  device: Device,
  columns: ArrowLineRendererSourceVectors,
  options: ArrowLineRendererConversionOptions = {}
): Promise<ArrowLineRendererData> {
  const sourceVectors = normalizeArrowLineSourceVectors(columns, options.mode ?? 'lines');
  const id = options.id ?? 'arrow-line-renderer';
  const resolvedModel = resolveArrowLineRendererModel(
    device,
    options.model ?? 'auto',
    options.timeColumn ?? 'xyzm'
  );

  if (resolvedModel === 'storage' || resolvedModel === 'trips') {
    const prepared =
      resolvedModel === 'trips'
        ? await convertArrowTripsToStorage(
            device,
            {
              paths: sourceVectors.paths,
              ...(sourceVectors.colors ? {colors: sourceVectors.colors} : {}),
              ...(sourceVectors.widths ? {widths: sourceVectors.widths} : {}),
              ...(sourceVectors.timestamps ? {timestamps: sourceVectors.timestamps} : {})
            },
            {
              id,
              rowIndexBase: options.rowIndexOffset
            }
          )
        : await convertArrowPathsToStorage(
            device,
            {
              paths: sourceVectors.paths,
              ...(sourceVectors.colors ? {colors: sourceVectors.colors} : {}),
              ...(sourceVectors.widths ? {widths: sourceVectors.widths} : {})
            },
            {
              id,
              rowIndexBase: options.rowIndexOffset
            }
          );

    return {
      model: resolvedModel,
      paths: prepared.paths,
      ...(prepared.colors ? {colors: prepared.colors} : {}),
      ...(prepared.widths ? {widths: prepared.widths} : {}),
      ...(prepared.timestamps ? {timestamps: prepared.timestamps} : {}),
      ...(prepared.viewOrigins ? {viewOrigins: prepared.viewOrigins} : {}),
      rowIndexOffset: options.rowIndexOffset ?? 0,
      destroy: prepared.destroy
    };
  }

  const preparedTimestamps = sourceVectors.timestamps
    ? await convertArrowTemporalToGPUVector(device, sourceVectors.timestamps, {
        name: 'timestamps',
        id: `${id}-timestamps`
      })
    : null;
  const prepared = await convertArrowPathsToAttribute(
    device,
    {
      paths: sourceVectors.paths,
      ...(sourceVectors.colors ? {colors: sourceVectors.colors} : {}),
      ...(sourceVectors.widths ? {widths: sourceVectors.widths} : {})
    },
    {
      id,
      rowIndexBase: options.rowIndexOffset
    }
  );

  return {
    model: 'attribute',
    paths: prepared.paths,
    ...(prepared.colors ? {colors: prepared.colors} : {}),
    ...(prepared.widths ? {widths: prepared.widths} : {}),
    ...(preparedTimestamps ? {timestamps: preparedTimestamps.temporal} : {}),
    ...(prepared.viewOrigins ? {viewOrigins: prepared.viewOrigins} : {}),
    pathState: prepared.pathState,
    rowIndexOffset: options.rowIndexOffset ?? 0,
    destroy: () => {
      prepared.destroy();
      preparedTimestamps?.destroy();
    }
  };
}

/** Prepares generated Arrow path source data into the renderer input used by the example. */
export async function prepareArrowLineInput(
  device: Device,
  sourceData: ArrowLineRendererSourceData,
  options: ArrowLineRendererMode | ArrowLineRendererConversionOptions = 'lines'
): Promise<ArrowLineRendererInput> {
  const conversionOptions = normalizeArrowLineRendererConversionOptions(options);
  const {sourceVectors} = sourceData;
  const prepared = await convertArrowLineColumnsToGPUVectors(device, sourceVectors, {
    id: conversionOptions.id ?? 'arrow-lines',
    model: conversionOptions.model,
    timeColumn: conversionOptions.timeColumn,
    mode: conversionOptions.mode,
    rowIndexOffset: conversionOptions.rowIndexOffset
  });
  if (!prepared.widths) {
    throw new Error('Arrow path example expected prepared width GPU vectors');
  }
  if (
    sourceVectors.timestamps &&
    conversionOptions.timeColumn === 'timestamps' &&
    !prepared.timestamps
  ) {
    throw new Error('Arrow path example expected prepared timestamp GPU vectors');
  }

  return {
    ...prepared,
    widths: prepared.widths,
    rowIndexOffset: prepared.rowIndexOffset ?? 0,
    pathArrowByteLength: sourceData.pathArrowByteLength,
    styleArrowByteLength: sourceData.styleArrowByteLength
  };
}

/**
 * Builds a source table from record batches, then prepares it for path rendering.
 *
 * This preserves full-table row identity because each input record-batch row remains one logical
 * path row after DenseUnion normalization.
 */
export async function prepareArrowLineInputFromRecordBatches(
  device: Device,
  recordBatches: arrow.RecordBatch[],
  options: ArrowLineRendererMode | ArrowLineRendererConversionOptions = 'lines'
): Promise<ArrowLineRendererInput> {
  const conversionOptions = normalizeArrowLineRendererConversionOptions(options);
  const sourceTable = new arrow.Table(recordBatches);
  const paths = getRequiredArrowVector<ArrowLineSourceCoordinateType>(sourceTable, 'paths');
  const colors = getOptionalArrowVector<ArrowLineColorType>(sourceTable, 'colors');
  const widths = getRequiredArrowVector<arrow.Float32>(sourceTable, 'widths');
  const timestamps = getOptionalArrowVector<ArrowLineSourceTimestampType>(
    sourceTable,
    'timestamps'
  );

  return prepareArrowLineInput(
    device,
    {
      sourceVectors: {
        paths,
        ...(colors ? {colors} : {}),
        widths,
        ...(timestamps ? {timestamps} : {})
      },
      pathArrowByteLength:
        getArrowVectorByteLength(paths) + (timestamps ? getArrowVectorByteLength(timestamps) : 0),
      styleArrowByteLength:
        (colors ? getArrowVectorByteLength(colors) : 0) + getArrowVectorByteLength(widths)
    },
    conversionOptions
  );
}

function makeRetainedArrowLineInput(
  pathInputs: readonly ArrowLineRendererInput[]
): ArrowLineRendererInput {
  const firstPathInput = pathInputs[0];
  if (!firstPathInput) {
    throw new Error('ArrowLineRenderer retained stream requires at least one prepared path batch');
  }
  if (pathInputs.length === 1) {
    return firstPathInput;
  }
  for (const pathInput of pathInputs) {
    if (pathInput.model !== firstPathInput.model) {
      throw new Error('ArrowLineRenderer retained stream batches must use one prepared model');
    }
  }

  const pathArrowByteLength = pathInputs.reduce(
    (byteLength, pathInput) => byteLength + pathInput.pathArrowByteLength,
    0
  );
  const styleArrowByteLength = pathInputs.reduce(
    (byteLength, pathInput) => byteLength + pathInput.styleArrowByteLength,
    0
  );
  const rowIndexOffset = firstPathInput.rowIndexOffset;

  if (firstPathInput.model === 'attribute') {
    const pathAttributeInputs = pathInputs.filter(
      (pathInput): pathInput is Extract<ArrowLineRendererInput, {model: 'attribute'}> =>
        pathInput.model === 'attribute'
    );
    const paths = makeAggregateGPUVector(
      'paths',
      pathAttributeInputs.map(pathInput => pathInput.paths)
    );
    const colors = makeAggregateOptionalGPUVector(
      'colors',
      pathAttributeInputs,
      pathInput => pathInput.colors
    );
    const widths = makeAggregateRequiredGPUVector(
      'widths',
      pathAttributeInputs,
      pathInput => pathInput.widths
    );
    const timestamps = makeAggregateOptionalGPUVector(
      'timestamps',
      pathAttributeInputs,
      pathInput => pathInput.timestamps
    );
    const viewOrigins = makeAggregateOptionalGPUVector(
      'viewOrigins',
      pathAttributeInputs,
      pathInput => pathInput.viewOrigins
    );
    return {
      model: 'attribute',
      paths,
      ...(colors ? {colors} : {}),
      widths,
      ...(timestamps ? {timestamps} : {}),
      ...(viewOrigins ? {viewOrigins} : {}),
      pathState: makeRetainedPathAttributeState(pathAttributeInputs),
      rowIndexOffset,
      pathArrowByteLength,
      styleArrowByteLength,
      destroy: () => {}
    };
  }

  const pathStorageInputs = pathInputs.filter(
    (pathInput): pathInput is Extract<ArrowLineRendererInput, {model: 'storage' | 'trips'}> =>
      pathInput.model === 'storage' || pathInput.model === 'trips'
  );
  const paths = makeAggregateGPUVector(
    'paths',
    pathStorageInputs.map(pathInput => pathInput.paths)
  );
  const colors = makeAggregateOptionalGPUVector(
    'colors',
    pathStorageInputs,
    pathInput => pathInput.colors
  );
  const widths = makeAggregateRequiredGPUVector(
    'widths',
    pathStorageInputs,
    pathInput => pathInput.widths
  );
  const timestamps = makeAggregateOptionalGPUVector(
    'timestamps',
    pathStorageInputs,
    pathInput => pathInput.timestamps
  );
  const viewOrigins = makeAggregateOptionalGPUVector(
    'viewOrigins',
    pathStorageInputs,
    pathInput => pathInput.viewOrigins
  );
  const firstPathStorageInput = pathStorageInputs[0];
  if (!firstPathStorageInput) {
    throw new Error('ArrowLineRenderer retained stream requires storage path batches');
  }

  return {
    model: firstPathStorageInput.model,
    paths,
    ...(colors ? {colors} : {}),
    widths,
    ...(timestamps ? {timestamps} : {}),
    ...(viewOrigins ? {viewOrigins} : {}),
    rowIndexOffset,
    pathArrowByteLength,
    styleArrowByteLength,
    destroy: () => {}
  };
}

function makeAggregateGPUVector<T extends GPUVectorFormat>(
  name: string,
  vectors: readonly GPUVector<T>[]
): GPUVector<T> {
  const firstVector = vectors[0];
  if (!firstVector) {
    throw new Error(`ArrowLineRenderer cannot aggregate empty ${name} vectors`);
  }
  return new GPUVector({
    type: 'data',
    name,
    ...(firstVector.format ? {format: firstVector.format} : {}),
    dataType: firstVector.dataType,
    data: vectors.flatMap(vector => vector.data),
    stride: firstVector.stride,
    byteStride: firstVector.byteStride,
    rowByteLength: firstVector.rowByteLength,
    bufferLayout: firstVector.bufferLayout,
    ownsData: false
  });
}

function makeAggregateRequiredGPUVector<Input, T extends GPUVectorFormat>(
  name: string,
  pathInputs: readonly Input[],
  getVector: (pathInput: Input) => GPUVector<T>
): GPUVector<T> {
  return makeAggregateGPUVector(name, pathInputs.map(getVector));
}

function makeAggregateOptionalGPUVector<Input, T extends GPUVectorFormat>(
  name: string,
  pathInputs: readonly Input[],
  getVector: (pathInput: Input) => GPUVector<T> | undefined
): GPUVector<T> | undefined {
  const vectors = pathInputs.map(getVector);
  if (vectors.every(vector => vector === undefined)) {
    return undefined;
  }
  const definedVectors = vectors.filter(isDefinedGPUVector);
  if (definedVectors.length !== pathInputs.length) {
    throw new Error(`ArrowLineRenderer retained stream has inconsistent ${name} vectors`);
  }
  return makeAggregateGPUVector(name, definedVectors);
}

function isDefinedGPUVector<T extends GPUVectorFormat>(
  vector: GPUVector<T> | undefined
): vector is GPUVector<T> {
  return vector !== undefined;
}

function shouldLoadLineSource(props: ArrowLineRendererProps, hasNewDataSource: boolean): boolean {
  // Prop-only changes invalidate model-specific prepared paths but do not replay the old source.
  // Callers must pass `data` again, with a fresh iterator when needed, to start a new ingestion.
  return hasNewDataSource || !props.data;
}

function makeRetainedPathAttributeState(
  pathInputs: readonly Extract<ArrowLineRendererInput, {model: 'attribute'}>[]
): ArrowPathPreparedState {
  const segmentTables = pathInputs.map(pathInput => pathInput.pathState.segmentTable);
  const firstSegmentTable = segmentTables[0];
  if (!firstSegmentTable) {
    throw new Error('ArrowLineRenderer cannot aggregate empty attribute path state');
  }

  let segmentStartIndex = 0;
  let rowStartIndex = 0;
  const startIndices = [0];
  const generatedBufferBatches: ArrowPathPreparedState['generatedBufferBatches'] = [];
  const renderBatches: ArrowPathPreparedState['renderBatches'] = [];

  for (const pathInput of pathInputs) {
    const {segmentLayout} = pathInput.pathState.segmentTable;
    for (const startIndex of segmentLayout.startIndices.slice(1)) {
      startIndices.push(startIndex + segmentStartIndex);
    }
    for (const generatedBufferBatch of pathInput.pathState.generatedBufferBatches) {
      generatedBufferBatches.push({
        ...generatedBufferBatch,
        rowStart: generatedBufferBatch.rowStart + rowStartIndex,
        rowEnd: generatedBufferBatch.rowEnd + rowStartIndex,
        recordStart: generatedBufferBatch.recordStart + segmentStartIndex,
        recordEnd: generatedBufferBatch.recordEnd + segmentStartIndex
      });
    }
    for (const renderBatch of pathInput.pathState.renderBatches) {
      renderBatches.push({
        ...renderBatch,
        rowStart: renderBatch.rowStart + rowStartIndex,
        rowEnd: renderBatch.rowEnd + rowStartIndex
      });
    }
    segmentStartIndex += segmentLayout.segmentCount;
    rowStartIndex += pathInput.paths.length;
  }

  const segmentLayout: ArrowPathPreparedState['segmentTable']['segmentLayout'] = {
    startIndices,
    segmentCount: segmentStartIndex,
    segmentStartPositions: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentStartPositions),
      Float32Array
    ),
    segmentEndPositions: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentEndPositions),
      Float32Array
    ),
    segmentPreviousPositions: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentPreviousPositions),
      Float32Array
    ),
    segmentNextPositions: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentNextPositions),
      Float32Array
    ),
    segmentViewOrigins: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentViewOrigins),
      Float32Array
    ),
    segmentFlags: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentFlags),
      Uint32Array
    ),
    segmentStartColors: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentStartColors),
      Uint32Array
    ),
    segmentEndColors: concatTypedArrays(
      segmentTables.map(table => table.segmentLayout.segmentEndColors),
      Uint32Array
    )
  };
  const segmentTable: ArrowPathPreparedState['segmentTable'] = {
    table: new arrow.Table(segmentTables.flatMap(table => table.table.batches)),
    segmentLayout,
    segmentAttributeBuildTimeMs: segmentTables.reduce(
      (timeMs, table) => timeMs + table.segmentAttributeBuildTimeMs,
      0
    ),
    attributeByteLength: segmentTables.reduce(
      (byteLength, table) => byteLength + table.attributeByteLength,
      0
    )
  };
  const firstRenderBatch = renderBatches[0];
  if (!firstRenderBatch) {
    throw new Error('ArrowLineRenderer retained stream requires one attribute render batch');
  }

  return {
    segmentTable,
    segmentLayout,
    expandedPathVertexData: firstRenderBatch.expandedPathVertexData,
    pathViewOriginData: firstRenderBatch.pathViewOriginData,
    renderBatches,
    generatedBufferBatches,
    destroy: () => {}
  };
}

function concatTypedArrays<TypedArray extends Float32Array | Uint32Array>(
  arrays: readonly TypedArray[],
  TypedArrayConstructor: {
    new (length: number): TypedArray;
  }
): TypedArray {
  const length = arrays.reduce((totalLength, array) => totalLength + array.length, 0);
  const result = new TypedArrayConstructor(length);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
}

function destroyArrowLineInputs(pathInputs: readonly ArrowLineRendererInput[] | null): void {
  if (!pathInputs) {
    return;
  }
  for (const pathInput of pathInputs) {
    pathInput.destroy();
  }
}

function normalizeArrowLineRendererConversionOptions(
  options: ArrowLineRendererMode | ArrowLineRendererConversionOptions
): Required<Pick<ArrowLineRendererConversionOptions, 'mode' | 'rowIndexOffset'>> &
  Pick<ArrowLineRendererConversionOptions, 'id' | 'model' | 'timeColumn'> {
  return typeof options === 'string'
    ? {mode: options, rowIndexOffset: 0}
    : {
        mode: options.mode ?? 'lines',
        rowIndexOffset: options.rowIndexOffset ?? 0,
        id: options.id,
        model: options.model,
        timeColumn: options.timeColumn
      };
}

function resolveArrowLineRendererModel(
  device: Device,
  modelKind: ArrowLineRendererModel,
  timeColumn: ArrowLineRendererTimeColumn
): ArrowLineRendererResolvedModel {
  const canUseStorageModel = supportsVertexStorageBuffers(
    device,
    getPathStorageBufferCount(timeColumn)
  );
  if (modelKind === 'auto') {
    if (!canUseStorageModel) {
      return 'attribute';
    }
    return timeColumn === 'timestamps' ? 'trips' : 'storage';
  }
  if (modelKind !== 'attribute' && !canUseStorageModel) {
    return 'attribute';
  }
  if (modelKind === 'storage' && timeColumn === 'timestamps') {
    return 'trips';
  }
  return modelKind;
}

function getPathStorageBufferCount(timeColumn: ArrowLineRendererTimeColumn): number {
  return timeColumn === 'timestamps'
    ? TRIPS_PATH_VERTEX_STORAGE_BUFFER_COUNT
    : PATH_STORAGE_VERTEX_STORAGE_BUFFER_COUNT;
}

function normalizeArrowLineSourceVectors(
  sourceVectors: ArrowLineRendererSourceVectors,
  mode: ArrowLineRendererMode
): ArrowLineRendererNormalizedSourceVectors {
  if (!arrow.DataType.isDenseUnion(sourceVectors.paths.type)) {
    return sourceVectors as ArrowLineRendererNormalizedSourceVectors;
  }
  const normalized = normalizeDenseUnionLineVector(
    sourceVectors.paths as arrow.Vector<ArrowLineDenseUnionCoordinateType>,
    mode
  );
  return {
    ...sourceVectors,
    paths: normalized.paths,
    ...(sourceVectors.colors
      ? {colors: normalizeDenseUnionLineColors(sourceVectors.colors, normalized)}
      : {}),
    ...(sourceVectors.widths
      ? {widths: repeatFloat32Rows(sourceVectors.widths, normalized.sourceRowIndexChunks)}
      : {}),
    ...(sourceVectors.timestamps
      ? {timestamps: normalizeDenseUnionLineTimestamps(sourceVectors.timestamps, normalized)}
      : {})
  };
}

function normalizeDenseUnionLineVector(
  paths: arrow.Vector<ArrowLineDenseUnionCoordinateType>,
  mode: ArrowLineRendererMode
): DenseUnionNormalizedLines {
  const sourceRowIndexChunks: Int32Array[] = [];
  let sourceRowIndexBase = 0;
  const dataChunks = paths.data.map(data => {
    const normalizedData = normalizeDenseUnionLineData(data, mode, sourceRowIndexBase);
    sourceRowIndexBase += data.length;
    sourceRowIndexChunks.push(normalizedData.sourceRowIndices);
    return normalizedData.paths;
  });
  return {paths: new arrow.Vector(dataChunks), sourceRowIndexChunks, sourceRowCount: paths.length};
}

function normalizeDenseUnionLineData(
  data: arrow.Data<ArrowLineDenseUnionCoordinateType>,
  mode: ArrowLineRendererMode,
  sourceRowIndexBase: number
): {paths: arrow.Data<ArrowLineCoordinateType>; sourceRowIndices: Int32Array} {
  const valueOffsets: number[] = [0];
  const values: number[] = [];
  const sourceRowIndices: number[] = [];

  for (let localRowIndex = 0; localRowIndex < data.length; localRowIndex++) {
    appendDenseUnionLineRows({
      data,
      localRowIndex,
      sourceRowIndex: sourceRowIndexBase + localRowIndex,
      mode,
      valueOffsets,
      values,
      sourceRowIndices
    });
  }

  return {
    paths: makePathListData(Int32Array.from(valueOffsets), Float32Array.from(values)),
    sourceRowIndices: Int32Array.from(sourceRowIndices)
  };
}

function appendDenseUnionLineRows(props: {
  data: arrow.Data<ArrowLineDenseUnionCoordinateType>;
  localRowIndex: number;
  sourceRowIndex: number;
  mode: ArrowLineRendererMode;
  valueOffsets: number[];
  values: number[];
  sourceRowIndices: number[];
}): void {
  const {data, localRowIndex, sourceRowIndex, mode, valueOffsets, values, sourceRowIndices} = props;
  const typeIds = data.typeIds as ArrayLike<number>;
  const denseUnionValueOffsets = data.valueOffsets as ArrayLike<number>;
  const denseUnionType = data.type as arrow.DenseUnion & {
    typeIdToChildIndex: Record<number, number | undefined>;
  };
  const dataRowIndex = (data.offset ?? 0) + localRowIndex;
  const typeId = typeIds[dataRowIndex];
  const childIndex = denseUnionType.typeIdToChildIndex[typeId];
  if (childIndex === undefined) {
    throw new Error(`ArrowLineRenderer DenseUnion has unsupported type id ${typeId}`);
  }

  const geometryKind = getDenseUnionGeometryKind(denseUnionType, typeId, childIndex);
  if (!isGeometryKindEnabled(geometryKind, mode)) {
    return;
  }

  const childData = data.children[childIndex];
  const childRowIndex = denseUnionValueOffsets[dataRowIndex];
  if (!childData.getValid(childRowIndex)) {
    return;
  }
  const childValueOffset = (childData.offset ?? 0) + childRowIndex;

  if (geometryKind === 'LineString') {
    appendLineStringRow(childData as arrow.Data<ArrowLineCoordinateType>, childValueOffset, {
      sourceRowIndex,
      closeLine: false,
      valueOffsets,
      values,
      sourceRowIndices
    });
    return;
  }

  if (geometryKind === 'MultiLineString' || geometryKind === 'Polygon') {
    appendNestedLineRows(
      childData as arrow.Data<arrow.List<ArrowLineCoordinateType>>,
      childValueOffset,
      {
        sourceRowIndex,
        closeLine: geometryKind === 'Polygon',
        valueOffsets,
        values,
        sourceRowIndices
      }
    );
    return;
  }

  if (geometryKind === 'MultiPolygon') {
    appendMultiPolygonLineRows(
      childData as arrow.Data<arrow.List<arrow.List<ArrowLineCoordinateType>>>,
      childValueOffset,
      {sourceRowIndex, valueOffsets, values, sourceRowIndices}
    );
  }
}

function appendNestedLineRows(
  data: arrow.Data<arrow.List<ArrowLineCoordinateType>>,
  localRowIndex: number,
  props: {
    sourceRowIndex: number;
    closeLine: boolean;
    valueOffsets: number[];
    values: number[];
    sourceRowIndices: number[];
  }
): void {
  assertDenseUnionChildListData(data, 'nested line rows');
  const lineData = data.children[0] as arrow.Data<ArrowLineCoordinateType>;
  const lineStart = data.valueOffsets[localRowIndex] ?? 0;
  const lineEnd = data.valueOffsets[localRowIndex + 1] ?? lineStart;
  for (let lineIndex = lineStart; lineIndex < lineEnd; lineIndex++) {
    appendLineStringRow(lineData, (lineData.offset ?? 0) + lineIndex, props);
  }
}

function appendMultiPolygonLineRows(
  data: arrow.Data<arrow.List<arrow.List<ArrowLineCoordinateType>>>,
  localRowIndex: number,
  props: {
    sourceRowIndex: number;
    valueOffsets: number[];
    values: number[];
    sourceRowIndices: number[];
  }
): void {
  assertDenseUnionChildListData(data, 'MultiPolygon rows');
  const polygonData = data.children[0] as arrow.Data<arrow.List<ArrowLineCoordinateType>>;
  const polygonStart = data.valueOffsets[localRowIndex] ?? 0;
  const polygonEnd = data.valueOffsets[localRowIndex + 1] ?? polygonStart;
  for (let polygonIndex = polygonStart; polygonIndex < polygonEnd; polygonIndex++) {
    appendNestedLineRows(polygonData, (polygonData.offset ?? 0) + polygonIndex, {
      ...props,
      closeLine: true
    });
  }
}

function appendLineStringRow(
  data: arrow.Data<ArrowLineCoordinateType>,
  localRowIndex: number,
  props: {
    sourceRowIndex: number;
    closeLine: boolean;
    valueOffsets: number[];
    values: number[];
    sourceRowIndices: number[];
  }
): void {
  const {coordinateData, coordinateValues, coordinateComponentCount} =
    getDenseUnionChildCoordinateData(data);
  const pointStart = data.valueOffsets[localRowIndex] ?? 0;
  const pointEnd = data.valueOffsets[localRowIndex + 1] ?? pointStart;
  if (pointEnd <= pointStart) {
    return;
  }

  const lineStartValueCount = props.values.length / 4;
  for (let pointIndex = pointStart; pointIndex < pointEnd; pointIndex++) {
    appendDenseUnionCoordinate(
      props.values,
      coordinateData,
      coordinateValues,
      coordinateComponentCount,
      pointIndex
    );
  }
  if (
    props.closeLine &&
    pointEnd - pointStart >= 2 &&
    !areOutputCoordinatesEqual(props.values, lineStartValueCount, props.values.length / 4 - 1)
  ) {
    props.values.push(
      props.values[lineStartValueCount * 4] ?? 0,
      props.values[lineStartValueCount * 4 + 1] ?? 0,
      props.values[lineStartValueCount * 4 + 2] ?? 0,
      props.values[lineStartValueCount * 4 + 3] ?? 0
    );
  }
  props.valueOffsets.push(props.values.length / 4);
  props.sourceRowIndices.push(props.sourceRowIndex);
}

function appendDenseUnionCoordinate(
  values: number[],
  coordinateData: arrow.Data<arrow.FixedSizeList<arrow.Float32 | arrow.Float64>>,
  coordinateValues: Float32Array | Float64Array,
  coordinateComponentCount: 2 | 3 | 4,
  pointIndex: number
): void {
  const sourceOffset = ((coordinateData.offset ?? 0) + pointIndex) * coordinateComponentCount;
  const x = Number(coordinateValues[sourceOffset] ?? 0);
  const y = Number(coordinateValues[sourceOffset + 1] ?? 0);
  if (coordinateComponentCount === 3) {
    values.push(x, y, 0, Number(coordinateValues[sourceOffset + 2] ?? 0));
    return;
  }
  values.push(
    x,
    y,
    coordinateComponentCount >= 4 ? Number(coordinateValues[sourceOffset + 2] ?? 0) : 0,
    coordinateComponentCount >= 4 ? Number(coordinateValues[sourceOffset + 3] ?? 0) : 0
  );
}

function getDenseUnionChildCoordinateData(
  childPathData: arrow.Data<arrow.List<arrow.FixedSizeList<arrow.Float32 | arrow.Float64>>>
): {
  coordinateData: arrow.Data<arrow.FixedSizeList<arrow.Float32 | arrow.Float64>>;
  coordinateValues: Float32Array | Float64Array;
  coordinateComponentCount: 2 | 3 | 4;
} {
  if (!arrow.DataType.isList(childPathData.type)) {
    throw new Error('ArrowLineRenderer DenseUnion children must be List path rows');
  }
  const coordinateType = childPathData.type.children[0]?.type;
  if (!arrow.DataType.isFixedSizeList(coordinateType)) {
    throw new Error('ArrowLineRenderer DenseUnion path children must contain FixedSizeList rows');
  }
  const coordinateComponentCount = coordinateType.listSize;
  const coordinateValueType = coordinateType.children[0]?.type;
  if (
    (coordinateComponentCount !== 2 &&
      coordinateComponentCount !== 3 &&
      coordinateComponentCount !== 4) ||
    (!(coordinateValueType instanceof arrow.Float32) &&
      !(coordinateValueType instanceof arrow.Float64))
  ) {
    throw new Error(
      'ArrowLineRenderer DenseUnion path children must be List<FixedSizeList<Float32|Float64, 2 | 3 | 4>>'
    );
  }

  const coordinateData = childPathData.children[0] as arrow.Data<
    arrow.FixedSizeList<arrow.Float32 | arrow.Float64>
  >;
  const coordinateValueData = coordinateData.children[0] as
    | arrow.Data<arrow.Float32>
    | arrow.Data<arrow.Float64>;
  const coordinateValues = coordinateValueData.values;
  if (!(coordinateValues instanceof Float32Array) && !(coordinateValues instanceof Float64Array)) {
    throw new Error('ArrowLineRenderer DenseUnion path child values must be Float32 or Float64');
  }
  return {coordinateData, coordinateValues, coordinateComponentCount};
}

function normalizeDenseUnionLineColors(
  colors: arrow.Vector<ArrowLineColorType>,
  normalized: DenseUnionNormalizedLines
): arrow.Vector<ArrowLineColorType> {
  if (arrow.DataType.isFixedSizeList(colors.type)) {
    return repeatRowColorRows(
      colors as arrow.Vector<ArrowLineRowColorType>,
      normalized.sourceRowIndexChunks
    );
  }
  if (isDenseUnionLineRowMappingIdentity(normalized)) {
    return colors;
  }
  throw new Error(
    'ArrowLineRenderer DenseUnion split rows require row colors; vertex colors are only supported when each geometry row produces one line row'
  );
}

function normalizeDenseUnionLineTimestamps(
  timestamps: arrow.Vector<ArrowLineSourceTimestampType>,
  normalized: DenseUnionNormalizedLines
): arrow.Vector<ArrowLineSourceTimestampType> {
  if (isDenseUnionLineRowMappingIdentity(normalized)) {
    return timestamps;
  }
  throw new Error(
    'ArrowLineRenderer DenseUnion split rows do not support separate timestamp lists'
  );
}

function repeatFloat32Rows(
  source: arrow.Vector<arrow.Float32>,
  sourceRowIndexChunks: readonly Int32Array[]
): arrow.Vector<arrow.Float32> {
  const dataChunks = sourceRowIndexChunks.map(sourceRowIndices => {
    const values = new Float32Array(sourceRowIndices.length);
    for (let rowIndex = 0; rowIndex < sourceRowIndices.length; rowIndex++) {
      values[rowIndex] = Number(source.get(sourceRowIndices[rowIndex] ?? 0) ?? 0);
    }
    return arrow.makeData({
      type: new arrow.Float32(),
      length: values.length,
      data: values
    }) as arrow.Data<arrow.Float32>;
  });
  return new arrow.Vector(dataChunks);
}

function repeatRowColorRows(
  source: arrow.Vector<ArrowLineRowColorType>,
  sourceRowIndexChunks: readonly Int32Array[]
): arrow.Vector<ArrowLineRowColorType> {
  const dataChunks = sourceRowIndexChunks.map(sourceRowIndices => {
    const values = new Uint8Array(sourceRowIndices.length * 4);
    for (let rowIndex = 0; rowIndex < sourceRowIndices.length; rowIndex++) {
      const color = source.get(sourceRowIndices[rowIndex] ?? 0);
      if (!isVectorLike(color) || color.length !== 4) {
        throw new Error('ArrowLineRenderer row colors must be FixedSizeList<Uint8, 4>');
      }
      const valueOffset = rowIndex * 4;
      values[valueOffset] = Number(color.get(0) ?? 0);
      values[valueOffset + 1] = Number(color.get(1) ?? 0);
      values[valueOffset + 2] = Number(color.get(2) ?? 0);
      values[valueOffset + 3] = Number(color.get(3) ?? 0);
    }
    return makeArrowFixedSizeListVector(new arrow.Uint8(), 4, values)
      .data[0] as arrow.Data<ArrowLineRowColorType>;
  });
  return new arrow.Vector(dataChunks);
}

function isDenseUnionLineRowMappingIdentity(normalized: DenseUnionNormalizedLines): boolean {
  let outputRowIndex = 0;
  for (const sourceRowIndices of normalized.sourceRowIndexChunks) {
    for (const sourceRowIndex of sourceRowIndices) {
      if (sourceRowIndex !== outputRowIndex) {
        return false;
      }
      outputRowIndex++;
    }
  }
  return outputRowIndex === normalized.sourceRowCount;
}

function getDenseUnionGeometryKind(
  denseUnionType: arrow.DenseUnion,
  typeId: number,
  childIndex: number
): DenseUnionGeometryKind {
  const childName = denseUnionType.children[childIndex]?.name.toLowerCase().replace(/[^a-z]/g, '');
  if (childName?.includes('multilinestring')) {
    return 'MultiLineString';
  }
  if (childName?.includes('linestring')) {
    return 'LineString';
  }
  if (childName?.includes('multipolygon')) {
    return 'MultiPolygon';
  }
  if (childName?.includes('polygon')) {
    return 'Polygon';
  }
  return getGeoArrowGeometryKindFromTypeId(typeId);
}

function getGeoArrowGeometryKindFromTypeId(typeId: number): DenseUnionGeometryKind {
  switch (typeId % 10) {
    case 1:
      return 'Point';
    case 2:
      return 'LineString';
    case 3:
      return 'Polygon';
    case 4:
      return 'MultiPoint';
    case 5:
      return 'MultiLineString';
    case 6:
      return 'MultiPolygon';
    case 7:
      return 'GeometryCollection';
    default:
      throw new Error(`ArrowLineRenderer DenseUnion has unsupported GeoArrow type id ${typeId}`);
  }
}

function isGeometryKindEnabled(
  geometryKind: DenseUnionGeometryKind,
  mode: ArrowLineRendererMode
): boolean {
  return mode === 'polygons'
    ? geometryKind === 'Polygon' || geometryKind === 'MultiPolygon'
    : geometryKind === 'LineString' || geometryKind === 'MultiLineString';
}

function assertDenseUnionChildListData(data: arrow.Data, label: string): void {
  if (!arrow.DataType.isList(data.type)) {
    throw new Error(`ArrowLineRenderer DenseUnion ${label} must use List nesting`);
  }
}

function areOutputCoordinatesEqual(
  values: number[],
  firstPointIndex: number,
  secondPointIndex: number
): boolean {
  const firstOffset = firstPointIndex * 4;
  const secondOffset = secondPointIndex * 4;
  return (
    values[firstOffset] === values[secondOffset] &&
    values[firstOffset + 1] === values[secondOffset + 1] &&
    values[firstOffset + 2] === values[secondOffset + 2] &&
    values[firstOffset + 3] === values[secondOffset + 3]
  );
}

function isVectorLike(value: unknown): value is {
  length: number;
  get: (index: number) => unknown;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'length' in value &&
    'get' in value &&
    typeof (value as {get?: unknown}).get === 'function'
  );
}

function makePathListData(
  valueOffsets: Int32Array,
  values: Float32Array
): arrow.Data<ArrowLineCoordinateType> {
  const coordinateData = makeArrowFixedSizeListVector(new arrow.Float32(), 4, values)
    .data[0] as arrow.Data<arrow.FixedSizeList<arrow.Float32>>;
  const pathType = new arrow.List(new arrow.Field('coordinates', coordinateData.type, false));
  return new arrow.Data(
    pathType,
    0,
    valueOffsets.length - 1,
    0,
    {[arrow.BufferType.OFFSET]: valueOffsets},
    [coordinateData]
  ) as arrow.Data<ArrowLineCoordinateType>;
}

function getRequiredArrowVector<T extends arrow.DataType>(
  table: arrow.Table,
  columnName: string
): arrow.Vector<T> {
  const vector = table.getChild(columnName);
  if (!vector) {
    throw new Error(`ArrowLineRenderer data is missing Arrow column "${columnName}"`);
  }
  return vector as arrow.Vector<T>;
}

function getOptionalArrowVector<T extends arrow.DataType>(
  table: arrow.Table,
  columnName: string
): arrow.Vector<T> | undefined {
  const vector = table.getChild(columnName);
  return vector ? (vector as arrow.Vector<T>) : undefined;
}
