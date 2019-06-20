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

import GL from '@luma.gl/constants';
import {
  boundsContain,
  getTriangleVertices,
  parseData,
  scaleToAspectRatio,
  scaleTextureCoordiantes
} from './heatmap-layer-utils';
import {Buffer, Transform, getParameter, isWebGL2} from '@luma.gl/core';
import {CompositeLayer, log} from '@deck.gl/core';
import TriangleLayer from './triangle-layer';
import {getFloatTexture} from '../utils/resource-utils';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import weights_vs from './weights-vs.glsl';
import weights_fs from './weights-fs.glsl';
import vs_max from './max-vs.glsl';

const RESOLUTION = 2; // (number of common space pixels) / (number texels)
const SIZE_2K = 2048;

const defaultProps = {
  getPosition: {type: 'accessor', value: x => x.position},
  getWeight: {type: 'accessor', value: x => 1},
  intensity: {type: 'number', min: 0, max: 1, value: 1},
  radiusPixels: {type: 'number', min: 1, max: 100, value: 30},
  colorRange: defaultColorRange,
  enhanceFactor: {type: 'number', min: 1, max: 100, value: 20}
};

export default class HeatmapLayer extends CompositeLayer {
  initializeState() {
    const {gl} = this.context;
    if (!isWebGL2(gl)) {
      log.error('HeatmapLayer is not supported on this browser, requires WebGL2')();
    }
    const textureSize = Math.min(SIZE_2K, getParameter(gl, gl.MAX_TEXTURE_SIZE));
    const weightsTexture = getFloatTexture(gl, {
      width: textureSize,
      height: textureSize,
      parameters: {
        [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
        [GL.TEXTURE_MIN_FILTER]: GL.LINEAR
      }
    });
    const maxWeightsTexture = getFloatTexture(gl); // 1 X 1 texture
    this.state = {
      textureSize,
      weightsTexture,
      maxWeightsTexture,
      weightsTransform: new Transform(gl, {
        id: `${this.id}-weights-transform`,
        vs: weights_vs,
        _fs: weights_fs,
        modules: ['project32'],
        elementCount: 1,
        _targetTexture: weightsTexture,
        _targetTextureVarying: 'weightsTexture'
      }),
      maxWeightTransform: new Transform(gl, {
        id: `${this.id}-max-weights-transform`,
        _sourceTextures: {
          inTexture: weightsTexture
        },
        _targetTexture: maxWeightsTexture,
        _targetTextureVarying: 'outTexture',
        vs: vs_max,
        elementCount: textureSize * textureSize
      }),
      zoom: null,
      triPositionBuffer: new Buffer(gl, {
        data: getTriangleVertices({xMin: -1, yMin: -1, xMax: 1, yMax: 1, addZ: true}),
        accessor: {size: 3}
      }),
      triTexCoordBuffer: new Buffer(gl, {
        data: getTriangleVertices(),
        accessor: {size: 2}
      })
    };
  }

  shouldUpdateState({changeFlags}) {
    // Need to be updated when viewports
    return changeFlags.somethingChanged;
  }

  // returns visible world bounds [[minLong, minLat], [maxLong, maxLat]
  getVisibleWorldBounds() {
    const {textureSize} = this.state;
    const width = textureSize;
    const height = textureSize;

    // Unproject all 4 corners of the current screen coordiantes into world coordiantes (lng/lat)
    // Takes care of viewport has non zero bearing/pitch (i.e axis not aligned with world coordiante system)
    const topLeft = this.unproject([0, 0]);
    const topRight = this.unproject([width, 0]);
    const bottomLeft = this.unproject([0, height]);
    const bottomRight = this.unproject([width, height]);

    // Now build bounding box in world space (aligned to world coordiante system)
    const minLong = Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
    const maxLong = Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
    const minLat = Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);
    const maxLat = Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);

