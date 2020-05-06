// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import {
  Framebuffer,
  Texture2D,
  isWebGL2,
  readPixelsToArray,
  cssToDeviceRatio,
  cssToDevicePixels
} from '@luma.gl/core';
import GL from '@luma.gl/constants';
import assert from '../utils/assert';
import PickLayersPass from '../passes/pick-layers-pass';
import {getClosestObject, getUniqueObjects} from './picking/query-object';
import {processPickInfo, getLayerPickingInfo} from './picking/pick-info';

export default class DeckPicker {
  constructor(gl) {
    this.gl = gl;
    this.pickingFBO = null;
    this.pickLayersPass = new PickLayersPass(gl);
    this.layerFilter = null;
    this.lastPickedInfo = {
      // For callback tracking and auto highlight
      index: -1,
      layerId: null,
      info: null
    };
    this._onError = null;
  }

  setProps(props) {
    if ('layerFilter' in props) {
      this.layerFilter = props.layerFilter;
    }

    if ('onError' in props) {
      this._onError = props.onError;
    }
  }

  finalize() {
    if (this.pickingFBO) {
      this.pickingFBO.delete();
    }
    if (this.depthFBO) {
      this.depthFBO.color.delete();
      this.depthFBO.delete();
    }
  }

  // Pick the closest info at given coordinate
  pickObject(opts) {
    return this._pickClosestObject(opts);
  }

  // Get all unique infos within a bounding box
  pickObjects(opts) {
    return this._pickVisibleObjects(opts);
  }

  // Returns a new picking info object by assuming the last picked object is still picked
  getLastPickedObject({x, y, layers, viewports}, lastPickedInfo = this.lastPickedInfo.info) {
    const lastPickedLayerId = lastPickedInfo && lastPickedInfo.layer && lastPickedInfo.layer.id;
    const layer = lastPickedLayerId ? layers.find(l => l.id === lastPickedLayerId) : null;
    const coordinate = viewports[0] && viewports[0].unproject([x, y]);

    const info = {
      x,
      y,
      coordinate,
      // TODO remove the lngLat prop after compatibility check
      lngLat: coordinate,
      layer
    };

    if (layer) {
      return Object.assign({}, lastPickedInfo, info);
    }
    return Object.assign(info, {color: null, object: null, index: -1});
  }

  // Private
  _resizeBuffer() {
    const {gl} = this;
    // Create a frame buffer if not already available
    if (!this.pickingFBO) {
      this.pickingFBO = new Framebuffer(gl);
      if (Framebuffer.isSupported(gl, {colorBufferFloat: true})) {
        this.depthFBO = new Framebuffer(gl);
        this.depthFBO.attach({
          [GL.COLOR_ATTACHMENT0]: new Texture2D(gl, {
            format: isWebGL2(gl) ? GL.RGBA32F : GL.RGBA,
            type: GL.FLOAT
          })
        });
      }
    }
    // Resize it to current canvas size (this is a noop if size hasn't changed)
    this.pickingFBO.resize({width: gl.canvas.width, height: gl.canvas.height});
    if (this.depthFBO) {
      this.depthFBO.resize({width: gl.canvas.width, height: gl.canvas.height});
    }
    return this.pickingFBO;
  }

  // Pick the closest object at the given (x,y) coordinate
  // eslint-disable-next-line max-statements,complexity
  _pickClosestObject({
    layers,
    viewports,
    x,
    y,
    radius = 0,
    depth = 1,
    mode = 'query',
    unproject3D,
    onViewportActive
  }) {
    this._resizeBuffer();
    // Convert from canvas top-left to WebGL bottom-left coordinates
    // Top-left coordinates [x, y] to bottom-left coordinates [deviceX, deviceY]
    // And compensate for pixelRatio
    const pixelRatio = cssToDeviceRatio(this.gl);
    const devicePixelRange = cssToDevicePixels(this.gl, [x, y], true);
    const devicePixel = [
      devicePixelRange.x + Math.floor(devicePixelRange.width / 2),
      devicePixelRange.y + Math.floor(devicePixelRange.height / 2)
    ];

    const deviceRadius = Math.round(radius * pixelRatio);
    const {width, height} = this.pickingFBO;
    const deviceRect = this._getPickingRect({
      deviceX: devicePixel[0],
      deviceY: devicePixel[1],
      deviceRadius,
      deviceWidth: width,
      deviceHeight: height
    });

    let infos;
    const result = [];
    const affectedLayers = {};

    for (let i = 0; i < depth; i++) {
      const pickedColors =
        deviceRect &&
        this._drawAndSample({
          layers,
          viewports,
          onViewportActive,
          deviceRect,
          pass: `picking:${mode}`,
          redrawReason: mode
        });

      const pickInfo = getClosestObject({
        pickedColors,
        layers,
        deviceX: devicePixel[0],
        deviceY: devicePixel[1],
        deviceRadius,
        deviceRect
      });

      let z;
      if (pickInfo.pickedLayer && unproject3D && this.depthFBO) {
        const zValues = this._drawAndSample({
          layers: [pickInfo.pickedLayer],
          viewports,
          onViewportActive,
          deviceRect: {x: pickInfo.pickedX, y: pickInfo.pickedY, width: 1, height: 1},
          pass: `picking:${mode}`,
          redrawReason: 'pick-z',
          pickZ: true
        });
        // picked value is in common space (pixels) from the camera target (viewport.position)
        // convert it to meters from the ground
        z = zValues[0] * viewports[0].distanceScales.metersPerUnit[2] + viewports[0].position[2];
      }

      // Only exclude if we need to run picking again.
      // We need to run picking again if an object is detected AND
      // we have not exhausted the requested depth.
      if (pickInfo.pickedColor && i + 1 < depth) {
        const layerId = pickInfo.pickedColor[3] - 1;
        affectedLayers[layerId] = true;
        layers[layerId].clearPickingColor(pickInfo.pickedColor);
      }

      // This logic needs to run even if no object is picked.
      infos = processPickInfo({
        pickInfo,
        lastPickedInfo: this.lastPickedInfo,
        mode,
        layers,
        viewports,
        x,
        y,
        z,
        pixelRatio
      });

      for (const info of infos.values()) {
        if (info.layer) {
          result.push(info);
        }
      }

      // If no object is picked stop.
      if (!pickInfo.pickedColor) {
        break;
      }
    }

    // reset only affected buffers
    for (const layerId in affectedLayers) {
      layers[layerId].restorePickingColors();
    }

    return {result, emptyInfo: infos && infos.get(null)};
  }

