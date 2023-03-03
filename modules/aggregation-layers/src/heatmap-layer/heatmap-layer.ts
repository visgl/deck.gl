// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

/* global setTimeout clearTimeout */
import GL from '@luma.gl/constants';
import {
  getBounds,
  boundsContain,
  packVertices,
  scaleToAspectRatio,
  getTextureCoordinates,
  getTextureParams
} from './heatmap-layer-utils';
import {
  Buffer,
  Texture2D,
  Transform,
  getParameters,
  withParameters,
  FEATURES,
  hasFeatures
} from '@luma.gl/core';
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
  DefaultProps
} from '@deck.gl/core';
import TriangleLayer from './triangle-layer';
import AggregationLayer, {AggregationLayerProps} from '../aggregation-layer';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import weightsVs from './weights-vs.glsl';
import weightsFs from './weights-fs.glsl';
import vsMax from './max-vs.glsl';
import fsMax from './max-fs.glsl';

const RESOLUTION = 2; // (number of common space pixels) / (number texels)
const TEXTURE_OPTIONS = {
  mipmaps: false,
  parameters: {
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
  },
  dataFormat: GL.RGBA
};
const DEFAULT_COLOR_DOMAIN = [0, 0];
const AGGREGATION_MODE = {
  SUM: 0,
  MEAN: 1
};

