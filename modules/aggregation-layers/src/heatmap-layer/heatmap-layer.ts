// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ArrowAccessor, ArrowAccessorFunction} from '@deck.gl/core';
/* global setTimeout clearTimeout */
import {
  getBounds,
  boundsContain,
  packVertices,
  scaleToAspectRatio,
  getTextureCoordinates
} from './heatmap-layer-utils';
import {
  Buffer,
  DeviceFeature,
  Texture,
  TextureProps,
  TextureFormat,
  TextureFormatColor,
  type VertexFormat
} from '@luma.gl/core';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import {TextureTransform, TextureTransformProps} from '@luma.gl/engine';
import {pixelsToWorld} from '@math.gl/geospatial/web-mercator';
import {
  Accessor,
  AccessorFunction,
  AttributeManager,
  ChangeFlags,
  Color,
  Layer,
  LayerContext,
  LayersList,
  log,
  Position,
  UpdateParameters,
  DefaultProps,
  ProjectUniforms,
  project,
  project32,
  type LayerExtension,
  _deepEqual as deepEqual
} from '@deck.gl/core';
import TriangleLayer from './triangle-layer';
import AggregationLayer, {AggregationLayerProps} from './aggregation-layer';
import {defaultColorRange, packColorRange} from '../common/utils/color-utils';
import weightsVs from './weights-vs.glsl';
import weightsFs from './weights-fs.glsl';
import maxVs from './max-vs.glsl';
import maxFs from './max-fs.glsl';
import maxSource from './max.wgsl';
import weightsSource from './weights.wgsl';
import {
  MaxWeightProps,
  maxWeightUniforms,
  WeightProps,
  weightUniforms
} from './heatmap-layer-uniforms';

/** Recognize ClipExtension without adding an extensions package dependency. */
function isClipExtension(extension: LayerExtension): boolean {
  return (extension.constructor as typeof LayerExtension).extensionName === 'ClipExtension';
}

/** Recognize DataFilterExtension without importing the extensions package. */
function isDataFilterExtension(extension: LayerExtension): boolean {
  return (extension.constructor as typeof LayerExtension).extensionName === 'DataFilterExtension';
}

const RESOLUTION = 2; // (number of common space pixels) / (number texels)
const MAX_WEIGHT_REDUCTION_SIZE = 16;
const TEXTURE_PROPS: TextureProps = {
  format: 'rgba8unorm',
  dimension: '2d',
  width: 1,
  height: 1,
  sampler: {
    minFilter: 'linear',
    magFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
  }
};
const DEFAULT_COLOR_DOMAIN = [0, 0] as const;
const AGGREGATION_MODE = {
  SUM: 0,
  MEAN: 1
};

const defaultProps: DefaultProps<HeatmapLayerProps> = {
  positions: {type: 'object', value: null, optional: true},
  weights: {type: 'array', value: null, optional: true, compare: 1},
  extensionAttributes: {type: 'object', value: null, optional: true, compare: 1},
  getPosition: {type: 'accessor', arrow: 'row', value: (x: any) => x.position},
  getWeight: {type: 'accessor', arrow: 'row', value: 1},
  intensity: {type: 'number', min: 0, value: 1},
  radiusPixels: {type: 'number', min: 1, max: 100, value: 50},
  colorRange: defaultColorRange,
  threshold: {type: 'number', min: 0, max: 1, value: 0.05},
  colorDomain: {type: 'array', value: null, optional: true},
  // 'SUM' or 'MEAN'
  aggregation: 'SUM',
  weightsTextureSize: {type: 'number', min: 128, max: 2048, value: 2048},
  debounceTimeout: {type: 'number', min: 0, max: 1000, value: 500}
};

const FLOAT_TARGET_FEATURES: DeviceFeature[] = [
  'float32-renderable-webgl', // ability to render to float texture
  'texture-blend-float-webgl' // ability to blend when rendering to float texture
];

const DIMENSIONS = {
  data: {
    props: ['radiusPixels']
  }
};

export type HeatmapLayerProps<DataT = unknown> = _HeatmapLayerProps<DataT> &
  AggregationLayerProps<DataT>;

