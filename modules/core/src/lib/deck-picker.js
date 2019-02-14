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

import {readPixelsToArray} from 'luma.gl';
import {drawPickingBuffer} from './draw-layers';
import getPixelRatio from '../utils/get-pixel-ratio';
import assert from '../utils/assert';
import {getClosestObject, getUniqueObjects} from './picking/query-object';
import {processPickInfo, getLayerPickingInfo} from './picking/pick-info';

export default class DeckPicker {
  constructor(props) {
    this.gl = props.gl;
    this.layerManager = props.layerManager;
    this.pickingEvent = null;
    this.lastPickedInfo = {
      // For callback tracking and autohighlight
      index: -1,
      layerId: null,
      info: null
    };
  }

  // Returns a new picking info object by assuming the last picked object is still picked
  getLastPickedObject({x, y, viewports}) {
    const layers = this.layerManager.getLayers();
    const lastPickedInfo = this.lastPickedInfo.info;
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

  // Pick the closest info at given coordinate
  pickObject({
    x,
    y,
    mode,
    radius = 0,
    layerIds,
    viewports,
    useDevicePixels,
    depth = 1,
    event = null
  }) {
    // Allow layers to access the event
    this.pickingEvent = event;

    const layers = this.layerManager.getLayers({layerIds});
    const {layerFilter, activateViewport} = this.layerManager;

    const result = this.pickClosetObject({
      // User params
      x,
      y,
      radius,
      layers,
      mode,
      layerFilter,
      depth,
      // Injected params
      viewports,
      onViewportActive: activateViewport,
      pickingFBO: this.layerManager.getPickingBuffer(),
      lastPickedInfo: this.lastPickedInfo,
      useDevicePixels
    });

    // Clear the current event
    this.pickingEvent = null;
    return result;
  }

  // Get all unique infos within a bounding box
  pickObjects({x, y, width, height, layerIds, viewports, useDevicePixels}) {
    const layers = this.layerManager.getLayers({layerIds});
    const {layerFilter, activateViewport} = this.layerManager;

    return this.pickVisibleObjects({
      x,
      y,
      width,
      height,
      layers,
      layerFilter,
      mode: 'pickObjects',
      viewports,
      onViewportActive: activateViewport,
      pickingFBO: this.layerManager.getPickingBuffer(),
      useDevicePixels
    });
  }

  // Private
  // Pick the closest object at the given (x,y) coordinate
  pickClosetObject({
    layers,
    viewports,
    x,
    y,
    radius,
    layerFilter,
    depth = 1,
    mode,
    onViewportActive,
    pickingFBO,
    lastPickedInfo,
    useDevicePixels
  }) {
    // Convert from canvas top-left to WebGL bottom-left coordinates
    // And compensate for pixelRatio
    const pixelRatio = getPixelRatio(useDevicePixels);
    const deviceX = Math.round(x * pixelRatio);
    const deviceY = Math.round(this.gl.canvas.height - y * pixelRatio);
    const deviceRadius = Math.round(radius * pixelRatio);

    const deviceRect = this.getPickingRect({
      deviceX,
      deviceY,
      deviceRadius,
      deviceWidth: pickingFBO.width,
      deviceHeight: pickingFBO.height
    });

    const result = [];
    const affectedLayers = {};

    for (let i = 0; i < depth; i++) {
      const pickedColors =
        deviceRect &&
        this.drawAndSamplePickingBuffer({
          layers,
          viewports,
          onViewportActive,
          useDevicePixels,
          pickingFBO,
          deviceRect,
          layerFilter,
          redrawReason: mode
        });

      const pickInfo = getClosestObject({
        pickedColors,
        layers,
        deviceX,
        deviceY,
        deviceRadius,
        deviceRect
      });
      // Only exclude if we need to run picking again.
      // We need to run picking again if an object is detected AND
      // we have not exhausted the requested depth.
      if (pickInfo.pickedColor && i + 1 < depth) {
        const layerId = pickInfo.pickedColor[3] - 1;
        if (!affectedLayers[layerId]) {
          // backup original colors
          affectedLayers[layerId] = layers[layerId].copyPickingColors();
        }
        layers[layerId].clearPickingColor(pickInfo.pickedColor);
      }

      // This logic needs to run even if no object is picked.
      const infos = processPickInfo({
        pickInfo,
        lastPickedInfo,
        mode,
        layers,
        viewports,
        x,
        y,
        deviceX,
        deviceY,
        pixelRatio
      });

      const processedPickInfos = this.callLayerPickingCallbacks(infos, mode);

      if (processedPickInfos) {
        processedPickInfos.forEach(info => result.push(info));
      }

      // If no object is picked stop.
      if (!pickInfo.pickedColor) {
        break;
      }
    }

    // reset only affected buffers
    Object.keys(affectedLayers).forEach(layerId =>
      layers[layerId].restorePickingColors(affectedLayers[layerId])
    );

    return result;
  }

  // Pick all objects within the given bounding box
  pickVisibleObjects({
    layers,
    viewports,
    x,
    y,
    width,
    height,
    mode,
    layerFilter,
    onViewportActive,
    pickingFBO,
    useDevicePixels
  }) {
    // Convert from canvas top-left to WebGL bottom-left coordinates
    // And compensate for pixelRatio
    const pixelRatio = getPixelRatio(useDevicePixels);

    const deviceLeft = Math.round(x * pixelRatio);
    const deviceBottom = Math.round(this.gl.canvas.height - y * pixelRatio);
    const deviceRight = Math.round((x + width) * pixelRatio);
    const deviceTop = Math.round(this.gl.canvas.height - (y + height) * pixelRatio);

    const deviceRect = {
      x: deviceLeft,
      y: deviceTop,
      width: deviceRight - deviceLeft,
      height: deviceBottom - deviceTop
    };

    const pickedColors = this.drawAndSamplePickingBuffer({
      layers,
      viewports,
      onViewportActive,
      pickingFBO,
      useDevicePixels,
      deviceRect,
      layerFilter,
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
  drawAndSamplePickingBuffer({
    layers,
    viewports,
    onViewportActive,
    useDevicePixels,
    pickingFBO,
    deviceRect,
    layerFilter,
    redrawReason
  }) {
    assert(deviceRect);
    assert(Number.isFinite(deviceRect.width) && deviceRect.width > 0, '`width` must be > 0');
    assert(Number.isFinite(deviceRect.height) && deviceRect.height > 0, '`height` must be > 0');

    const pickableLayers = layers.filter(layer => layer.isPickable());
    if (pickableLayers.length < 1) {
      return null;
    }

    drawPickingBuffer(this.gl, {
      layers,
      viewports,
      onViewportActive,
      useDevicePixels,
      pickingFBO,
      deviceRect,
      layerFilter,
      redrawReason
    });

    // Read from an already rendered picking buffer
    // Returns an Uint8ClampedArray of picked pixels
    const {x, y, width, height} = deviceRect;
    const pickedColors = new Uint8Array(width * height * 4);
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
  getPickingRect({deviceX, deviceY, deviceRadius, deviceWidth, deviceHeight}) {
    const valid = deviceX >= 0 && deviceY >= 0 && deviceX < deviceWidth && deviceY < deviceHeight;

    // x, y out of bounds.
    if (!valid) {
      return null;
    }

    // Create a box of size `radius * 2 + 1` centered at [deviceX, deviceY]
    const x = Math.max(0, deviceX - deviceRadius);
    const y = Math.max(0, deviceY - deviceRadius);
    const width = Math.min(deviceWidth, deviceX + deviceRadius) - x + 1;
    const height = Math.min(deviceHeight, deviceY + deviceRadius) - y + 1;

    return {x, y, width, height};
  }

  // Per-layer event handlers (e.g. onClick, onHover) are provided by the
  // user and out of deck.gl's control. It's very much possible that
  // the user calls React lifecycle methods in these function, such as
  // ReactComponent.setState(). React lifecycle methods sometimes induce
  // a re-render and re-generation of props of deck.gl and its layers,
  // which invalidates all layers currently passed to this very function.

  // Therefore, per-layer event handlers must be invoked at the end
  // of the picking operation. NO operation that relies on the states of current
  // layers should be called after this code.
  callLayerPickingCallbacks(infos, mode) {
    const unhandledPickInfos = [];
    const pickingEvent = this.pickingEvent;

    infos.forEach(info => {
      let handled = false;
      switch (mode) {
        case 'click':
          handled = info.layer.onClick(info, pickingEvent);
          break;
        case 'hover':
          handled = info.layer.onHover(info, pickingEvent);
          break;
        case 'query':
          break;
        default:
          throw new Error('unknown pick type');
      }

      if (!handled) {
        unhandledPickInfos.push(info);
      }
    });

    return unhandledPickInfos;
  }
}