    return [[minLong, minLat], [maxLong, maxLat]];
  }

  // input: worldBounds: [[minLong, minLat], [maxLong, maxLat]]
  // input: opts.useLayerCoordinateSystem : layers coordiante system is used
  // optput: commonBounds: [[minX, minY], [maxX, maxY]]
  worldToCommonBounds(worldBounds, opts = {}) {
    const {useLayerCoordinateSystem = false, scaleToAspect = false, width, height} = opts;
    const [[minLong, minLat], [maxLong, maxLat]] = worldBounds;
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
    let commonBounds = [topLeftCommon.slice(0, 2), bottomRightCommon.slice(0, 2)];
    if (scaleToAspect) {
      commonBounds = scaleToAspectRatio(commonBounds, width, height);
    }
    return commonBounds;
  }

  // input commonBounds: [[xMin, yMin], [xMax, yMax]]
  // output worldBounds: [[minLong, minLat], [maxLong, maxLat]]
  commonToWorldBounds(commonBounds) {
    const [[xMin, yMin], [xMax, yMax]] = commonBounds;
    const {viewport} = this.context;
    const topLeftWorld = viewport.unprojectPosition([xMin, yMax]);
    const bottomRightWorld = viewport.unprojectPosition([xMax, yMin]);

    return [topLeftWorld.slice(0, 2), bottomRightWorld.slice(0, 2)];
  }

  // Computes world bounds area that needs to be processed for generate heatmap
  updateBounds(forceUpdate = false) {
    const {triPositionBuffer, textureSize} = this.state;
    const width = textureSize;
    const height = textureSize;
    // #1: get world bounds for current viewport extends
    const visibleWorldBounds = this.getVisibleWorldBounds(); // TODO: Change to visible bounds
    // #2 : convert world bounds to common (Flat) bounds
    const visibleCommonBounds = this.worldToCommonBounds(visibleWorldBounds);

    const newState = {visibleWorldBounds, visibleCommonBounds};
    let boundsChanged = false;

    if (
      forceUpdate ||
      !this.state.worldBounds ||
      !boundsContain(this.state.worldBounds, visibleWorldBounds)
    ) {
      // #3: extend common bounds to match aspect ratio with viewport
      const scaledCommonBounds = scaleToAspectRatio(
        visibleCommonBounds,
        width * RESOLUTION,
        height * RESOLUTION
      );

      // #4 :convert aligned common bounds to world bounds
      const worldBounds = this.commonToWorldBounds(scaledCommonBounds);

      // Clip webmercator projection limits
      worldBounds[0][1] = Math.max(worldBounds[0][1], -85.051129);
      worldBounds[1][1] = Math.min(worldBounds[1][1], 85.051129);
      worldBounds[0][0] = Math.max(worldBounds[0][0], -360);
      worldBounds[1][0] = Math.min(worldBounds[1][0], 360);

      // #5: now convert world bounds to common using Layer's coordiante system and origin
      const commonBounds = this.worldToCommonBounds(worldBounds, {
        useLayerCoordinateSystem: true,
        scaleToAspect: true,
        width: width * RESOLUTION,
        height: height * RESOLUTION
      });

      // Update for triangle layer
      triPositionBuffer.setData({
        // Y-flip for world bounds
        data: getTriangleVertices({
          xMin: worldBounds[0][0],
          yMin: worldBounds[1][1],
          xMax: worldBounds[1][0],
          yMax: worldBounds[0][1],
          addZ: true
        }),
        accessor: {size: 3}
      });
      Object.assign(newState, {worldBounds, commonBounds, scaledCommonBounds});

      boundsChanged = true;
    }
    this.setState(newState);
    return boundsChanged;
  }

  updateTextureRenderingBounds() {
    // Just render visible portion of the texture
    const {
      triPositionBuffer,
      triTexCoordBuffer,
      visibleCommonBounds,
      // scaledCommonBounds,
      // commonBounds,
      visibleWorldBounds,
      worldBounds,
      textureSize
    } = this.state;

    const commonBounds = this.worldToCommonBounds(worldBounds, {
      scaleToAspect: true,
      width: textureSize * RESOLUTION,
      height: textureSize * RESOLUTION
    });

    triPositionBuffer.setData({
      // Y-flip for world bounds
      data: getTriangleVertices({
        xMin: visibleWorldBounds[0][0],
        yMin: visibleWorldBounds[1][1],
        xMax: visibleWorldBounds[1][0],
        yMax: visibleWorldBounds[0][1],
        addZ: true
      }),
      accessor: {size: 3}
    });

    const textureBounds = scaleTextureCoordiantes(commonBounds, visibleCommonBounds);
    triTexCoordBuffer.setData({
      // Y-flip for world bounds
      data: getTriangleVertices({
        xMin: textureBounds[0][0],
        yMin: textureBounds[0][1],
        xMax: textureBounds[1][0],
        yMax: textureBounds[1][1]
      }),
      accessor: {size: 2}
    });
  }

  updateState(opts) {
    super.updateState(opts);
    const {props, oldProps} = opts;
    const changeFlags = this.getChangeFlags(opts);

    if (changeFlags.viewportChanged) {
      changeFlags.boundsChanged = this.updateBounds(changeFlags.viewportZoomChanged);
    }

    if (changeFlags.dataChanged) {
      this.updateWeightmapAttributes();
    }

    if (changeFlags.dataChanged || changeFlags.boundsChanged || changeFlags.uniformsChanged) {
      this.updateWeightmap();
    }

    if (props.colorRange !== oldProps.colorRange) {
      this.updateColorTexture(opts);
    }

    // TODO: need to be fixed, seem to be rendring wrong part of the texture
    if (changeFlags.viewportChanged) {
      this.updateTextureRenderingBounds();
    }

    this.setState({zoom: opts.context.viewport.zoom});
  }

  updateColorTexture(opts) {
    const {colorRange} = opts.props;
    const colors = colorRangeToFlatArray(colorRange, Float32Array, 255, true);
    const colorTexture = getFloatTexture(this.context.gl, {data: colors, width: 6});
    if (this.state.colorTexture) {
      this.state.colorTexture.delete();
    }
    colorTexture.setParameters({
      [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
      [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
      [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
      [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
    });
    this.setState({colorTexture});
  }

  updateWeightmap() {
    const {radiusPixels, intensity} = this.props;
    const {weightsTransform, commonBounds, textureSize} = this.state;
    const moduleParameters = Object.assign(Object.create(this.props), {
      viewport: this.context.viewport,
      pickingActive: 0
    });

    const uniforms = Object.assign({}, weightsTransform.model.getModuleUniforms(moduleParameters), {
      radiusPixels,
      intensity,
      commonBounds: [
        commonBounds[0][0],
        commonBounds[0][1],
        commonBounds[1][0],
        commonBounds[1][1]
      ],
      textureWidth: textureSize
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
    this.updateMaxWeightValue();
  }

  finalizeState() {
    super.finalizeState();
    const {
      positionsBuffer,
      weightsBuffer,
      weightsTransform,
      weightsTexture,
      maxWeightsTexture,
      triPositionBuffer,
      triTexCoordBuffer
    } = this.state;
    positionsBuffer.delete();
    weightsBuffer.delete();
    weightsTransform.delete();
    weightsTexture.delete();
    maxWeightsTexture.delete();
    triPositionBuffer.delete();
    triTexCoordBuffer.delete();
  }

  getChangeFlags(opts) {
    const {oldProps, props} = opts;
    const changeFlags = {};
    if (this.isDataChanged(opts)) {
      changeFlags.dataChanged = true;
    }
    if (oldProps.radiusPixels !== props.radiusPixels || oldProps.intensity !== props.intensity) {
      changeFlags.uniformsChanged = true;
    }
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;

    const {zoom} = this.state;
    if (!opts.context.viewport || opts.context.viewport.zoom !== zoom) {
      changeFlags.viewportZoomChanged = true;
    }

    return changeFlags;
  }

  shouldUpdateBounds(opts) {
    return opts.changeFlags.viewportChanged;
  }

  isDataChanged({changeFlags}) {
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

  updateWeightmapAttributes() {
    const {gl} = this.context;
    const {data, getPosition, getWeight} = this.props;
    const {positions, weights} = parseData(data, getPosition, getWeight);
    const {weightsTransform} = this.state;
    let {positionsBuffer, weightsBuffer} = this.state;
    if (positionsBuffer) {
      positionsBuffer.delete();
    }
    if (weightsBuffer) {
      weightsBuffer.delete();
    }
    positionsBuffer = new Buffer(gl, {
      data: positions,
      accessor: {size: 3}
    });
    weightsBuffer = new Buffer(gl, {
      data: weights,
      accessor: {size: 1}
    });
    const elementCount = weights.length;
    weightsTransform.update({
      sourceBuffers: {
        positions: positionsBuffer,
        weights: weightsBuffer
      },
      elementCount
    });
    this.setState({positionsBuffer, weightsBuffer, elementCount});
  }

  updateMaxWeightValue() {
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

  renderLayers() {
    const {
      weightsTexture,
      triPositionBuffer,
      triTexCoordBuffer,
      maxWeightsTexture,
      colorTexture
    } = this.state;
    const {updateTriggers, enhanceFactor} = this.props;

    return new TriangleLayer(
      this.getSubLayerProps({
        id: `${this.id}-triangle-layer`,
        updateTriggers
      }),
      {
        id: 'heatmap-triangle-layer',
        data: {
          positions: triPositionBuffer,
          texCoords: triTexCoordBuffer
        },
        count: 6,
        maxTexture: maxWeightsTexture,
        colorTexture,
        texture: weightsTexture,
        opacityFactor: enhanceFactor
      }
    );
  }
}

HeatmapLayer.layerName = 'HeatmapLayer';
HeatmapLayer.defaultProps = defaultProps;