type _HeatmapLayerProps<DataT> = {
  /** Borrowed single-chunk float32x3 positions, bypassing the position accessor.
   * @experimental
   */
  positions?: GPUVector | null;
  /** One borrowed scalar float32 weight vector with the same row count as positions.
   * @experimental
   */
  weights?: readonly GPUVector[] | null;
  /** Borrowed numeric DataFilter values in position row order. @experimental */
  extensionAttributes?: {filterValues?: GPUVector} | null;

  /**
   * Radius of the circle in pixels, to which the weight of an object is distributed.
   *
   * @default 30
   */
  radiusPixels?: number;

  /**
   * Specified as an array of colors [color1, color2, ...].
   *
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   * Custom plain-array entries are 0–1 when Deck normalizedColors is enabled.
   */
  colorRange?: Color[];

  /**
   * Value that is multiplied with the total weight at a pixel to obtain the final weight.
   *
   * @default 1
   */
  intensity?: number;

  /**
   * Ratio of the fading weight to the max weight, between `0` and `1`.
   *
   * For example, `0.1` affects all pixels with weight under 10% of the max.
   *
   * Ignored when `colorDomain` is specified.
   * @default 0.05
   */
  threshold?: number;

  /**
   * Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`].
   *
   * @default null
   */
  colorDomain?: Readonly<[number, number]> | null;

  /**
   * Defines the type of aggregation operation
   *
   * V valid values are 'SUM', 'MEAN'.
   *
   * @default 'SUM'
   */
  aggregation?: 'SUM' | 'MEAN';

  /**
   * Specifies the size of weight texture.
   * @default 2048
   */
  weightsTextureSize?: number;

  /**
   * Interval in milliseconds during which changes to the viewport don't trigger aggregation.
   *
   * @default 500
   */
  debounceTimeout?: number;

  /**
   * Method called to retrieve the position of each object.
   *
   * @default d => d.position
   */
  getPosition?: ArrowAccessorFunction<DataT, Position>;

  /**
   * The weight of each object.
   *
   * @default 1
   */
  getWeight?: ArrowAccessor<DataT, number>;
};

/** Visualizes the spatial distribution of data. */
export default class HeatmapLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends AggregationLayer<DataT, ExtraPropsT & Required<_HeatmapLayerProps<DataT>>> {
  static layerName = 'HeatmapLayer';
  static defaultProps = defaultProps;

  state!: AggregationLayer<DataT>['state'] & {
    /** Whether the current texture was packed from normalized plain arrays. */
    normalizedColorRange?: boolean;
    gpuPositionsLow?: Buffer;
    isWeightMapDirty?: boolean;
    /** Conversion from sum-domain units to weights in the current texture. */
    weightColorScale?: number;
    weightsTexture?: Texture;
    maxWeightsTexture?: Texture;
    colorTexture?: Texture;
    zoom?: number;
    worldBounds?: number[];
    normalizedCommonBounds?: number[];
    updateTimer?: any;
    triPositionBuffer?: Buffer;
    triTexCoordBuffer?: Buffer;
    weightsTransform?: TextureTransform;
    maxWeightTransform?: TextureTransform;
    textureSize: number;
    format: TextureFormat;
    weightsScale: number;
    visibleWorldBounds: number[];
    viewportCorners: number[][];
  } & AggregationLayer<any>['state'];

  getShaders(shaders: any) {
    let modules = [project32];
    if (shaders.modules) {
      modules = [...modules, ...shaders.modules];
    }

    return super.getShaders({...shaders, modules});
  }

  initializeState() {
    super.initializeAggregationLayer(DIMENSIONS);
    this._setupTextureParams();
    this._setupAttributes();
    this._setupResources();
  }

  shouldUpdateState({changeFlags}: UpdateParameters<this>) {
    // Need to be updated when viewport changes
    return changeFlags.somethingChanged;
  }

  /* eslint-disable max-statements,complexity */
  updateState(opts: UpdateParameters<this>) {
    super.updateState(opts);
    this._updateHeatmapState(opts);
  }

  _updateHeatmapState(opts: UpdateParameters<this>) {
    const {props, oldProps} = opts;
    const changeFlags = this._getChangeFlags(opts);
    const clipModeChanged = props['clipByInstance'] !== oldProps['clipByInstance'];
    const clipChanged =
      this.context.device.type === 'webgpu' &&
      (opts.changeFlags.extensionsChanged ||
        (props.extensions.some(isClipExtension) &&
          (clipModeChanged || !deepEqual(props['clipBounds'], oldProps['clipBounds'], 1))));
    const maskPropsChanged =
      props['maskId'] !== oldProps['maskId'] ||
      props['maskInverted'] !== oldProps['maskInverted'] ||
      props['maskByInstance'] !== oldProps['maskByInstance'];

    if (changeFlags.dataChanged || changeFlags.viewportChanged || maskPropsChanged) {
      // if data is changed, do not debounce and immediately update the weight map
      changeFlags.boundsChanged = this._updateBounds(changeFlags.dataChanged || maskPropsChanged);
      this._updateTextureRenderingBounds();
    }

    if (changeFlags.dataChanged || changeFlags.boundsChanged || maskPropsChanged || clipChanged) {
      // Update weight map immediately
      clearTimeout(this.state.updateTimer);
      this.setState({isWeightMapDirty: true, updateTimer: null});

      if (
        changeFlags.dataChanged ||
        (clipChanged && (clipModeChanged || opts.changeFlags.extensionsChanged))
      ) {
        // Recreate weights transform if data changed, as buffer layout may have changed,
        // happens when binary attibutes passed.
        const weightsTransformShaders = this.getShaders({vs: weightsVs, fs: weightsFs});
        this._createWeightsTransform(weightsTransformShaders);
      }
    } else if (changeFlags.viewportZoomChanged) {
      // Update weight map when zoom stops
      this._debouncedUpdateWeightmap();
    }

    const normalized = this.usesNormalizedColors() && props.colorRange !== defaultColorRange;
    if (
      props.colorRange !== oldProps.colorRange ||
      normalized !== this.state.normalizedColorRange
    ) {
      this._updateColorTexture(opts, normalized);
    }

    this.setState({zoom: opts.context.viewport.zoom});
  }

