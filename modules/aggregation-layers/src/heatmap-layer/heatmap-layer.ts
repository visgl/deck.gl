// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global setTimeout clearTimeout */
import {
  getBounds,
  boundsContain,
  packVertices,
  scaleToAspectRatio,
  getTextureCoordinates
} from './heatmap-layer-utils';
import {Buffer, DeviceFeature, Texture, TextureProps, TextureFormat} from '@luma.gl/core';
import {TextureTransform, TextureTransformProps} from '@luma.gl/engine';
import {
  Accessor,
  AccessorFunction,
  AttributeManager,
  ChangeFlags,
  Color,
  COORDINATE_SYSTEM,
  Layer,
  LayerContext,
  LayersList,
  log,
  Position,
  UpdateParameters,
  DefaultProps,
  project32
} from '@deck.gl/core';
import TriangleLayer from './triangle-layer';
import AggregationLayer, {AggregationLayerProps} from './aggregation-layer';
import {defaultColorRange, colorRangeToFlatArray} from '../common/utils/color-utils';
import weightsVs from './weights-vs.glsl';
import weightsFs from './weights-fs.glsl';
import maxVs from './max-vs.glsl';
import maxFs from './max-fs.glsl';
import {
  MaxWeightProps,
  maxWeightUniforms,
  WeightProps,
  weightUniforms
} from './heatmap-layer-uniforms';

const RESOLUTION = 2; // (number of common space pixels) / (number texels)
const TEXTURE_PROPS: TextureProps = {
  format: 'rgba8unorm',
  mipmaps: false,
  sampler: {
    minFilter: 'linear',
    magFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
  }
};
const DEFAULT_COLOR_DOMAIN = [0, 0];
const AGGREGATION_MODE = {
  SUM: 0,
  MEAN: 1
};