  // Pick all objects within the given bounding box
  _pickVisibleObjects({
    layers,
    viewports,
    x,
    y,
    width = 1,
    height = 1,
    mode = 'query',
    onViewportActive
  }) {
    this._resizeBuffer();
    // Convert from canvas top-left to WebGL bottom-left coordinates
    // And compensate for pixelRatio
    const pixelRatio = cssToDeviceRatio(this.gl);
    const leftTop = cssToDevicePixels(this.gl, [x, y], true);

    // take left and top (y inverted in device pixels) from start location
    const deviceLeft = leftTop.x;
    const deviceTop = leftTop.y + leftTop.height;

    // take right and bottom (y inverted in device pixels) from end location
    const rightBottom = cssToDevicePixels(this.gl, [x + width, y + height], true);
    const deviceRight = rightBottom.x + rightBottom.width;
    const deviceBottom = rightBottom.y;

    const deviceRect = {
      x: deviceLeft,
      y: deviceBottom,
      // deviceTop and deviceRight represent the first pixel outside the desired rect
      width: deviceRight - deviceLeft,
      height: deviceTop - deviceBottom
    };

    const pickedColors = this._drawAndSample({
      layers,
      viewports,
      onViewportActive,
      deviceRect,
      pass: `picking:${mode}`,
      redrawReason: mode
    });

    const pickInfos = getUniqueObjects({pickedColors, layers});

    // Only return unique infos, identified by info.object
    const uniqueInfos = new Map();

    pickInfos.forEach(pickInfo => {
      let info = {
        color: pickInfo.pickedColor,
        layer: null,
        index: pickInfo.pickedObjectIndex,
        picked: true,
        x,
        y,
        width,
        height,
        pixelRatio
      };

      info = getLayerPickingInfo({layer: pickInfo.pickedLayer, info, mode});
      if (!uniqueInfos.has(info.object)) {
        uniqueInfos.set(info.object, info);
      }
    });

    return Array.from(uniqueInfos.values());
  }

  // returns pickedColor or null if no pickable layers found.
  _drawAndSample({layers, viewports, onViewportActive, deviceRect, pass, redrawReason, pickZ}) {
    assert(deviceRect.width > 0 && deviceRect.height > 0);

    const pickableLayers = layers.filter(layer => layer.isPickable());
    if (pickableLayers.length < 1) {
      return null;
    }

    const pickingFBO = pickZ ? this.depthFBO : this.pickingFBO;

    this.pickLayersPass.render({
      layers,
      layerFilter: this.layerFilter,
      onError: this._onError,
      viewports,
      onViewportActive,
      pickingFBO,
      deviceRect,
      pass,
      redrawReason,
      pickZ
    });

    // Read from an already rendered picking buffer
    // Returns an Uint8ClampedArray of picked pixels
    const {x, y, width, height} = deviceRect;
    const pickedColors = new (pickZ ? Float32Array : Uint8Array)(width * height * 4);
    readPixelsToArray(pickingFBO, {
      sourceX: x,
      sourceY: y,
      sourceWidth: width,
      sourceHeight: height,
      target: pickedColors
    });

    return pickedColors;
  }

  // Calculate a picking rect centered on deviceX and deviceY and clipped to device
  // Returns null if pixel is outside of device
  _getPickingRect({deviceX, deviceY, deviceRadius, deviceWidth, deviceHeight}) {
    // Create a box of size `radius * 2 + 1` centered at [deviceX, deviceY]
    const x = Math.max(0, deviceX - deviceRadius);
    const y = Math.max(0, deviceY - deviceRadius);
    const width = Math.min(deviceWidth, deviceX + deviceRadius + 1) - x;
    const height = Math.min(deviceHeight, deviceY + deviceRadius + 1) - y;

    // x, y out of bounds.
    if (width <= 0 || height <= 0) {
      return null;
    }

    return {x, y, width, height};
  }
}
