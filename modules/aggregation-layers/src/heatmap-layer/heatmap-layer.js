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

/* global setTimeout */
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
  getParameter,
  FEATURES,
  hasFeatures,
  isWebGL2
} from '@luma.gl/core';
import {CompositeLayer, AttributeManager, COORDINATE_SYSTEM, log} from '@deck.gl/core';
import TriangleLayer from './triangle-layer';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import weights_vs from './weights-vs.glsl';
import weights_fs from './weights-fs.glsl';
import vs_max from './max-vs.glsl';

const RESOLUTION = 2; // (number of common space pixels) / (number texels)
const SIZE_2K = 2048;
const ZOOM_DEBOUNCE = 500; // milliseconds
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

const defaultProps = {
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: 1},
  intensity: {type: 'number', min: 0, value: 1},
  radiusPixels: {type: 'number', min: 1, max: 100, value: 30},
  colorRange: defaultColorRange,
  threshold: {type: 'number', min: 0, max: 1, value: 0.05},
  colorDomain: {type: 'array', value: null, optional: true}
};

const REQUIRED_FEATURES = [
  FEATURES.BLEND_EQUATION_MINMAX, // max weight calculation
  FEATURES.TEXTURE_FLOAT // weight-map as texture
  // FEATURES.FLOAT_BLEND, // implictly supported when TEXTURE_FLOAT is supported
];

export default class HeatmapLayer extends CompositeLayer {
  initializeState() {
    const {gl} = this.context;
    if (!hasFeatures(gl, REQUIRED_FEATURES)) {
      this.setState({supported: false});
      log.error(`HeatmapLayer: ${this.id} is not supported on this browser`)();
      return;
    }
    this.setState({supported: true});
    this._setupTextureParams();
    this._setupAttributes();
    this._setupResources();
  }

  shouldUpdateState({changeFlags}) {
    // Need to be updated when viewport changes
    return changeFlags.somethingChanged;
  }

  /* eslint-disable complexity */
  updateState(opts) {
    if (!this.state.supported) {
      return;
    }
    super.updateState(opts);
    const {props, oldProps} = opts;
    const changeFlags = this._getChangeFlags(opts);

    if (changeFlags.viewportChanged) {
      changeFlags.boundsChanged = this._updateBounds();
    }

    if (changeFlags.dataChanged || changeFlags.boundsChanged || changeFlags.uniformsChanged) {
      this._updateWeightmap();
    } else if (changeFlags.viewportZoomChanged) {
      this._debouncedUpdateWeightmap();
    }

    if (props.colorRange !== oldProps.colorRange) {
      this._updateColorTexture(opts);
    }

    if (changeFlags.viewportChanged) {
      this._updateTextureRenderingBounds();
    }

    if (oldProps.colorDomain !== props.colorDomain || changeFlags.viewportChanged) {
      const {viewport} = this.context;
      const {weightsScale} = this.state;
      const domainScale = (viewport ? 1024 / viewport.scale : 1) * weightsScale;
      const colorDomain = props.colorDomain
        ? props.colorDomain.map(x => x * domainScale)
        : DEFAULT_COLOR_DOMAIN;
      if (colorDomain[1] > 0 && weightsScale < 1) {
        // Hack - when low precision texture is used, aggregated weights are in the [0, 1]
        // range. Scale colorDomain to fit.
        const max = Math.min(colorDomain[1], 1);
        colorDomain[0] *= max / colorDomain[1];
        colorDomain[1] = max;
      }
      this.setState({colorDomain});
    }

    this.setState({zoom: opts.context.viewport.zoom});
  }
  /* eslint-enable complexity */

  renderLayers() {
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
    const {updateTriggers, intensity, threshold} = this.props;

    return new TriangleLayer(
      this.getSubLayerProps({
        id: `${this.id}-triangle-layer`,
        updateTriggers
      }),
      {
        id: 'heatmap-triangle-layer',
        data: {
          attributes: {
            positions: triPositionBuffer,
            texCoords: triTexCoordBuffer
          }
        },
        vertexCount: 4,
        maxTexture: maxWeightsTexture,
        colorTexture,
        texture: weightsTexture,
        intensity,
        threshold,
        colorDomain
      }
    );
  }

  finalizeState() {
    super.finalizeState();
    const {
      weightsTransform,
      weightsTexture,
      maxWeightTransform,
      maxWeightsTexture,
      triPositionBuffer,
      triTexCoordBuffer,
      colorTexture
    } = this.state;
    /* eslint-disable no-unused-expressions */
    weightsTransform && weightsTransform.delete();
    weightsTexture && weightsTexture.delete();
    maxWeightTransform && maxWeightTransform.delete();
    maxWeightsTexture && maxWeightsTexture.delete();
    triPositionBuffer && triPositionBuffer.delete();
    triTexCoordBuffer && triTexCoordBuffer.delete();
    colorTexture && colorTexture.delete();
    /* eslint-enable no-unused-expressions */
  }