const defaultProps: DefaultProps<HeatmapLayerProps> = {
  getPosition: {type: 'accessor', value: (x: any) => x.position},
  getWeight: {type: 'accessor', value: 1},
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
  colorDomain?: [number, number] | null;

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
  getPosition?: AccessorFunction<DataT, Position>;

  /**
   * The weight of each object.
   *
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;
};

/** Visualizes the spatial distribution of data. */
export default class HeatmapLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends AggregationLayer<DataT, ExtraPropsT & Required<_HeatmapLayerProps<DataT>>> {
  static layerName = 'HeatmapLayer';
  static defaultProps = defaultProps;

  state!: AggregationLayer<DataT>['state'] & {
    colorDomain?: number[];
    isWeightMapDirty?: boolean;
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
  };

  getShaders(shaders: any) {
    let modules = [project32];
    if (shaders.modules) {
      modules = [...modules, ...shaders.modules];
    }

    return super.getShaders({...shaders, modules});
  }

  initializeState() {
    super.initializeAggregationLayer(DIMENSIONS);
    this.setState({colorDomain: DEFAULT_COLOR_DOMAIN});
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

    if (changeFlags.dataChanged || changeFlags.viewportChanged) {
      // if data is changed, do not debounce and immediately update the weight map
      changeFlags.boundsChanged = this._updateBounds(changeFlags.dataChanged);
      this._updateTextureRenderingBounds();
    }

    if (changeFlags.dataChanged || changeFlags.boundsChanged) {
      // Update weight map immediately
      clearTimeout(this.state.updateTimer);
      this.setState({isWeightMapDirty: true});
    } else if (changeFlags.viewportZoomChanged) {
      // Update weight map when zoom stops
      this._debouncedUpdateWeightmap();
    }

    if (props.colorRange !== oldProps.colorRange) {
      this._updateColorTexture(opts);
    }

    if (this.state.isWeightMapDirty) {
      this._updateWeightmap();
    }

    this.setState({zoom: opts.context.viewport.zoom});
  }

  renderLayers(): LayersList | Layer {
    const {
      weightsTexture,
      triPositionBuffer,
      triTexCoordBuffer,
      maxWeightsTexture,
      colorTexture,
      colorDomain
    } = this.state;
    const {updateTriggers, intensity, threshold, aggregation} = this.props;

    const TriangleLayerClass = this.getSubLayerClass('triangle', TriangleLayer);

    return new TriangleLayerClass(
      this.getSubLayerProps({
        id: 'triangle-layer',
        updateTriggers
      }),
      {
        // position buffer is filled with world coordinates generated from viewport.unproject
        // i.e. LNGLAT if geospatial, CARTESIAN otherwise
        coordinateSystem: COORDINATE_SYSTEM.DEFAULT,
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
        colorDomain
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

  _setupAttributes() {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {size: 3, type: 'float64', accessor: 'getPosition'},
      weights: {size: 1, accessor: 'getWeight'}
    });
    this.setState({positionAttributeName: 'positions'});
  }

  _setupTextureParams() {
    const {device} = this.context;
    const {weightsTextureSize} = this.props;

    const textureSize = Math.min(weightsTextureSize, device.limits.maxTextureDimension2D);
    const floatTargetSupport = FLOAT_TARGET_FEATURES.every(feature => device.features.has(feature));
    const format: TextureFormat = floatTargetSupport ? 'rgba32float' : 'rgba8unorm';
    const weightsScale = floatTargetSupport ? 1 : 1 / 255;
    this.setState({textureSize, format, weightsScale});
    if (!floatTargetSupport) {
      log.warn(
        `HeatmapLayer: ${this.id} rendering to float texture not supported, falling back to low precision format`
      )();
    }
  }

  _createWeightsTransform(shaders: {vs: string; fs?: string; modules: any[]}) {
    let {weightsTransform} = this.state;
    const {weightsTexture} = this.state;
    const attributeManager = this.getAttributeManager()!;

    weightsTransform?.destroy();
    weightsTransform = new TextureTransform(this.context.device, {
      id: `${this.id}-weights-transform`,
      bufferLayout: attributeManager.getBufferLayouts(),
      vertexCount: 1,
      targetTexture: weightsTexture!,
      parameters: {
        depthWriteEnabled: false,
        blendColorOperation: 'add',
        blendColorSrcFactor: 'one',
        blendColorDstFactor: 'one',
        blendAlphaSrcFactor: 'one',
        blendAlphaDstFactor: 'one'
      },
      topology: 'point-list',
      ...shaders,
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

    const maxWeightsTransformShaders = this.getShaders({
      vs: maxVs,
      fs: maxFs,
      modules: [maxWeightUniforms]
    });
    const maxWeightTransform = new TextureTransform(device, {
      id: `${this.id}-max-weights-transform`,
      targetTexture: maxWeightsTexture!,
      ...maxWeightsTransformShaders,
      vertexCount: textureSize * textureSize,
      topology: 'point-list',
      parameters: {
        depthWriteEnabled: false,
        blendColorOperation: 'max',
        blendAlphaOperation: 'max',
        blendColorSrcFactor: 'one',
        blendColorDstFactor: 'one',
        blendAlphaSrcFactor: 'one',
        blendAlphaDstFactor: 'one'
      }
    });

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
      viewport.unproject([0, 0]),
      viewport.unproject([viewport.width, 0]),
      viewport.unproject([0, viewport.height]),
      viewport.unproject([viewport.width, viewport.height])
    ].map(p => p.map(Math.fround));

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
      if (this.props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
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

    triPositionBuffer!.write(packVertices(viewportCorners, 3));

    const textureBounds = viewportCorners.map(p =>
      getTextureCoordinates(viewport.projectPosition(p), normalizedCommonBounds!)
    );
    triTexCoordBuffer!.write(packVertices(textureBounds, 2));
  }

  _updateColorTexture(opts) {
    const {colorRange} = opts.props;
    let {colorTexture} = this.state;
    const colors = colorRangeToFlatArray(colorRange, false, Uint8Array as any);

    if (colorTexture && colorTexture?.width === colorRange.length) {
      // TODO(v9): Unclear whether `setSubImageData` is a public API, or what to use if not.
      (colorTexture as any).setTexture2DData({data: colors});
    } else {
      colorTexture?.destroy();
      // @ts-expect-error TODO(ib) - texture API change
      colorTexture = this.context.device.createTexture({
        ...TEXTURE_PROPS,
        data: colors,
        width: colorRange.length,
        height: 1
      });
    }
    this.setState({colorTexture});
  }

  _updateWeightmap() {
    const {radiusPixels, colorDomain, aggregation} = this.props;
    const {worldBounds, textureSize, weightsScale, weightsTexture} = this.state;
    const weightsTransform = this.state.weightsTransform!;
    this.state.isWeightMapDirty = false;

    // convert world bounds to common using Layer's coordiante system and origin
    const commonBounds = this._worldToCommonBounds(worldBounds, {
      useLayerCoordinateSystem: true
    });

    if (colorDomain && aggregation === 'SUM') {
      // scale color domain to weight per pixel
      const {viewport} = this.context;
      const metersPerPixel =
        (viewport.distanceScales.metersPerUnit[2] * (commonBounds[2] - commonBounds[0])) /
        textureSize;
      this.state.colorDomain = colorDomain.map(x => x * metersPerPixel * weightsScale);
    } else {
      this.state.colorDomain = colorDomain || DEFAULT_COLOR_DOMAIN;
    }

    const attributeManager = this.getAttributeManager()!;
    const attributes = attributeManager.getAttributes();
    const moduleSettings = this.getModuleSettings();
    this._setModelAttributes(weightsTransform.model, attributes);
    weightsTransform.model.setVertexCount(this.getNumInstances());

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
      project: {viewport, devicePixelRatio, modelMatrix, coordinateSystem, coordinateOrigin},
      weight: weightProps
    });
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
      useLayerCoordinateSystem &&
      (coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS ||
        coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS);
    const offsetOriginCommon = offsetMode
      ? viewport.projectPosition(this.props.coordinateOrigin)
      : [0, 0];
    const size = (textureSize * RESOLUTION) / viewport.scale;

    let bottomLeftCommon;
    let topRightCommon;

    // Y-axis is flipped between World and Common bounds
    if (useLayerCoordinateSystem && !offsetMode) {
      bottomLeftCommon = this.projectPosition([minLong, minLat, 0]);
      topRightCommon = this.projectPosition([maxLong, maxLat, 0]);
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
    const [xMin, yMin, xMax, yMax] = commonBounds;
    const {viewport} = this.context;
    const bottomLeftWorld = viewport.unprojectPosition([xMin, yMin]);
    const topRightWorld = viewport.unprojectPosition([xMax, yMax]);

    return bottomLeftWorld.slice(0, 2).concat(topRightWorld.slice(0, 2));
  }
}