const defaultProps: DefaultProps<HeatmapLayerProps> = {
  getPosition: {type: 'accessor', value: x => x.position},
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

const REQUIRED_FEATURES = [
  FEATURES.BLEND_EQUATION_MINMAX, // max weight calculation
  FEATURES.TEXTURE_FLOAT // weight-map as texture
];

const FLOAT_TARGET_FEATURES = [
  FEATURES.COLOR_ATTACHMENT_RGBA32F, // ability to render to float texture
  FEATURES.FLOAT_BLEND // ability to blend when rendering to float texture
];

const DIMENSIONS = {
  data: {
    props: ['radiusPixels']
  }
};

export type HeatmapLayerProps<DataT = any> = _HeatmapLayerProps<DataT> &
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
    supported: boolean;
    colorDomain?: number[];
    isWeightMapDirty?: boolean;
    weightsTexture?: Texture2D;
    zoom?: number;
    worldBounds?: number[];
    normalizedCommonBounds?: number[];
    updateTimer?: any;
    triPositionBuffer?: Buffer;
    triTexCoordBuffer?: Buffer;
  };

  initializeState() {
    const {gl} = this.context;
    if (!hasFeatures(gl, REQUIRED_FEATURES)) {
      this.setState({supported: false});
      log.error(`HeatmapLayer: ${this.id} is not supported on this browser`)();
      return;
    }
    super.initializeAggregationLayer(DIMENSIONS);
    this.setState({supported: true, colorDomain: DEFAULT_COLOR_DOMAIN});
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
    if (!this.state.supported) {
      return;
    }
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
    if (!this.state.supported) {
      return [];
    }
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
        texture: weightsTexture,
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
    weightsTransform?.delete();
    weightsTexture?.delete();
    maxWeightTransform?.delete();
    maxWeightsTexture?.delete();
    triPositionBuffer?.delete();
    triTexCoordBuffer?.delete();
    colorTexture?.delete();
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
  }

  // PRIVATE

  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.gl, {
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
      this.isAttributeChanged() || // if any attribute is changed
      this.isAggregationDirty(opts, {
        compareAll: true,
        dimension: dimensions.data
      });
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;

    const {zoom} = this.state;
    if (!opts.context.viewport || opts.context.viewport.zoom !== zoom) {
      changeFlags.viewportZoomChanged = true;
    }

    return changeFlags;
  }

  _createTextures() {
    const {gl} = this.context;
    const {textureSize, format, type} = this.state;

    this.setState({
      weightsTexture: new Texture2D(gl, {
        width: textureSize,
        height: textureSize,
        format,
        type,
        ...TEXTURE_OPTIONS
      }),
      maxWeightsTexture: new Texture2D(gl, {format, type, ...TEXTURE_OPTIONS}) // 1 X 1 texture,
    });
  }

  _setupAttributes() {
    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {size: 3, type: GL.DOUBLE, accessor: 'getPosition'},
      weights: {size: 1, accessor: 'getWeight'}
    });
    this.setState({positionAttributeName: 'positions'});
  }

  _setupTextureParams() {
    const {gl} = this.context;
    const {weightsTextureSize} = this.props;

    const textureSize = Math.min(weightsTextureSize, getParameters(gl, gl.MAX_TEXTURE_SIZE));
    const floatTargetSupport = hasFeatures(gl, FLOAT_TARGET_FEATURES);
    const {format, type} = getTextureParams({gl, floatTargetSupport});
    const weightsScale = floatTargetSupport ? 1 : 1 / 255;
    this.setState({textureSize, format, type, weightsScale});
    if (!floatTargetSupport) {
      log.warn(
        `HeatmapLayer: ${this.id} rendering to float texture not supported, fallingback to low precession format`
      )();
    }
  }

  getShaders(type) {
    return super.getShaders(
      type === 'max-weights-transform'
        ? {
            vs: vsMax,
            _fs: fsMax
          }
        : {
            vs: weightsVs,
            _fs: weightsFs
          }
    );
  }

  _createWeightsTransform(shaders = {}) {
    const {gl} = this.context;
    let {weightsTransform} = this.state;
    const {weightsTexture} = this.state;
    weightsTransform?.delete();

    weightsTransform = new Transform(gl, {
      id: `${this.id}-weights-transform`,
      elementCount: 1,
      _targetTexture: weightsTexture,
      _targetTextureVarying: 'weightsTexture',
      ...shaders
    });
    this.setState({weightsTransform});
  }

  _setupResources() {
    const {gl} = this.context;
    this._createTextures();
    const {textureSize, weightsTexture, maxWeightsTexture} = this.state;

    const weightsTransformShaders = this.getShaders('weights-transform');
    this._createWeightsTransform(weightsTransformShaders);

    const maxWeightsTransformShaders = this.getShaders('max-weights-transform');
    const maxWeightTransform = new Transform(gl, {
      id: `${this.id}-max-weights-transform`,
      _sourceTextures: {
        inTexture: weightsTexture
      },
      _targetTexture: maxWeightsTexture,
      _targetTextureVarying: 'outTexture',
      ...maxWeightsTransformShaders,
      elementCount: textureSize * textureSize
    });

    this.setState({
      weightsTexture,
      maxWeightsTexture,
      maxWeightTransform,
      zoom: null,
      triPositionBuffer: new Buffer(gl, {
        byteLength: 48,
        accessor: {size: 3}
      }),
      triTexCoordBuffer: new Buffer(gl, {
        byteLength: 48,
        accessor: {size: 2}
      })
    });
  }

  // overwrite super class method to update transform model
  updateShaders(shaderOptions) {
    // sahder params (modules, injects) changed, update model object
    this._createWeightsTransform(shaderOptions);
  }

  _updateMaxWeightValue() {
    const {maxWeightTransform} = this.state;
    maxWeightTransform.run({
      parameters: {
        blend: true,
        depthTest: false,
        blendFunc: [GL.ONE, GL.ONE],
        blendEquation: GL.MAX
      }
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
      viewport.unproject([viewport.width, viewport.height]),
      viewport.unproject([0, viewport.height])
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

    triPositionBuffer.subData(packVertices(viewportCorners, 3));

    const textureBounds = viewportCorners.map(p =>
      getTextureCoordinates(viewport.projectPosition(p), normalizedCommonBounds!)
    );
    triTexCoordBuffer.subData(packVertices(textureBounds, 2));
  }

  _updateColorTexture(opts) {
    const {colorRange} = opts.props;
    let {colorTexture} = this.state;
    const colors = colorRangeToFlatArray(colorRange, false, Uint8Array as any);

    if (colorTexture) {
      colorTexture.setImageData({
        data: colors,
        width: colorRange.length
      });
    } else {
      colorTexture = new Texture2D(this.context.gl, {
        data: colors,
        width: colorRange.length,
        height: 1,
        ...TEXTURE_OPTIONS
      });
    }
    this.setState({colorTexture});
  }

  _updateWeightmap() {
    const {radiusPixels, colorDomain, aggregation} = this.props;
    const {weightsTransform, worldBounds, textureSize, weightsTexture, weightsScale} = this.state;
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

    const uniforms = {
      radiusPixels,
      commonBounds,
      textureWidth: textureSize,
      weightsScale
    };
    // Attribute manager sets data array count as instaceCount on model
    // we need to set that as elementCount on 'weightsTransform'
    weightsTransform.update({
      elementCount: this.getNumInstances()
    });
    // Need to explictly specify clearColor as external context may have modified it
    withParameters(this.context.gl, {clearColor: [0, 0, 0, 0]}, () => {
      weightsTransform.run({
        uniforms,
        parameters: {
          blend: true,
          depthTest: false,
          blendFunc: [GL.ONE, GL.ONE],
          blendEquation: GL.FUNC_ADD
        },
        clearRenderTarget: true,
        attributes: this.getAttributes(),
        moduleSettings: this.getModuleSettings()
      });
    });
    this._updateMaxWeightValue();

    // reset filtering parameters (TODO: remove once luma issue#1193 is fixed)
    weightsTexture.setParameters({
      [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
      [GL.TEXTURE_MIN_FILTER]: GL.LINEAR
    });
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
  _worldToCommonBounds(worldBounds, opts: {useLayerCoordinateSystem?: boolean} = {}) {
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