  renderLayers(): LayersList | Layer {
    if (this.state.isWeightMapDirty && !this._hasMaskExtension()) {
      this._updateWeightmap();
    }
    const displayExtensions = this.props.extensions.filter(extension => {
      if (isClipExtension(extension) && this._clipsSourcePoints()) return false;
      if (isDataFilterExtension(extension)) {
        // Update counts from source points after the extension has updated its state.
        extension.draw.call(this, {context: this.context}, extension);
        return false;
      }
      return (
        extension.constructor['extensionName'] !== 'MaskExtension' ||
        this.props['maskByInstance'] === false
      );
    });
    const {weightsTexture, triPositionBuffer, triTexCoordBuffer, maxWeightsTexture, colorTexture} =
      this.state;
    const {updateTriggers, intensity, threshold, aggregation} = this.props;

    const TriangleLayerClass = this.getSubLayerClass('triangle', TriangleLayer);

    return new TriangleLayerClass(
      this.getSubLayerProps({
        id: 'triangle-layer',
        extensions: displayExtensions,
        updateTriggers
      }),
      {
        // position buffer is filled with world coordinates generated from viewport.unproject
        // i.e. LNGLAT if geospatial, CARTESIAN otherwise
        coordinateSystem: 'default',
        // The screen quad comes from the viewport, independently of data transforms.
        coordinateOrigin: [0, 0, 0],
        modelMatrix: null,
        data: {
          attributes: {
            positions: triPositionBuffer,
            texCoords: triTexCoordBuffer
          }
        },
        vertexCount: 4,
        maxTexture: maxWeightsTexture,
        colorTexture,
        aggregationMode: AGGREGATION_MODE[aggregation] || 0,
        weightsTexture,
        intensity,
        threshold,
        getColorDomain: () => this._getColorDomain()
      }
    );
  }

  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    const {
      weightsTransform,
      weightsTexture,
      maxWeightTransform,
      maxWeightsTexture,
      triPositionBuffer,
      triTexCoordBuffer,
      colorTexture,
      updateTimer
    } = this.state;
    weightsTransform?.destroy();
    this.state.gpuPositionsLow?.destroy();
    weightsTexture?.destroy();
    maxWeightTransform?.destroy();
    maxWeightsTexture?.destroy();
    triPositionBuffer?.destroy();
    triTexCoordBuffer?.destroy();
    colorTexture?.destroy();
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
  }

  // PRIVATE

  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }

  _getChangeFlags(opts: UpdateParameters<this>) {
    const changeFlags: Partial<ChangeFlags> & {
      boundsChanged?: boolean;
      viewportZoomChanged?: boolean;
    } = {};
    const {dimensions} = this.state;
    changeFlags.dataChanged =
      ((opts.props.positions !== opts.oldProps.positions ||
        opts.props.weights?.[0] !== opts.oldProps.weights?.[0] ||
        opts.props.extensionAttributes?.filterValues !==
          opts.oldProps.extensionAttributes?.filterValues ||
        opts.props.numInstances !== opts.oldProps.numInstances) &&
        'GPU columns changed') ||
      (opts.changeFlags.projectionChanged && 'projection changed') ||
      // Uniform transforms must regenerate the weight texture even when packed positions stay unchanged.
      ((!deepEqual(opts.props.modelMatrix, opts.oldProps.modelMatrix, 1) ||
        !deepEqual(opts.props.coordinateOrigin, opts.oldProps.coordinateOrigin, 1)) &&
        'position transform changed') ||
      (this.isAttributeChanged() && 'attribute changed') || // if any attribute is changed
      (this.isAggregationDirty(opts, {
        compareAll: true,
        dimension: dimensions.data
      }) &&
        'aggregation is dirty');
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;

    const {zoom} = this.state;
    if (!opts.context.viewport || opts.context.viewport.zoom !== zoom) {
      changeFlags.viewportZoomChanged = true;
    }

    return changeFlags;
  }

  _createTextures() {
    const {textureSize, format} = this.state;

    this.setState({
      weightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: textureSize,
        height: textureSize,
        format
      }),
      maxWeightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: 1,
        height: 1,
        format
      })
    });
  }

  /** Use GPU column length unless an explicit row prefix is supplied. */
  override getNumInstances(): number {
    return this.props.positions && !Number.isFinite(this.props.numInstances)
      ? this.props.positions.length
      : super.getNumInstances();
  }

  /** Borrow GPU columns directly; accessor inputs retain normal attribute updates. */
  protected override _updateAttributes(): void {
    const {positions, weights, extensions} = this.props;
    if (!positions) {
      if (weights || this.props.extensionAttributes?.filterValues)
        throw new Error('Heatmap weights and extension columns require positions');
      super._updateAttributes();
      return;
    }
    if (
      this.context.device.type !== 'webgpu' ||
      extensions.some(
        extension => !isClipExtension(extension) && !isDataFilterExtension(extension)
      ) ||
      this.state.preproject
    ) {
      throw new Error(
        'Heatmap GPU columns require WebGPU, compatible extensions, and compatible coordinates'
      );
    }
    const weight = weights?.[0];
    if (
      weights?.length !== 1 ||
      positions.format !== 'float32x3' ||
      weight?.format !== 'float32' ||
      positions.length !== weight.length ||
      this.getNumInstances() > positions.length
    ) {
      throw new Error('Heatmap requires matching float32x3 positions and float32 weights');
    }
    getGPUVectorData(positions);
    getGPUVectorData(weight);
    this._getBorrowedFilterValues();
    this.updateAttributes({});
  }

  _setupAttributes() {
    const attributeManager = this.getAttributeManager()!;

    if (this.context.device.type === 'webgpu') {
      attributeManager.addInstanced({
        instancePositions: {
          size: 3,
          type: 'float64',
          accessor: 'getPosition',
          // Normalize binary XY positions into the packed XYZ high/low layout WebGPU requires.
          ...this.usePositionTransforms(),
          transform(this: HeatmapLayer, position: Position) {
            // Keep XYZ packing even when source-CRS changes add or remove CPU conversion.
            const transformed =
              this.usePositionTransforms().transform?.call(this, position) || position;
            return [transformed[0], transformed[1], transformed[2] ?? 0];
          }
        },
        instanceWeights: {size: 1, accessor: 'getWeight'}
      });
      this.setState({positionAttributeName: 'instancePositions'});
    } else {
      attributeManager.add({
        positions: {
          size: 3,
          type: 'float64',
          accessor: 'getPosition',
          ...this.usePositionTransforms()
        },
        weights: {size: 1, accessor: 'getWeight'}
      });
      this.setState({positionAttributeName: 'positions'});
    }
  }

  _setupTextureParams() {
    const {device} = this.context;
    const {weightsTextureSize} = this.props;

    const textureSize = Math.min(weightsTextureSize, device.limits.maxTextureDimension2D);
    /** Candidate targets in descending precision. */
    const floatFormats = ['rgba32float', 'rgba16float'] as const;
    const format: TextureFormat =
      floatFormats.find(candidate => {
        /** Check support for accumulation and linear sampling separately. */
        const capabilities = device.getTextureFormatCapabilities(candidate);
        if (!capabilities.render || !capabilities.filter) return false;
        if (device.type === 'webgl' && candidate === 'rgba32float') {
          return FLOAT_TARGET_FEATURES.every(feature => device.features.has(feature));
        }
        return capabilities.blend;
      }) ?? 'rgba8unorm';
    const floatTargetSupport = format !== 'rgba8unorm';
    const weightsScale = floatTargetSupport ? 1 : 1 / 255;
    this.setState({textureSize, format, weightsScale});
    if (!floatTargetSupport) {
      log.warn(
        `HeatmapLayer: ${this.id} rendering to float texture not supported, falling back to low precision format`
      )();
    }
  }

  /** Validate the column consumed by the borrowed input accumulation pass. */
  private _getBorrowedFilterValues() {
    const {positions, extensions, extensionAttributes} = this.props;
    const extension = extensions.find(isDataFilterExtension);
    if (!positions || !extension) return null;

    const {filterSize, categorySize, fp64, countItems} = extension.opts as {
      filterSize?: number;
      categorySize?: number;
      fp64?: boolean;
      countItems?: boolean;
    };
    if (!filterSize || categorySize || fp64 || countItems) {
      throw new Error(
        'Heatmap GPU column filtering requires numeric DataFilter without fp64 or item counting'
      );
    }
    const format = (filterSize === 1 ? 'float32' : `float32x${filterSize}`) as VertexFormat;
    const vector = extensionAttributes?.filterValues;
    if (
      vector?.format !== format ||
      vector.length !== positions.length ||
      !(getGPUVectorData(vector).buffer.usage & Buffer.VERTEX)
    ) {
      throw new Error(
        `Invalid Heatmap filterValues: expected ${format}, one value per position and VERTEX usage`
      );
    }
    return {...getGPUVectorData(vector), format};
  }

  /** Whether ClipExtension filters source points instead of the display quad. */
  private _clipsSourcePoints(): boolean {
    return this.context.device.type === 'webgpu' && this.props['clipByInstance'] !== false;
  }

  /** Create the source weight transform with its current buffer layout and shader plugins. */
  _createWeightsTransform(shaders: {
    vs: string;
    fs?: string;
    modules: any[];
    plugins?: TextureTransformProps['plugins'];
  }) {
    let {weightsTransform} = this.state;
    const {weightsTexture} = this.state;
    const isWebGPU = this.context.device.type === 'webgpu';
    const attributeManager = this.getAttributeManager()!;

    const filterValues = this._getBorrowedFilterValues();
    weightsTransform?.destroy();
    weightsTransform = new TextureTransform(this.context.device, {
      id: `${this.id}-weights-transform`,
      ...shaders,
      source: weightsSource,
      plugins: isWebGPU
        ? shaders.plugins?.filter(plugin => plugin.name !== 'clip-geometry')
        : shaders.plugins,
      bufferLayout: this.props.positions
        ? [
            {
              name: 'instancePositions',
              stepMode: 'instance',
              byteStride: getGPUVectorData(this.props.positions).byteStride,
              attributes: [{attribute: 'instancePositions', format: 'float32x3', byteOffset: 0}]
            },
            {
              name: 'instanceWeights',
              stepMode: 'instance',
              byteStride: getGPUVectorData(this.props.weights![0]).byteStride,
              attributes: [{attribute: 'instanceWeights', format: 'float32', byteOffset: 0}]
            },
            ...(filterValues
              ? [
                  {
                    name: 'filterValues',
                    stepMode: 'instance' as const,
                    byteStride: filterValues.byteStride,
                    attributes: [
                      {attribute: 'filterValues', format: filterValues.format, byteOffset: 0}
                    ]
                  }
                ]
              : []),
            {
              name: 'instancePositions64Low',
              stepMode: 'instance',
              byteStride: 12,
              attributes: [
                {attribute: 'instancePositions64Low', format: 'float32x3', byteOffset: 0}
              ]
            }
          ]
        : attributeManager.getBufferLayouts({isInstanced: isWebGPU}),
      vertexCount: isWebGPU ? 6 : 1,
      ...(isWebGPU
        ? {
            colorAttachmentFormats: [weightsTexture!.format as TextureFormatColor],
            isInstanced: true,
            instanceCount: this.getNumInstances()
          }
        : {}),
      targetTexture: weightsTexture!,
      parameters: {
        depthWriteEnabled: false,
        blend: true,
        blendColorOperation: 'add',
        blendColorSrcFactor: 'one',
        blendColorDstFactor: 'one',
        blendAlphaSrcFactor: 'one',
        blendAlphaDstFactor: 'one'
      },
      topology: isWebGPU ? 'triangle-list' : 'point-list',
      modules: [...shaders.modules, weightUniforms]
    } as TextureTransformProps);

    this.setState({weightsTransform});
  }

  _setupResources() {
    this._createTextures();
    const {device} = this.context;
    const {textureSize, weightsTexture, maxWeightsTexture} = this.state;

    const weightsTransformShaders = this.getShaders({
      vs: weightsVs,
      fs: weightsFs
    });
    this._createWeightsTransform(weightsTransformShaders);

    const maxWeightsTransformShaders = {
      shaderAssembler: this.context.shaderAssembler,
      // Reduction operates on texture values, not projected positions or sizes.
      defines: {USE_EXTERNAL_PROJECTION: false},
      source: maxSource,
      vs: maxVs,
      fs: maxFs,
      modules: [maxWeightUniforms]
    };
    const maxWeightTransform = new TextureTransform(device, {
      id: `${this.id}-max-weights-transform`,
      targetTexture: maxWeightsTexture!,
      targetTextureChannels: 4,
      targetTextureVarying: 'outTexture',
      ...maxWeightsTransformShaders,
      ...(device.type === 'webgpu'
        ? {colorAttachmentFormats: [maxWeightsTexture!.format as TextureFormatColor]}
        : {}),
      vertexCount:
        device.type === 'webgpu'
          ? Math.ceil(textureSize / MAX_WEIGHT_REDUCTION_SIZE) ** 2
          : textureSize * textureSize,
      topology: 'point-list',
      parameters: {
        depthWriteEnabled: false,
        blend: true,
        blendColorOperation: 'max',
        blendAlphaOperation: 'max',
        blendColorSrcFactor: 'one',
        blendColorDstFactor: 'one',
        blendAlphaSrcFactor: 'one',
        blendAlphaDstFactor: 'one'
      }
    } as TextureTransformProps);

    const maxWeightProps: MaxWeightProps = {inTexture: weightsTexture!, textureSize};
    maxWeightTransform.model.shaderInputs.setProps({
      maxWeight: maxWeightProps
    });

    this.setState({
      weightsTexture,
      maxWeightsTexture,
      maxWeightTransform,
      zoom: null,
      triPositionBuffer: device.createBuffer({byteLength: 48}),
      triTexCoordBuffer: device.createBuffer({byteLength: 48})
    });
  }

  // overwrite super class method to update transform model
  updateShaders(shaderOptions) {
    // shader params (modules, injects) changed, update model object
    this._createWeightsTransform({
      vs: weightsVs,
      fs: weightsFs,
      ...shaderOptions
    });
  }

  _updateMaxWeightValue() {
    const {maxWeightTransform} = this.state;

    maxWeightTransform!.run({
      parameters: {viewport: [0, 0, 1, 1]},
      clearColor: [0, 0, 0, 0]
    });
  }

  // Computes world bounds area that needs to be processed for generate heatmap
  _updateBounds(forceUpdate: any = false): boolean {
    const {viewport} = this.context;

    // Unproject all 4 corners of the current screen coordinates into world coordinates (lng/lat)
    // Takes care of viewport has non zero bearing/pitch (i.e axis not aligned with world coordiante system)
    const viewportCorners = [
      [0, 0],
      [viewport.width, 0],
      [0, viewport.height],
      [viewport.width, viewport.height]
    ].map(pixel =>
      (project.isCustomProjection(viewport)
        ? pixelsToWorld(pixel, viewport.pixelUnprojectionMatrix, 0)
        : viewport.unproject(pixel)
      ).map(Math.fround)
    );

    // #1: get world bounds for current viewport extends
    const visibleWorldBounds = getBounds(viewportCorners); // TODO: Change to visible bounds

    const newState: Partial<HeatmapLayer['state']> = {visibleWorldBounds, viewportCorners};
    let boundsChanged = false;

    if (
      forceUpdate ||
      !this.state.worldBounds ||
      !boundsContain(this.state.worldBounds, visibleWorldBounds)
    ) {
      // #2 : convert world bounds to common (Flat) bounds
      // #3 : extend common bounds to match aspect ratio with viewport
      const scaledCommonBounds = this._worldToCommonBounds(visibleWorldBounds);

      // #4 :convert aligned common bounds to world bounds
      const worldBounds = this._commonToWorldBounds(scaledCommonBounds);

      // Clip webmercator projection limits
      if (
        !project.isCustomProjection(viewport) &&
        this.internalState!.packedCrs?.signature === 'WGS84' &&
        this.props.coordinateSystem !== 'lnglat-offsets'
      ) {
        worldBounds[1] = Math.max(worldBounds[1], -85.051129);
        worldBounds[3] = Math.min(worldBounds[3], 85.051129);
        worldBounds[0] = Math.max(worldBounds[0], -360);
        worldBounds[2] = Math.min(worldBounds[2], 360);
      }

      // #5: now convert world bounds to common using Layer's coordiante system and origin
      const normalizedCommonBounds = this._worldToCommonBounds(worldBounds);

      newState.worldBounds = worldBounds;
      newState.normalizedCommonBounds = normalizedCommonBounds;

      boundsChanged = true;
    }
    this.setState(newState);
    return boundsChanged;
  }

  _updateTextureRenderingBounds() {
    // Just render visible portion of the texture
    const {triPositionBuffer, triTexCoordBuffer, normalizedCommonBounds, viewportCorners} =
      this.state;

    const {viewport} = this.context;

    triPositionBuffer!.write(
      packVertices(
        project.isCustomProjection(viewport)
          ? viewportCorners.map(p => viewport.unprojectFlat(p))
          : viewportCorners,
        3
      )
    );

    const textureBounds = viewportCorners.map(p =>
      getTextureCoordinates(
        project.isCustomProjection(viewport) ? p : viewport.projectPosition(p),
        normalizedCommonBounds!
      )
    );
    triTexCoordBuffer!.write(packVertices(textureBounds, 2));
  }

  /** Replace the byte palette texture using the given plain-array color convention. */
  _updateColorTexture(opts: UpdateParameters<this>, normalized: boolean) {
    const {colorRange} = opts.props;
    let {colorTexture} = this.state;
    const colors = packColorRange(colorRange, normalized);

    colorTexture?.destroy();
    colorTexture = this.context.device.createTexture({
      ...TEXTURE_PROPS,
      data: colors,
      width: colorRange.length,
      height: 1
    });
    this.setState({colorTexture, normalizedColorRange: normalized});
  }

  /** Whether weight rendering needs the mask effect to run first. */
  private _hasMaskExtension(): boolean {
    return this.props.extensions.some(
      extension => extension.constructor['extensionName'] === 'MaskExtension'
    );
  }

  /** Runs masked accumulation after the mask pass updates its channels. */
  _updateAggregationMask(mask: Record<string, unknown>, maskChanged: boolean): void {
    if (
      this.state?.weightsTransform &&
      this.state.worldBounds &&
      this._hasMaskExtension() &&
      (maskChanged || this.state.isWeightMapDirty)
    ) {
      const viewport = this.context.viewport;
      this.context.viewport = this.internalState?.viewport || viewport;
      try {
        if (this.state.updateTimer) {
          clearTimeout(this.state.updateTimer);
          this._updateBounds(true);
          this._updateTextureRenderingBounds();
          this.setState({updateTimer: null});
        }
        this._updateWeightmap(mask);
      } finally {
        this.context.viewport = viewport;
      }
    }
  }

  /** Returns the domain in accumulated weight per texel for the display pass. */
  private _getColorDomain(): Readonly<[number, number]> {
    const {colorDomain, aggregation} = this.props;
    if (!colorDomain) return DEFAULT_COLOR_DOMAIN;
    if (aggregation !== 'SUM') return colorDomain;
    const scale = this.state.weightColorScale;
    return scale === undefined
      ? DEFAULT_COLOR_DOMAIN
      : [colorDomain[0] * scale, colorDomain[1] * scale];
  }

  /** Renders source weights and records the scale used by the display layer. */
  _updateWeightmap(mask?: Record<string, unknown>) {
    const {radiusPixels} = this.props;
    const {worldBounds, textureSize, weightsScale, weightsTexture} = this.state;
    const weightsTransform = this.state.weightsTransform!;
    this.state.isWeightMapDirty = false;
    const commonBounds = this._worldToCommonBounds(worldBounds, {useLayerCoordinateSystem: true});
    this.state.weightColorScale =
      (this.context.viewport.distanceScales.metersPerUnit[2] *
        (commonBounds[2] - commonBounds[0]) *
        weightsScale) /
      textureSize;

    const attributeManager = this.getAttributeManager()!;
    const attributes = attributeManager.getAttributes();
    const moduleSettings = this.getModuleSettings();
    if (this.props.positions) {
      const positions = getGPUVectorData(this.props.positions);
      const weights = getGPUVectorData(this.props.weights![0]);
      const filterValues = this._getBorrowedFilterValues();
      const size = Math.max(1, this.getNumInstances()) * 12;
      if (!this.state.gpuPositionsLow || this.state.gpuPositionsLow.byteLength < size) {
        this.state.gpuPositionsLow?.destroy();
        this.state.gpuPositionsLow = this.context.device.createBuffer({
          byteLength: size,
          usage: Buffer.VERTEX | Buffer.COPY_DST
        });
      }
      weightsTransform.model.setAttributes(
        {
          instancePositions: positions.buffer as Buffer,
          instanceWeights: weights.buffer as Buffer,
          instancePositions64Low: this.state.gpuPositionsLow,
          ...(filterValues && {filterValues: filterValues.buffer as Buffer})
        },
        {
          byteOffsets: {
            instancePositions: positions.byteOffset,
            instanceWeights: weights.byteOffset,
            ...(filterValues && {filterValues: filterValues.byteOffset})
          }
        }
      );
    } else {
      this._setModelAttributes(weightsTransform.model, attributes);
    }
    if (this.context.device.type === 'webgpu') {
      const instanceCount = this.getNumInstances();
      weightsTransform.model.setVertexCount(instanceCount > 0 ? 6 : 0);
      weightsTransform.model.setInstanceCount(instanceCount);
    } else {
      weightsTransform.model.setVertexCount(this.getNumInstances());
    }

    const weightProps: WeightProps = {
      radiusPixels,
      commonBounds,
      textureWidth: textureSize,
      weightsScale,
      weightsTexture: weightsTexture!
    };
    const {viewport, devicePixelRatio, coordinateSystem, coordinateOrigin} = moduleSettings;
    const {modelMatrix} = this.props;
    weightsTransform.model.shaderInputs.setProps({
      project: {
        viewport,
        devicePixelRatio,
        modelMatrix,
        coordinateSystem,
        sourceCrs: this.internalState!.sourceCrs,
        coordinateOrigin,
        sizeScale: this.context.layerManager.projectionScaleResources.get(viewport)
      },
      weight: weightProps
    });
    const projectProps = {viewport, coordinateSystem, coordinateOrigin, modelMatrix};
    if (mask) weightsTransform.model.shaderInputs.setProps({mask});
    for (const extension of this.props.extensions) {
      if (isClipExtension(extension) && !this._clipsSourcePoints()) continue;
      const shaderProps = extension.getAggregationShaderProps.call(this, extension, {
        mask,
        project: projectProps
      });
      if (shaderProps) {
        if (shaderProps.mask) {
          const applyMask = this.props['maskByInstance'] !== false;
          Object.assign(shaderProps.mask, {
            maskByInstance: true,
            ...(applyMask ? {} : {enabled: false})
          });
        }
        weightsTransform.model.shaderInputs.setProps(shaderProps);
      }
    }
    weightsTransform.run({
      parameters: {viewport: [0, 0, textureSize, textureSize]},
      clearColor: [0, 0, 0, 0]
    });

    this._updateMaxWeightValue();
  }

  _debouncedUpdateWeightmap(fromTimer = false) {
    let {updateTimer} = this.state;
    const {debounceTimeout} = this.props;

    if (fromTimer) {
      updateTimer = null;
      // update
      this._updateBounds(true);
      this._updateTextureRenderingBounds();
      this.setState({isWeightMapDirty: true});
    } else {
      this.setState({isWeightMapDirty: false});
      clearTimeout(updateTimer);
      updateTimer = setTimeout(this._debouncedUpdateWeightmap.bind(this, true), debounceTimeout);
    }

    this.setState({updateTimer});
  }

  // input: worldBounds: [minLong, minLat, maxLong, maxLat]
  // input: opts.useLayerCoordinateSystem : layers coordiante system is used
  // optput: commonBounds: [minX, minY, maxX, maxY] scaled to fit the current texture
  _worldToCommonBounds(
    worldBounds,
    opts: {useLayerCoordinateSystem?: boolean} = {}
  ): [number, number, number, number] {
    const {useLayerCoordinateSystem = false} = opts;
    const [minLong, minLat, maxLong, maxLat] = worldBounds;
    const {viewport} = this.context;
    const {textureSize} = this.state;
    const {coordinateSystem} = this.props;

    const offsetMode =
      !project.isCustomProjection(viewport) &&
      useLayerCoordinateSystem &&
      (coordinateSystem === 'lnglat-offsets' || coordinateSystem === 'meter-offsets');
    // The weight shader uses offset common coordinates. Match its precision
    // origin without projecting the already-common bounds through the converter.
    const offsetOriginCommon =
      project.isCustomProjection(viewport) && useLayerCoordinateSystem
        ? (project.getUniforms({viewport}) as ProjectUniforms).commonOrigin
        : offsetMode
          ? viewport.projectPosition(this.props.coordinateOrigin)
          : [0, 0];
    const size = (textureSize * RESOLUTION) / viewport.scale;

    let bottomLeftCommon;
    let topRightCommon;

    // Y-axis is flipped between World and Common bounds
    if (project.isCustomProjection(viewport)) {
      bottomLeftCommon = [minLong, minLat, 0];
      topRightCommon = [maxLong, maxLat, 0];
    } else if (useLayerCoordinateSystem && !offsetMode) {
      // Attribute bounds already consumed CPU source conversion and layer transforms.
      const params = this.state.preproject
        ? {
            sourceCrs: this.internalState!.packedCrs!,
            coordinateOrigin: [0, 0, 0] as [number, number, number],
            modelMatrix: null
          }
        : undefined;
      bottomLeftCommon = this.projectPosition([minLong, minLat, 0], params);
      topRightCommon = this.projectPosition([maxLong, maxLat, 0], params);
    } else {
      bottomLeftCommon = viewport.projectPosition([minLong, minLat, 0]);
      topRightCommon = viewport.projectPosition([maxLong, maxLat, 0]);
    }
    // Ignore z component
    return scaleToAspectRatio(
      [
        bottomLeftCommon[0] - offsetOriginCommon[0],
        bottomLeftCommon[1] - offsetOriginCommon[1],
        topRightCommon[0] - offsetOriginCommon[0],
        topRightCommon[1] - offsetOriginCommon[1]
      ],
      size,
      size
    );
  }

  // input commonBounds: [xMin, yMin, xMax, yMax]
  // output worldBounds: [minLong, minLat, maxLong, maxLat]
  _commonToWorldBounds(commonBounds) {
    // Preprojected heatmaps maintain their working bounds entirely in common space.
    if (project.isCustomProjection(this.context.viewport)) return commonBounds.slice();
    const [xMin, yMin, xMax, yMax] = commonBounds;
    const {viewport} = this.context;
    const bottomLeftWorld = viewport.unprojectPosition([xMin, yMin]);
    const topRightWorld = viewport.unprojectPosition([xMax, yMax]);

    return bottomLeftWorld.slice(0, 2).concat(topRightWorld.slice(0, 2));
  }
}