  // PRIVATE

  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.gl, {
      id: this.props.id,
      stats: this.context.stats
    });
  }

  _getChangeFlags(opts) {
    const {oldProps, props} = opts;
    const changeFlags = {};
    if (this._isDataChanged(opts)) {
      changeFlags.dataChanged = true;
    }
    if (oldProps.radiusPixels !== props.radiusPixels) {
      changeFlags.uniformsChanged = true;
    }
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;

    const {zoom} = this.state;
    if (!opts.context.viewport || opts.context.viewport.zoom !== zoom) {
      changeFlags.viewportZoomChanged = true;
    }

    return changeFlags;
  }

  _getTextures() {
    const {gl} = this.context;
    const {textureSize, format, type} = this.state;

    return {
      weightsTexture: new Texture2D(gl, {
        width: textureSize,
        height: textureSize,
        format,
        type,
        ...TEXTURE_OPTIONS
      }),
      maxWeightsTexture: new Texture2D(gl, {format, type, ...TEXTURE_OPTIONS}) // 1 X 1 texture,
    };
  }

  _isDataChanged({changeFlags}) {
    if (changeFlags.dataChanged) {
      return true;
    }
    if (
      changeFlags.updateTriggersChanged &&
      (changeFlags.updateTriggersChanged.all ||
        changeFlags.updateTriggersChanged.getPosition ||
        changeFlags.updateTriggersChanged.getWeight)
    ) {
      return true;
    }
    return false;
  }

  _setupAttributes() {
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition'},
      weights: {size: 1, accessor: 'getWeight'}
    });
  }

  _setupTextureParams() {
    const {gl} = this.context;
    const textureSize = Math.min(SIZE_2K, getParameter(gl, gl.MAX_TEXTURE_SIZE));
    const floatTargetSupport = hasFeatures(gl, FEATURES.COLOR_ATTACHMENT_RGBA32F);
    const {format, type} = getTextureParams({gl, floatTargetSupport});
    const weightsScale = floatTargetSupport ? 1 : 1 / 255;
    this.setState({textureSize, format, type, weightsScale});
    if (!floatTargetSupport) {
      log.warn(
        `HeatmapLayer: ${
          this.id
        } rendering to float texture not supported, fallingback to low precession format`
      )();
    }
  }

  _setupResources() {
    const {gl} = this.context;
    const {textureSize} = this.state;
    const {weightsTexture, maxWeightsTexture} = this._getTextures();
    const weightsTransform = new Transform(gl, {
      id: `${this.id}-weights-transform`,
      vs: weights_vs,
      _fs: weights_fs,
      modules: ['project32'],
      elementCount: 1,
      _targetTexture: weightsTexture,
      _targetTextureVarying: 'weightsTexture'
    });
    const maxWeightTransform = new Transform(gl, {
      id: `${this.id}-max-weights-transform`,
      _sourceTextures: {
        inTexture: weightsTexture
      },
      _targetTexture: maxWeightsTexture,
      _targetTextureVarying: 'outTexture',
      vs: vs_max,
      elementCount: textureSize * textureSize
    });

    this.setState({
      weightsTexture,
      maxWeightsTexture,
      weightsTransform,
      model: weightsTransform.model,
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
  _updateBounds(forceUpdate = false) {
    const {textureSize} = this.state;
    const {viewport} = this.context;

    // Unproject all 4 corners of the current screen coordinates into world coordinates (lng/lat)
    // Takes care of viewport has non zero bearing/pitch (i.e axis not aligned with world coordiante system)
    const viewportCorners = [
      viewport.unproject([0, 0]),
      viewport.unproject([viewport.width, 0]),
      viewport.unproject([viewport.width, viewport.height]),
      viewport.unproject([0, viewport.height])
    ];

    // #1: get world bounds for current viewport extends
    const visibleWorldBounds = getBounds(viewportCorners); // TODO: Change to visible bounds
    // #2 : convert world bounds to common (Flat) bounds
    const visibleCommonBounds = this._worldToCommonBounds(visibleWorldBounds);

    const newState = {visibleWorldBounds, viewportCorners};
    let boundsChanged = false;

    if (
      forceUpdate ||
      !this.state.worldBounds ||
      !boundsContain(this.state.worldBounds, visibleWorldBounds)
    ) {
      // #3: extend common bounds to match aspect ratio with viewport
      const scaledCommonBounds = scaleToAspectRatio(
        visibleCommonBounds,
        textureSize * RESOLUTION,
        textureSize * RESOLUTION
      );

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
      const normalizedCommonBounds = this._worldToCommonBounds(worldBounds, {
        scaleToAspect: true,
        normalize: true,
        width: textureSize * RESOLUTION,
        height: textureSize * RESOLUTION
      });

      newState.worldBounds = worldBounds;
      newState.normalizedCommonBounds = normalizedCommonBounds;

      boundsChanged = true;
    }
    this.setState(newState);
    return boundsChanged;
  }

  _updateTextureRenderingBounds() {
    // Just render visible portion of the texture
    const {
      triPositionBuffer,
      triTexCoordBuffer,
      normalizedCommonBounds,
      viewportCorners
    } = this.state;

    const {viewport} = this.context;
    const commonBounds = normalizedCommonBounds.map(x => x * viewport.scale);

    triPositionBuffer.subData(packVertices(viewportCorners, 3));

    const textureBounds = viewportCorners.map(p =>
      getTextureCoordinates(viewport.projectPosition(p), commonBounds)
    );
    triTexCoordBuffer.subData(packVertices(textureBounds, 2));
  }

  _updateColorTexture(opts) {
    const {colorRange} = opts.props;
    let {colorTexture} = this.state;
    const colors = colorRangeToFlatArray(colorRange, true);

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
        format: isWebGL2(this.context.gl) ? GL.RGBA32F : GL.RGBA,
        type: GL.FLOAT,
        ...TEXTURE_OPTIONS
      });
    }
    this.setState({colorTexture});
  }

  _updateWeightmap() {
    const {radiusPixels} = this.props;
    const {weightsTransform, worldBounds, textureSize, weightsTexture, weightsScale} = this.state;

    // base Layer class doesn't update attributes for composite layers, hence manually trigger it.
    this._updateAttributes(this.props);

    const moduleParameters = Object.assign(Object.create(this.props), {
      viewport: this.context.viewport,
      pickingActive: 0
    });

    // #5: convert world bounds to common using Layer's coordiante system and origin
    const commonBounds = this._worldToCommonBounds(worldBounds, {
      useLayerCoordinateSystem: true,
      scaleToAspect: true,
      width: textureSize * RESOLUTION,
      height: textureSize * RESOLUTION
    });

    const uniforms = Object.assign({}, weightsTransform.model.getModuleUniforms(moduleParameters), {
      radiusPixels,
      commonBounds,
      textureWidth: textureSize,
      weightsScale
    });
    // Attribute manager sets data array count as instaceCount on model
    // we need to set that as elementCount on 'weightsTransform'
    weightsTransform.update({
      elementCount: this.getNumInstances()
    });
    weightsTransform.run({
      uniforms,
      parameters: {
        blend: true,
        depthTest: false,
        blendFunc: [GL.ONE, GL.ONE],
        blendEquation: GL.FUNC_ADD
      },
      clearRenderTarget: true
    });
    this._updateMaxWeightValue();

    // reset filtering parameters (TODO: remove once luma issue#1193 is fixed)
    weightsTexture.setParameters({
      [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
      [GL.TEXTURE_MIN_FILTER]: GL.LINEAR
    });

    this.setState({lastUpdate: Date.now()});
  }

  _debouncedUpdateWeightmap(fromTimer = false) {
    let {updateTimer} = this.state;
    const timeSinceLastUpdate = Date.now() - this.state.lastUpdate;

    if (fromTimer) {
      updateTimer = null;
    }

    if (timeSinceLastUpdate >= ZOOM_DEBOUNCE) {
      // update
      this._updateBounds(true);
      this._updateWeightmap();
      this._updateTextureRenderingBounds();
    } else if (!updateTimer) {
      updateTimer = setTimeout(
        this._debouncedUpdateWeightmap.bind(this, true),
        ZOOM_DEBOUNCE - timeSinceLastUpdate
      );
    }

    this.setState({updateTimer});
  }

  // input: worldBounds: [minLong, minLat, maxLong, maxLat]
  // input: opts.useLayerCoordinateSystem : layers coordiante system is used
  // optput: commonBounds: [minX, minY, maxX, maxY]
  _worldToCommonBounds(worldBounds, opts = {}) {
    const {useLayerCoordinateSystem = false, scaleToAspect = false, width, height} = opts;
    const [minLong, minLat, maxLong, maxLat] = worldBounds;
    const {viewport} = this.context;

    let topLeftCommon;
    let bottomRightCommon;

    // Y-axis is flipped between World and Common bounds
    if (useLayerCoordinateSystem) {
      topLeftCommon = this.projectPosition([minLong, maxLat, 0]);
      bottomRightCommon = this.projectPosition([maxLong, minLat, 0]);
    } else {
      topLeftCommon = viewport.projectPosition([minLong, maxLat, 0]);
      bottomRightCommon = viewport.projectPosition([maxLong, minLat, 0]);
    }
    // Ignore z component
    let commonBounds = topLeftCommon.slice(0, 2).concat(bottomRightCommon.slice(0, 2));
    if (scaleToAspect) {
      commonBounds = scaleToAspectRatio(commonBounds, width, height);
    }
    if (opts.normalize) {
      commonBounds = commonBounds.map(x => x / viewport.scale);
    }
    return commonBounds;
  }

  // input commonBounds: [xMin, yMin, xMax, yMax]
  // output worldBounds: [minLong, minLat, maxLong, maxLat]
  _commonToWorldBounds(commonBounds) {
    const [xMin, yMin, xMax, yMax] = commonBounds;
    const {viewport} = this.context;
    const topLeftWorld = viewport.unprojectPosition([xMin, yMax]);
    const bottomRightWorld = viewport.unprojectPosition([xMax, yMin]);

    return topLeftWorld.slice(0, 2).concat(bottomRightWorld.slice(0, 2));
  }
}

HeatmapLayer.layerName = 'HeatmapLayer';
HeatmapLayer.defaultProps = defaultProps;
