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

import { drawPickingBuffer, getPixelRatio } from './draw-layers';
import log from '../utils/log';
import assert from 'assert';

var NO_PICKED_OBJECT = {
  pickedColor: null,
  pickedLayer: null,
  pickedObjectIndex: -1
};

/* eslint-disable max-depth, max-statements */
// Pick the closest object at the given (x,y) coordinate
export function pickObject(gl, _ref) {
  var layers = _ref.layers,
      viewports = _ref.viewports,
      x = _ref.x,
      y = _ref.y,
      radius = _ref.radius,
      layerFilter = _ref.layerFilter,
      mode = _ref.mode,
      onViewportActive = _ref.onViewportActive,
      pickingFBO = _ref.pickingFBO,
      lastPickedInfo = _ref.lastPickedInfo,
      useDevicePixels = _ref.useDevicePixels;

  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  var pixelRatio = getPixelRatio({ useDevicePixels: useDevicePixels });
  var deviceX = Math.round(x * pixelRatio);
  var deviceY = Math.round(gl.canvas.height - y * pixelRatio);
  var deviceRadius = Math.round(radius * pixelRatio);

  var deviceRect = getPickingRect({
    deviceX: deviceX, deviceY: deviceY, deviceRadius: deviceRadius,
    deviceWidth: pickingFBO.width,
    deviceHeight: pickingFBO.height
  });

  var pickedColors = deviceRect && drawAndSamplePickingBuffer(gl, {
    layers: layers,
    viewports: viewports,
    onViewportActive: onViewportActive,
    useDevicePixels: useDevicePixels,
    pickingFBO: pickingFBO,
    deviceRect: deviceRect,
    layerFilter: layerFilter,
    redrawReason: mode
  });

  var pickInfo = pickedColors && getClosestFromPickingBuffer(gl, {
    pickedColors: pickedColors,
    layers: layers,
    deviceX: deviceX,
    deviceY: deviceY,
    deviceRadius: deviceRadius,
    deviceRect: deviceRect
  }) || NO_PICKED_OBJECT;

  return processPickInfo({
    pickInfo: pickInfo, lastPickedInfo: lastPickedInfo, mode: mode, layers: layers, viewports: viewports, x: x, y: y, deviceX: deviceX, deviceY: deviceY, pixelRatio: pixelRatio
  });
}

// Pick all objects within the given bounding box
export function pickVisibleObjects(gl, _ref2) {
  var layers = _ref2.layers,
      viewports = _ref2.viewports,
      x = _ref2.x,
      y = _ref2.y,
      width = _ref2.width,
      height = _ref2.height,
      mode = _ref2.mode,
      layerFilter = _ref2.layerFilter,
      onViewportActive = _ref2.onViewportActive,
      pickingFBO = _ref2.pickingFBO,
      useDevicePixels = _ref2.useDevicePixels;


  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  var pixelRatio = getPixelRatio({ useDevicePixels: useDevicePixels });

  var deviceLeft = Math.round(x * pixelRatio);
  var deviceBottom = Math.round(gl.canvas.height - y * pixelRatio);
  var deviceRight = Math.round((x + width) * pixelRatio);
  var deviceTop = Math.round(gl.canvas.height - (y + height) * pixelRatio);

  var deviceRect = {
    x: deviceLeft,
    y: deviceTop,
    width: deviceRight - deviceLeft,
    height: deviceBottom - deviceTop
  };

  var pickedColors = drawAndSamplePickingBuffer(gl, {
    layers: layers,
    viewports: viewports,
    onViewportActive: onViewportActive,
    pickingFBO: pickingFBO,
    useDevicePixels: useDevicePixels,
    deviceRect: deviceRect,
    layerFilter: layerFilter,
    redrawReason: mode
  });

  var pickInfos = getUniquesFromPickingBuffer(gl, { pickedColors: pickedColors, layers: layers });

  // Only return unique infos, identified by info.object
  var uniqueInfos = new Map();

  pickInfos.forEach(function (pickInfo) {
    var viewport = getViewportFromCoordinates({ viewports: viewports }); // TODO - add coords
    var info = createInfo([pickInfo.x / pixelRatio, pickInfo.y / pixelRatio], viewport);
    info.devicePixel = [pickInfo.x, pickInfo.y];
    info.pixelRatio = pixelRatio;
    info.color = pickInfo.pickedColor;
    info.index = pickInfo.pickedObjectIndex;
    info.picked = true;

    info = getLayerPickingInfo({ layer: pickInfo.pickedLayer, info: info, mode: mode });
    if (!uniqueInfos.has(info.object)) {
      uniqueInfos.set(info.object, info);
    }
  });

  return Array.from(uniqueInfos.values());
}

// HELPER METHODS

// returns pickedColor or null if no pickable layers found.
function drawAndSamplePickingBuffer(gl, _ref3) {
  var layers = _ref3.layers,
      viewports = _ref3.viewports,
      onViewportActive = _ref3.onViewportActive,
      useDevicePixels = _ref3.useDevicePixels,
      pickingFBO = _ref3.pickingFBO,
      deviceRect = _ref3.deviceRect,
      layerFilter = _ref3.layerFilter,
      redrawReason = _ref3.redrawReason;

  assert(deviceRect);
  assert(Number.isFinite(deviceRect.width) && deviceRect.width > 0, '`width` must be > 0');
  assert(Number.isFinite(deviceRect.height) && deviceRect.height > 0, '`height` must be > 0');

  var pickableLayers = layers.filter(function (layer) {
    return layer.isPickable();
  });
  if (pickableLayers.length < 1) {
    return null;
  }

  drawPickingBuffer(gl, {
    layers: layers,
    viewports: viewports,
    onViewportActive: onViewportActive,
    useDevicePixels: useDevicePixels,
    pickingFBO: pickingFBO,
    deviceRect: deviceRect,
    layerFilter: layerFilter,
    redrawReason: redrawReason
  });

  // Read from an already rendered picking buffer
  // Returns an Uint8ClampedArray of picked pixels
  var x = deviceRect.x,
      y = deviceRect.y,
      width = deviceRect.width,
      height = deviceRect.height;

  var pickedColors = new Uint8Array(width * height * 4);
  pickingFBO.readPixels({ x: x, y: y, width: width, height: height, pixelArray: pickedColors });
  return pickedColors;
}

// Indentifies which viewport, if any corresponds to x and y
// Returns first viewport if no match
// TODO - need to determine which viewport we are in
// TODO - document concept of "primary viewport" that matches all coords?
// TODO - static method on Viewport class?
function getViewportFromCoordinates(_ref4) {
  var viewports = _ref4.viewports;

  var viewport = viewports[0];
  return viewport;
}

// Calculate a picking rect centered on deviceX and deviceY and clipped to device
// Returns null if pixel is outside of device
function getPickingRect(_ref5) {
  var deviceX = _ref5.deviceX,
      deviceY = _ref5.deviceY,
      deviceRadius = _ref5.deviceRadius,
      deviceWidth = _ref5.deviceWidth,
      deviceHeight = _ref5.deviceHeight;

  var valid = deviceX >= 0 && deviceY >= 0 && deviceX < deviceWidth && deviceY < deviceHeight;

  // x, y out of bounds.
  if (!valid) {
    return null;
  }

  // Create a box of size `radius * 2 + 1` centered at [deviceX, deviceY]
  var x = Math.max(0, deviceX - deviceRadius);
  var y = Math.max(0, deviceY - deviceRadius);
  var width = Math.min(deviceWidth, deviceX + deviceRadius) - x + 1;
  var height = Math.min(deviceHeight, deviceY + deviceRadius) - y + 1;

  return { x: x, y: y, width: width, height: height };
}

// TODO - break this monster function into 3+ parts
function processPickInfo(_ref6) {
  var pickInfo = _ref6.pickInfo,
      lastPickedInfo = _ref6.lastPickedInfo,
      mode = _ref6.mode,
      layers = _ref6.layers,
      viewports = _ref6.viewports,
      x = _ref6.x,
      y = _ref6.y,
      deviceX = _ref6.deviceX,
      deviceY = _ref6.deviceY,
      pixelRatio = _ref6.pixelRatio;
  var pickedColor = pickInfo.pickedColor,
      pickedLayer = pickInfo.pickedLayer,
      pickedObjectIndex = pickInfo.pickedObjectIndex;


  var affectedLayers = pickedLayer ? [pickedLayer] : [];

  if (mode === 'hover') {
    // only invoke onHover events if picked object has changed
    var lastPickedObjectIndex = lastPickedInfo.index;
    var lastPickedLayerId = lastPickedInfo.layerId;
    var pickedLayerId = pickedLayer && pickedLayer.props.id;

    // proceed only if picked object changed
    if (pickedLayerId !== lastPickedLayerId || pickedObjectIndex !== lastPickedObjectIndex) {
      if (pickedLayerId !== lastPickedLayerId) {
        // We cannot store a ref to lastPickedLayer in the context because
        // the state of an outdated layer is no longer valid
        // and the props may have changed
        var lastPickedLayer = layers.find(function (layer) {
          return layer.props.id === lastPickedLayerId;
        });
        if (lastPickedLayer) {
          // Let leave event fire before enter event
          affectedLayers.unshift(lastPickedLayer);
        }
      }

      // Update layer manager context
      lastPickedInfo.layerId = pickedLayerId;
      lastPickedInfo.index = pickedObjectIndex;
    }
  }

  var viewport = getViewportFromCoordinates({ viewports: viewports }); // TODO - add coords

  var baseInfo = createInfo([x, y], viewport);
  baseInfo.devicePixel = [deviceX, deviceY];
  baseInfo.pixelRatio = pixelRatio;

  // Use a Map to store all picking infos.
  // The following two forEach loops are the result of
  // https://github.com/uber/deck.gl/issues/443
  // Please be very careful when changing this pattern
  var infos = new Map();

  affectedLayers.forEach(function (layer) {
    var info = Object.assign({}, baseInfo);

    if (layer === pickedLayer) {
      info.color = pickedColor;
      info.index = pickedObjectIndex;
      info.picked = true;
    }

    info = getLayerPickingInfo({ layer: layer, info: info, mode: mode });

    // This guarantees that there will be only one copy of info for
    // one composite layer
    if (info) {
      infos.set(info.layer.id, info);
    }

    var pickingSelectedColor = layer.props.autoHighlight && pickedLayer === layer ? pickedColor : null;

    var pickingParameters = {
      pickingSelectedColor: pickingSelectedColor
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = layer.getModels()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var model = _step.value;

        model.updateModuleSettings(pickingParameters);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });

  var unhandledPickInfos = callLayerPickingCallbacks(infos, mode);

  return unhandledPickInfos;
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
function callLayerPickingCallbacks(infos, mode) {
  var unhandledPickInfos = [];

  infos.forEach(function (info) {
    var handled = false;
    switch (mode) {
      case 'click':
        handled = info.layer.props.onClick(info);break;
      case 'hover':
        handled = info.layer.props.onHover(info);break;
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

/**
 * Pick at a specified pixel with a tolerance radius
 * Returns the closest object to the pixel in shape `{pickedColor, pickedLayer, pickedObjectIndex}`
 */
export function getClosestFromPickingBuffer(gl, _ref7) {
  var pickedColors = _ref7.pickedColors,
      layers = _ref7.layers,
      deviceX = _ref7.deviceX,
      deviceY = _ref7.deviceY,
      deviceRadius = _ref7.deviceRadius,
      deviceRect = _ref7.deviceRect;

  assert(pickedColors);

  // Traverse all pixels in picking results and find the one closest to the supplied
  // [deviceX, deviceY]
  var x = deviceRect.x,
      y = deviceRect.y,
      width = deviceRect.width,
      height = deviceRect.height;

  var minSquareDistanceToCenter = deviceRadius * deviceRadius;
  var closestPixelIndex = -1;
  var i = 0;

  for (var row = 0; row < height; row++) {
    var dy = row + y - deviceY;
    var dy2 = dy * dy;

    if (dy2 > minSquareDistanceToCenter) {
      // skip this row
      i += 4 * width;
    } else {
      for (var col = 0; col < width; col++) {
        // Decode picked layer from color
        var pickedLayerIndex = pickedColors[i + 3] - 1;

        if (pickedLayerIndex >= 0) {
          var dx = col + x - deviceX;
          var d2 = dx * dx + dy2;

          if (d2 <= minSquareDistanceToCenter) {
            minSquareDistanceToCenter = d2;
            closestPixelIndex = i;
          }
        }
        i += 4;
      }
    }
  }

  if (closestPixelIndex >= 0) {
    // Decode picked object index from color
    var _pickedLayerIndex = pickedColors[closestPixelIndex + 3] - 1;
    var pickedColor = pickedColors.slice(closestPixelIndex, closestPixelIndex + 4);
    var pickedLayer = layers[_pickedLayerIndex];
    if (pickedLayer) {
      var pickedObjectIndex = pickedLayer.decodePickingColor(pickedColor);
      return { pickedColor: pickedColor, pickedLayer: pickedLayer, pickedObjectIndex: pickedObjectIndex };
    }
    log.error('Picked non-existent layer. Is picking buffer corrupt?');
  }

  return NO_PICKED_OBJECT;
}
/* eslint-enable max-depth, max-statements */

/**
 * Examines a picking buffer for unique colors
 * Returns array of unique objects in shape `{x, y, pickedColor, pickedLayer, pickedObjectIndex}`
 */
function getUniquesFromPickingBuffer(gl, _ref8) {
  var pickedColors = _ref8.pickedColors,
      layers = _ref8.layers;

  var uniqueColors = new Map();

  // Traverse all pixels in picking results and get unique colors
  if (pickedColors) {
    for (var i = 0; i < pickedColors.length; i += 4) {
      // Decode picked layer from color
      var pickedLayerIndex = pickedColors[i + 3] - 1;

      if (pickedLayerIndex >= 0) {
        var pickedColor = pickedColors.slice(i, i + 4);
        var colorKey = pickedColor.join(',');
        if (!uniqueColors.has(colorKey)) {
          // eslint-disable-line
          var pickedLayer = layers[pickedLayerIndex];
          if (pickedLayer) {
            // eslint-disable-line
            uniqueColors.set(colorKey, {
              pickedColor: pickedColor,
              pickedLayer: pickedLayer,
              pickedObjectIndex: pickedLayer.decodePickingColor(pickedColor)
            });
          } else {
            log.error('Picked non-existent layer. Is picking buffer corrupt?');
          }
        }
      }
    }
  }

  return Array.from(uniqueColors.values());
}

function createInfo(pixel, viewport) {
  // Assign a number of potentially useful props to the "info" object
  return {
    color: null,
    layer: null,
    index: -1,
    picked: false,
    x: pixel[0],
    y: pixel[1],
    pixel: pixel,
    lngLat: viewport.unproject(pixel)
  };
}

// Walk up the layer composite chain to populate the info object
function getLayerPickingInfo(_ref9) {
  var layer = _ref9.layer,
      info = _ref9.info,
      mode = _ref9.mode;

  while (layer && info) {
    // For a composite layer, sourceLayer will point to the sublayer
    // where the event originates from.
    // It provides additional context for the composite layer's
    // getPickingInfo() method to populate the info object
    var sourceLayer = info.layer || layer;
    info.layer = layer;
    // layer.pickLayer() function requires a non-null ```layer.state```
    // object to funtion properly. So the layer refereced here
    // must be the "current" layer, not an "out-dated" / "invalidated" layer
    info = layer.pickLayer({ info: info, mode: mode, sourceLayer: sourceLayer });
    layer = layer.parentLayer;
  }
  return info;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9waWNrLWxheWVycy5qcyJdLCJuYW1lcyI6WyJkcmF3UGlja2luZ0J1ZmZlciIsImdldFBpeGVsUmF0aW8iLCJsb2ciLCJhc3NlcnQiLCJOT19QSUNLRURfT0JKRUNUIiwicGlja2VkQ29sb3IiLCJwaWNrZWRMYXllciIsInBpY2tlZE9iamVjdEluZGV4IiwicGlja09iamVjdCIsImdsIiwibGF5ZXJzIiwidmlld3BvcnRzIiwieCIsInkiLCJyYWRpdXMiLCJsYXllckZpbHRlciIsIm1vZGUiLCJvblZpZXdwb3J0QWN0aXZlIiwicGlja2luZ0ZCTyIsImxhc3RQaWNrZWRJbmZvIiwidXNlRGV2aWNlUGl4ZWxzIiwicGl4ZWxSYXRpbyIsImRldmljZVgiLCJNYXRoIiwicm91bmQiLCJkZXZpY2VZIiwiY2FudmFzIiwiaGVpZ2h0IiwiZGV2aWNlUmFkaXVzIiwiZGV2aWNlUmVjdCIsImdldFBpY2tpbmdSZWN0IiwiZGV2aWNlV2lkdGgiLCJ3aWR0aCIsImRldmljZUhlaWdodCIsInBpY2tlZENvbG9ycyIsImRyYXdBbmRTYW1wbGVQaWNraW5nQnVmZmVyIiwicmVkcmF3UmVhc29uIiwicGlja0luZm8iLCJnZXRDbG9zZXN0RnJvbVBpY2tpbmdCdWZmZXIiLCJwcm9jZXNzUGlja0luZm8iLCJwaWNrVmlzaWJsZU9iamVjdHMiLCJkZXZpY2VMZWZ0IiwiZGV2aWNlQm90dG9tIiwiZGV2aWNlUmlnaHQiLCJkZXZpY2VUb3AiLCJwaWNrSW5mb3MiLCJnZXRVbmlxdWVzRnJvbVBpY2tpbmdCdWZmZXIiLCJ1bmlxdWVJbmZvcyIsIk1hcCIsImZvckVhY2giLCJ2aWV3cG9ydCIsImdldFZpZXdwb3J0RnJvbUNvb3JkaW5hdGVzIiwiaW5mbyIsImNyZWF0ZUluZm8iLCJkZXZpY2VQaXhlbCIsImNvbG9yIiwiaW5kZXgiLCJwaWNrZWQiLCJnZXRMYXllclBpY2tpbmdJbmZvIiwibGF5ZXIiLCJoYXMiLCJvYmplY3QiLCJzZXQiLCJBcnJheSIsImZyb20iLCJ2YWx1ZXMiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInBpY2thYmxlTGF5ZXJzIiwiZmlsdGVyIiwiaXNQaWNrYWJsZSIsImxlbmd0aCIsIlVpbnQ4QXJyYXkiLCJyZWFkUGl4ZWxzIiwicGl4ZWxBcnJheSIsInZhbGlkIiwibWF4IiwibWluIiwiYWZmZWN0ZWRMYXllcnMiLCJsYXN0UGlja2VkT2JqZWN0SW5kZXgiLCJsYXN0UGlja2VkTGF5ZXJJZCIsImxheWVySWQiLCJwaWNrZWRMYXllcklkIiwicHJvcHMiLCJpZCIsImxhc3RQaWNrZWRMYXllciIsImZpbmQiLCJ1bnNoaWZ0IiwiYmFzZUluZm8iLCJpbmZvcyIsIk9iamVjdCIsImFzc2lnbiIsInBpY2tpbmdTZWxlY3RlZENvbG9yIiwiYXV0b0hpZ2hsaWdodCIsInBpY2tpbmdQYXJhbWV0ZXJzIiwiZ2V0TW9kZWxzIiwibW9kZWwiLCJ1cGRhdGVNb2R1bGVTZXR0aW5ncyIsInVuaGFuZGxlZFBpY2tJbmZvcyIsImNhbGxMYXllclBpY2tpbmdDYWxsYmFja3MiLCJoYW5kbGVkIiwib25DbGljayIsIm9uSG92ZXIiLCJFcnJvciIsInB1c2giLCJtaW5TcXVhcmVEaXN0YW5jZVRvQ2VudGVyIiwiY2xvc2VzdFBpeGVsSW5kZXgiLCJpIiwicm93IiwiZHkiLCJkeTIiLCJjb2wiLCJwaWNrZWRMYXllckluZGV4IiwiZHgiLCJkMiIsInNsaWNlIiwiZGVjb2RlUGlja2luZ0NvbG9yIiwiZXJyb3IiLCJ1bmlxdWVDb2xvcnMiLCJjb2xvcktleSIsImpvaW4iLCJwaXhlbCIsImxuZ0xhdCIsInVucHJvamVjdCIsInNvdXJjZUxheWVyIiwicGlja0xheWVyIiwicGFyZW50TGF5ZXIiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLGlCQUFSLEVBQTJCQyxhQUEzQixR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QVk4RyxrQkFBWixDQUErQi9HLFdBQS9CO0FBSE0sYUFBM0I7QUFLRCxXQU5ELE1BTU87QUFDTEgsZ0JBQUltSCxLQUFKLENBQVUsdURBQVY7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNGOztBQUVELFNBQU90RCxNQUFNQyxJQUFOLENBQVdzRCxhQUFhckQsTUFBYixFQUFYLENBQVA7QUFDRDs7QUFFRCxTQUFTWixVQUFULENBQW9Cb0UsS0FBcEIsRUFBMkJ2RSxRQUEzQixFQUFxQztBQUNuQztBQUNBLFNBQU87QUFDTEssV0FBTyxJQURGO0FBRUxJLFdBQU8sSUFGRjtBQUdMSCxXQUFPLENBQUMsQ0FISDtBQUlMQyxZQUFRLEtBSkg7QUFLTDdDLE9BQUc2RyxNQUFNLENBQU4sQ0FMRTtBQU1MNUcsT0FBRzRHLE1BQU0sQ0FBTixDQU5FO0FBT0xBLGdCQVBLO0FBUUxDLFlBQVF4RSxTQUFTeUUsU0FBVCxDQUFtQkYsS0FBbkI7QUFSSCxHQUFQO0FBVUQ7O0FBRUQ7QUFDQSxTQUFTL0QsbUJBQVQsUUFBa0Q7QUFBQSxNQUFwQkMsS0FBb0IsU0FBcEJBLEtBQW9CO0FBQUEsTUFBYlAsSUFBYSxTQUFiQSxJQUFhO0FBQUEsTUFBUHBDLElBQU8sU0FBUEEsSUFBTzs7QUFDaEQsU0FBTzJDLFNBQVNQLElBQWhCLEVBQXNCO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTXdFLGNBQWN4RSxLQUFLTyxLQUFMLElBQWNBLEtBQWxDO0FBQ0FQLFNBQUtPLEtBQUwsR0FBYUEsS0FBYjtBQUNBO0FBQ0E7QUFDQTtBQUNBUCxXQUFPTyxNQUFNa0UsU0FBTixDQUFnQixFQUFDekUsVUFBRCxFQUFPcEMsVUFBUCxFQUFhNEcsd0JBQWIsRUFBaEIsQ0FBUDtBQUNBakUsWUFBUUEsTUFBTW1FLFdBQWQ7QUFDRDtBQUNELFNBQU8xRSxJQUFQO0FBQ0QiLCJmaWxlIjoicGljay1sYXllcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtkcmF3UGlja2luZ0J1ZmZlciwgZ2V0UGl4ZWxSYXRpb30gZnJvbSAnLi9kcmF3LWxheWVycyc7XG5pbXBvcnQgbG9nIGZyb20gJy4uL3V0aWxzL2xvZyc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IE5PX1BJQ0tFRF9PQkpFQ1QgPSB7XG4gIHBpY2tlZENvbG9yOiBudWxsLFxuICBwaWNrZWRMYXllcjogbnVsbCxcbiAgcGlja2VkT2JqZWN0SW5kZXg6IC0xXG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtZGVwdGgsIG1heC1zdGF0ZW1lbnRzICovXG4vLyBQaWNrIHRoZSBjbG9zZXN0IG9iamVjdCBhdCB0aGUgZ2l2ZW4gKHgseSkgY29vcmRpbmF0ZVxuZXhwb3J0IGZ1bmN0aW9uIHBpY2tPYmplY3QoZ2wsIHtcbiAgbGF5ZXJzLFxuICB2aWV3cG9ydHMsXG4gIHgsXG4gIHksXG4gIHJhZGl1cyxcbiAgbGF5ZXJGaWx0ZXIsXG4gIG1vZGUsXG4gIG9uVmlld3BvcnRBY3RpdmUsXG4gIHBpY2tpbmdGQk8sXG4gIGxhc3RQaWNrZWRJbmZvLFxuICB1c2VEZXZpY2VQaXhlbHNcbn0pIHtcbiAgLy8gQ29udmVydCBmcm9tIGNhbnZhcyB0b3AtbGVmdCB0byBXZWJHTCBib3R0b20tbGVmdCBjb29yZGluYXRlc1xuICAvLyBBbmQgY29tcGVuc2F0ZSBmb3IgcGl4ZWxSYXRpb1xuICBjb25zdCBwaXhlbFJhdGlvID0gZ2V0UGl4ZWxSYXRpbyh7dXNlRGV2aWNlUGl4ZWxzfSk7XG4gIGNvbnN0IGRldmljZVggPSBNYXRoLnJvdW5kKHggKiBwaXhlbFJhdGlvKTtcbiAgY29uc3QgZGV2aWNlWSA9IE1hdGgucm91bmQoZ2wuY2FudmFzLmhlaWdodCAtIHkgKiBwaXhlbFJhdGlvKTtcbiAgY29uc3QgZGV2aWNlUmFkaXVzID0gTWF0aC5yb3VuZChyYWRpdXMgKiBwaXhlbFJhdGlvKTtcblxuICBjb25zdCBkZXZpY2VSZWN0ID0gZ2V0UGlja2luZ1JlY3Qoe1xuICAgIGRldmljZVgsIGRldmljZVksIGRldmljZVJhZGl1cyxcbiAgICBkZXZpY2VXaWR0aDogcGlja2luZ0ZCTy53aWR0aCxcbiAgICBkZXZpY2VIZWlnaHQ6IHBpY2tpbmdGQk8uaGVpZ2h0XG4gIH0pO1xuXG4gIGNvbnN0IHBpY2tlZENvbG9ycyA9IGRldmljZVJlY3QgJiYgZHJhd0FuZFNhbXBsZVBpY2tpbmdCdWZmZXIoZ2wsIHtcbiAgICBsYXllcnMsXG4gICAgdmlld3BvcnRzLFxuICAgIG9uVmlld3BvcnRBY3RpdmUsXG4gICAgdXNlRGV2aWNlUGl4ZWxzLFxuICAgIHBpY2tpbmdGQk8sXG4gICAgZGV2aWNlUmVjdCxcbiAgICBsYXllckZpbHRlcixcbiAgICByZWRyYXdSZWFzb246IG1vZGVcbiAgfSk7XG5cbiAgY29uc3QgcGlja0luZm8gPSAocGlja2VkQ29sb3JzICYmIGdldENsb3Nlc3RGcm9tUGlja2luZ0J1ZmZlcihnbCwge1xuICAgIHBpY2tlZENvbG9ycyxcbiAgICBsYXllcnMsXG4gICAgZGV2aWNlWCxcbiAgICBkZXZpY2VZLFxuICAgIGRldmljZVJhZGl1cyxcbiAgICBkZXZpY2VSZWN0XG4gIH0pKSB8fCBOT19QSUNLRURfT0JKRUNUO1xuXG4gIHJldHVybiBwcm9jZXNzUGlja0luZm8oe1xuICAgIHBpY2tJbmZvLCBsYXN0UGlja2VkSW5mbywgbW9kZSwgbGF5ZXJzLCB2aWV3cG9ydHMsIHgsIHksIGRldmljZVgsIGRldmljZVksIHBpeGVsUmF0aW9cbiAgfSk7XG59XG5cbi8vIFBpY2sgYWxsIG9iamVjdHMgd2l0aGluIHRoZSBnaXZlbiBib3VuZGluZyBib3hcbmV4cG9ydCBmdW5jdGlvbiBwaWNrVmlzaWJsZU9iamVjdHMoZ2wsIHtcbiAgbGF5ZXJzLFxuICB2aWV3cG9ydHMsXG4gIHgsXG4gIHksXG4gIHdpZHRoLFxuICBoZWlnaHQsXG4gIG1vZGUsXG4gIGxheWVyRmlsdGVyLFxuICBvblZpZXdwb3J0QWN0aXZlLFxuICBwaWNraW5nRkJPLFxuICB1c2VEZXZpY2VQaXhlbHNcbn0pIHtcblxuICAvLyBDb252ZXJ0IGZyb20gY2FudmFzIHRvcC1sZWZ0IHRvIFdlYkdMIGJvdHRvbS1sZWZ0IGNvb3JkaW5hdGVzXG4gIC8vIEFuZCBjb21wZW5zYXRlIGZvciBwaXhlbFJhdGlvXG4gIGNvbnN0IHBpeGVsUmF0aW8gPSBnZXRQaXhlbFJhdGlvKHt1c2VEZXZpY2VQaXhlbHN9KTtcblxuICBjb25zdCBkZXZpY2VMZWZ0ID0gTWF0aC5yb3VuZCh4ICogcGl4ZWxSYXRpbyk7XG4gIGNvbnN0IGRldmljZUJvdHRvbSA9IE1hdGgucm91bmQoZ2wuY2FudmFzLmhlaWdodCAtIHkgKiBwaXhlbFJhdGlvKTtcbiAgY29uc3QgZGV2aWNlUmlnaHQgPSBNYXRoLnJvdW5kKCh4ICsgd2lkdGgpICogcGl4ZWxSYXRpbyk7XG4gIGNvbnN0IGRldmljZVRvcCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLmhlaWdodCAtICh5ICsgaGVpZ2h0KSAqIHBpeGVsUmF0aW8pO1xuXG4gIGNvbnN0IGRldmljZVJlY3QgPSB7XG4gICAgeDogZGV2aWNlTGVmdCxcbiAgICB5OiBkZXZpY2VUb3AsXG4gICAgd2lkdGg6IGRldmljZVJpZ2h0IC0gZGV2aWNlTGVmdCxcbiAgICBoZWlnaHQ6IGRldmljZUJvdHRvbSAtIGRldmljZVRvcFxuICB9O1xuXG4gIGNvbnN0IHBpY2tlZENvbG9ycyA9IGRyYXdBbmRTYW1wbGVQaWNraW5nQnVmZmVyKGdsLCB7XG4gICAgbGF5ZXJzLFxuICAgIHZpZXdwb3J0cyxcbiAgICBvblZpZXdwb3J0QWN0aXZlLFxuICAgIHBpY2tpbmdGQk8sXG4gICAgdXNlRGV2aWNlUGl4ZWxzLFxuICAgIGRldmljZVJlY3QsXG4gICAgbGF5ZXJGaWx0ZXIsXG4gICAgcmVkcmF3UmVhc29uOiBtb2RlXG4gIH0pO1xuXG4gIGNvbnN0IHBpY2tJbmZvcyA9IGdldFVuaXF1ZXNGcm9tUGlja2luZ0J1ZmZlcihnbCwge3BpY2tlZENvbG9ycywgbGF5ZXJzfSk7XG5cbiAgLy8gT25seSByZXR1cm4gdW5pcXVlIGluZm9zLCBpZGVudGlmaWVkIGJ5IGluZm8ub2JqZWN0XG4gIGNvbnN0IHVuaXF1ZUluZm9zID0gbmV3IE1hcCgpO1xuXG4gIHBpY2tJbmZvcy5mb3JFYWNoKHBpY2tJbmZvID0+IHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IGdldFZpZXdwb3J0RnJvbUNvb3JkaW5hdGVzKHt2aWV3cG9ydHN9KTsgLy8gVE9ETyAtIGFkZCBjb29yZHNcbiAgICBsZXQgaW5mbyA9IGNyZWF0ZUluZm8oW3BpY2tJbmZvLnggLyBwaXhlbFJhdGlvLCBwaWNrSW5mby55IC8gcGl4ZWxSYXRpb10sIHZpZXdwb3J0KTtcbiAgICBpbmZvLmRldmljZVBpeGVsID0gW3BpY2tJbmZvLngsIHBpY2tJbmZvLnldO1xuICAgIGluZm8ucGl4ZWxSYXRpbyA9IHBpeGVsUmF0aW87XG4gICAgaW5mby5jb2xvciA9IHBpY2tJbmZvLnBpY2tlZENvbG9yO1xuICAgIGluZm8uaW5kZXggPSBwaWNrSW5mby5waWNrZWRPYmplY3RJbmRleDtcbiAgICBpbmZvLnBpY2tlZCA9IHRydWU7XG5cbiAgICBpbmZvID0gZ2V0TGF5ZXJQaWNraW5nSW5mbyh7bGF5ZXI6IHBpY2tJbmZvLnBpY2tlZExheWVyLCBpbmZvLCBtb2RlfSk7XG4gICAgaWYgKCF1bmlxdWVJbmZvcy5oYXMoaW5mby5vYmplY3QpKSB7XG4gICAgICB1bmlxdWVJbmZvcy5zZXQoaW5mby5vYmplY3QsIGluZm8pO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIEFycmF5LmZyb20odW5pcXVlSW5mb3MudmFsdWVzKCkpO1xufVxuXG4vLyBIRUxQRVIgTUVUSE9EU1xuXG4vLyByZXR1cm5zIHBpY2tlZENvbG9yIG9yIG51bGwgaWYgbm8gcGlja2FibGUgbGF5ZXJzIGZvdW5kLlxuZnVuY3Rpb24gZHJhd0FuZFNhbXBsZVBpY2tpbmdCdWZmZXIoZ2wsIHtcbiAgbGF5ZXJzLFxuICB2aWV3cG9ydHMsXG4gIG9uVmlld3BvcnRBY3RpdmUsXG4gIHVzZURldmljZVBpeGVscyxcbiAgcGlja2luZ0ZCTyxcbiAgZGV2aWNlUmVjdCxcbiAgbGF5ZXJGaWx0ZXIsXG4gIHJlZHJhd1JlYXNvblxufSkge1xuICBhc3NlcnQoZGV2aWNlUmVjdCk7XG4gIGFzc2VydCgoTnVtYmVyLmlzRmluaXRlKGRldmljZVJlY3Qud2lkdGgpICYmIGRldmljZVJlY3Qud2lkdGggPiAwKSwgJ2B3aWR0aGAgbXVzdCBiZSA+IDAnKTtcbiAgYXNzZXJ0KChOdW1iZXIuaXNGaW5pdGUoZGV2aWNlUmVjdC5oZWlnaHQpICYmIGRldmljZVJlY3QuaGVpZ2h0ID4gMCksICdgaGVpZ2h0YCBtdXN0IGJlID4gMCcpO1xuXG4gIGNvbnN0IHBpY2thYmxlTGF5ZXJzID0gbGF5ZXJzLmZpbHRlcihsYXllciA9PiBsYXllci5pc1BpY2thYmxlKCkpO1xuICBpZiAocGlja2FibGVMYXllcnMubGVuZ3RoIDwgMSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZHJhd1BpY2tpbmdCdWZmZXIoZ2wsIHtcbiAgICBsYXllcnMsXG4gICAgdmlld3BvcnRzLFxuICAgIG9uVmlld3BvcnRBY3RpdmUsXG4gICAgdXNlRGV2aWNlUGl4ZWxzLFxuICAgIHBpY2tpbmdGQk8sXG4gICAgZGV2aWNlUmVjdCxcbiAgICBsYXllckZpbHRlcixcbiAgICByZWRyYXdSZWFzb25cbiAgfSk7XG5cbiAgLy8gUmVhZCBmcm9tIGFuIGFscmVhZHkgcmVuZGVyZWQgcGlja2luZyBidWZmZXJcbiAgLy8gUmV0dXJucyBhbiBVaW50OENsYW1wZWRBcnJheSBvZiBwaWNrZWQgcGl4ZWxzXG4gIGNvbnN0IHt4LCB5LCB3aWR0aCwgaGVpZ2h0fSA9IGRldmljZVJlY3Q7XG4gIGNvbnN0IHBpY2tlZENvbG9ycyA9IG5ldyBVaW50OEFycmF5KHdpZHRoICogaGVpZ2h0ICogNCk7XG4gIHBpY2tpbmdGQk8ucmVhZFBpeGVscyh7eCwgeSwgd2lkdGgsIGhlaWdodCwgcGl4ZWxBcnJheTogcGlja2VkQ29sb3JzfSk7XG4gIHJldHVybiBwaWNrZWRDb2xvcnM7XG59XG5cbi8vIEluZGVudGlmaWVzIHdoaWNoIHZpZXdwb3J0LCBpZiBhbnkgY29ycmVzcG9uZHMgdG8geCBhbmQgeVxuLy8gUmV0dXJucyBmaXJzdCB2aWV3cG9ydCBpZiBubyBtYXRjaFxuLy8gVE9ETyAtIG5lZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIHZpZXdwb3J0IHdlIGFyZSBpblxuLy8gVE9ETyAtIGRvY3VtZW50IGNvbmNlcHQgb2YgXCJwcmltYXJ5IHZpZXdwb3J0XCIgdGhhdCBtYXRjaGVzIGFsbCBjb29yZHM/XG4vLyBUT0RPIC0gc3RhdGljIG1ldGhvZCBvbiBWaWV3cG9ydCBjbGFzcz9cbmZ1bmN0aW9uIGdldFZpZXdwb3J0RnJvbUNvb3JkaW5hdGVzKHt2aWV3cG9ydHN9KSB7XG4gIGNvbnN0IHZpZXdwb3J0ID0gdmlld3BvcnRzWzBdO1xuICByZXR1cm4gdmlld3BvcnQ7XG59XG5cbi8vIENhbGN1bGF0ZSBhIHBpY2tpbmcgcmVjdCBjZW50ZXJlZCBvbiBkZXZpY2VYIGFuZCBkZXZpY2VZIGFuZCBjbGlwcGVkIHRvIGRldmljZVxuLy8gUmV0dXJucyBudWxsIGlmIHBpeGVsIGlzIG91dHNpZGUgb2YgZGV2aWNlXG5mdW5jdGlvbiBnZXRQaWNraW5nUmVjdCh7ZGV2aWNlWCwgZGV2aWNlWSwgZGV2aWNlUmFkaXVzLCBkZXZpY2VXaWR0aCwgZGV2aWNlSGVpZ2h0fSkge1xuICBjb25zdCB2YWxpZCA9XG4gICAgZGV2aWNlWCA+PSAwICYmXG4gICAgZGV2aWNlWSA+PSAwICYmXG4gICAgZGV2aWNlWCA8IGRldmljZVdpZHRoICYmXG4gICAgZGV2aWNlWSA8IGRldmljZUhlaWdodDtcblxuICAvLyB4LCB5IG91dCBvZiBib3VuZHMuXG4gIGlmICghdmFsaWQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIENyZWF0ZSBhIGJveCBvZiBzaXplIGByYWRpdXMgKiAyICsgMWAgY2VudGVyZWQgYXQgW2RldmljZVgsIGRldmljZVldXG4gIGNvbnN0IHggPSBNYXRoLm1heCgwLCBkZXZpY2VYIC0gZGV2aWNlUmFkaXVzKTtcbiAgY29uc3QgeSA9IE1hdGgubWF4KDAsIGRldmljZVkgLSBkZXZpY2VSYWRpdXMpO1xuICBjb25zdCB3aWR0aCA9IE1hdGgubWluKGRldmljZVdpZHRoLCBkZXZpY2VYICsgZGV2aWNlUmFkaXVzKSAtIHggKyAxO1xuICBjb25zdCBoZWlnaHQgPSBNYXRoLm1pbihkZXZpY2VIZWlnaHQsIGRldmljZVkgKyBkZXZpY2VSYWRpdXMpIC0geSArIDE7XG5cbiAgcmV0dXJuIHt4LCB5LCB3aWR0aCwgaGVpZ2h0fTtcbn1cblxuLy8gVE9ETyAtIGJyZWFrIHRoaXMgbW9uc3RlciBmdW5jdGlvbiBpbnRvIDMrIHBhcnRzXG5mdW5jdGlvbiBwcm9jZXNzUGlja0luZm8oe1xuICBwaWNrSW5mbywgbGFzdFBpY2tlZEluZm8sIG1vZGUsIGxheWVycywgdmlld3BvcnRzLCB4LCB5LCBkZXZpY2VYLCBkZXZpY2VZLCBwaXhlbFJhdGlvXG59KSB7XG4gIGNvbnN0IHtcbiAgICBwaWNrZWRDb2xvcixcbiAgICBwaWNrZWRMYXllcixcbiAgICBwaWNrZWRPYmplY3RJbmRleFxuICB9ID0gcGlja0luZm87XG5cbiAgY29uc3QgYWZmZWN0ZWRMYXllcnMgPSBwaWNrZWRMYXllciA/IFtwaWNrZWRMYXllcl0gOiBbXTtcblxuICBpZiAobW9kZSA9PT0gJ2hvdmVyJykge1xuICAgIC8vIG9ubHkgaW52b2tlIG9uSG92ZXIgZXZlbnRzIGlmIHBpY2tlZCBvYmplY3QgaGFzIGNoYW5nZWRcbiAgICBjb25zdCBsYXN0UGlja2VkT2JqZWN0SW5kZXggPSBsYXN0UGlja2VkSW5mby5pbmRleDtcbiAgICBjb25zdCBsYXN0UGlja2VkTGF5ZXJJZCA9IGxhc3RQaWNrZWRJbmZvLmxheWVySWQ7XG4gICAgY29uc3QgcGlja2VkTGF5ZXJJZCA9IHBpY2tlZExheWVyICYmIHBpY2tlZExheWVyLnByb3BzLmlkO1xuXG4gICAgLy8gcHJvY2VlZCBvbmx5IGlmIHBpY2tlZCBvYmplY3QgY2hhbmdlZFxuICAgIGlmIChwaWNrZWRMYXllcklkICE9PSBsYXN0UGlja2VkTGF5ZXJJZCB8fCBwaWNrZWRPYmplY3RJbmRleCAhPT0gbGFzdFBpY2tlZE9iamVjdEluZGV4KSB7XG4gICAgICBpZiAocGlja2VkTGF5ZXJJZCAhPT0gbGFzdFBpY2tlZExheWVySWQpIHtcbiAgICAgICAgLy8gV2UgY2Fubm90IHN0b3JlIGEgcmVmIHRvIGxhc3RQaWNrZWRMYXllciBpbiB0aGUgY29udGV4dCBiZWNhdXNlXG4gICAgICAgIC8vIHRoZSBzdGF0ZSBvZiBhbiBvdXRkYXRlZCBsYXllciBpcyBubyBsb25nZXIgdmFsaWRcbiAgICAgICAgLy8gYW5kIHRoZSBwcm9wcyBtYXkgaGF2ZSBjaGFuZ2VkXG4gICAgICAgIGNvbnN0IGxhc3RQaWNrZWRMYXllciA9IGxheWVycy5maW5kKGxheWVyID0+IGxheWVyLnByb3BzLmlkID09PSBsYXN0UGlja2VkTGF5ZXJJZCk7XG4gICAgICAgIGlmIChsYXN0UGlja2VkTGF5ZXIpIHtcbiAgICAgICAgICAvLyBMZXQgbGVhdmUgZXZlbnQgZmlyZSBiZWZvcmUgZW50ZXIgZXZlbnRcbiAgICAgICAgICBhZmZlY3RlZExheWVycy51bnNoaWZ0KGxhc3RQaWNrZWRMYXllcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIGxheWVyIG1hbmFnZXIgY29udGV4dFxuICAgICAgbGFzdFBpY2tlZEluZm8ubGF5ZXJJZCA9IHBpY2tlZExheWVySWQ7XG4gICAgICBsYXN0UGlja2VkSW5mby5pbmRleCA9IHBpY2tlZE9iamVjdEluZGV4O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHZpZXdwb3J0ID0gZ2V0Vmlld3BvcnRGcm9tQ29vcmRpbmF0ZXMoe3ZpZXdwb3J0c30pOyAvLyBUT0RPIC0gYWRkIGNvb3Jkc1xuXG4gIGNvbnN0IGJhc2VJbmZvID0gY3JlYXRlSW5mbyhbeCwgeV0sIHZpZXdwb3J0KTtcbiAgYmFzZUluZm8uZGV2aWNlUGl4ZWwgPSBbZGV2aWNlWCwgZGV2aWNlWV07XG4gIGJhc2VJbmZvLnBpeGVsUmF0aW8gPSBwaXhlbFJhdGlvO1xuXG4gIC8vIFVzZSBhIE1hcCB0byBzdG9yZSBhbGwgcGlja2luZyBpbmZvcy5cbiAgLy8gVGhlIGZvbGxvd2luZyB0d28gZm9yRWFjaCBsb29wcyBhcmUgdGhlIHJlc3VsdCBvZlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdWJlci9kZWNrLmdsL2lzc3Vlcy80NDNcbiAgLy8gUGxlYXNlIGJlIHZlcnkgY2FyZWZ1bCB3aGVuIGNoYW5naW5nIHRoaXMgcGF0dGVyblxuICBjb25zdCBpbmZvcyA9IG5ldyBNYXAoKTtcblxuICBhZmZlY3RlZExheWVycy5mb3JFYWNoKGxheWVyID0+IHtcbiAgICBsZXQgaW5mbyA9IE9iamVjdC5hc3NpZ24oe30sIGJhc2VJbmZvKTtcblxuICAgIGlmIChsYXllciA9PT0gcGlja2VkTGF5ZXIpIHtcbiAgICAgIGluZm8uY29sb3IgPSBwaWNrZWRDb2xvcjtcbiAgICAgIGluZm8uaW5kZXggPSBwaWNrZWRPYmplY3RJbmRleDtcbiAgICAgIGluZm8ucGlja2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbmZvID0gZ2V0TGF5ZXJQaWNraW5nSW5mbyh7bGF5ZXIsIGluZm8sIG1vZGV9KTtcblxuICAgIC8vIFRoaXMgZ3VhcmFudGVlcyB0aGF0IHRoZXJlIHdpbGwgYmUgb25seSBvbmUgY29weSBvZiBpbmZvIGZvclxuICAgIC8vIG9uZSBjb21wb3NpdGUgbGF5ZXJcbiAgICBpZiAoaW5mbykge1xuICAgICAgaW5mb3Muc2V0KGluZm8ubGF5ZXIuaWQsIGluZm8pO1xuICAgIH1cblxuICAgIGNvbnN0IHBpY2tpbmdTZWxlY3RlZENvbG9yID0gKFxuICAgICAgbGF5ZXIucHJvcHMuYXV0b0hpZ2hsaWdodCAmJlxuICAgICAgcGlja2VkTGF5ZXIgPT09IGxheWVyXG4gICAgKSA/IHBpY2tlZENvbG9yIDogbnVsbDtcblxuICAgIGNvbnN0IHBpY2tpbmdQYXJhbWV0ZXJzID0ge1xuICAgICAgcGlja2luZ1NlbGVjdGVkQ29sb3JcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBtb2RlbCBvZiBsYXllci5nZXRNb2RlbHMoKSkge1xuICAgICAgbW9kZWwudXBkYXRlTW9kdWxlU2V0dGluZ3MocGlja2luZ1BhcmFtZXRlcnMpO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgdW5oYW5kbGVkUGlja0luZm9zID0gY2FsbExheWVyUGlja2luZ0NhbGxiYWNrcyhpbmZvcywgbW9kZSk7XG5cbiAgcmV0dXJuIHVuaGFuZGxlZFBpY2tJbmZvcztcbn1cblxuLy8gUGVyLWxheWVyIGV2ZW50IGhhbmRsZXJzIChlLmcuIG9uQ2xpY2ssIG9uSG92ZXIpIGFyZSBwcm92aWRlZCBieSB0aGVcbi8vIHVzZXIgYW5kIG91dCBvZiBkZWNrLmdsJ3MgY29udHJvbC4gSXQncyB2ZXJ5IG11Y2ggcG9zc2libGUgdGhhdFxuLy8gdGhlIHVzZXIgY2FsbHMgUmVhY3QgbGlmZWN5Y2xlIG1ldGhvZHMgaW4gdGhlc2UgZnVuY3Rpb24sIHN1Y2ggYXNcbi8vIFJlYWN0Q29tcG9uZW50LnNldFN0YXRlKCkuIFJlYWN0IGxpZmVjeWNsZSBtZXRob2RzIHNvbWV0aW1lcyBpbmR1Y2Vcbi8vIGEgcmUtcmVuZGVyIGFuZCByZS1nZW5lcmF0aW9uIG9mIHByb3BzIG9mIGRlY2suZ2wgYW5kIGl0cyBsYXllcnMsXG4vLyB3aGljaCBpbnZhbGlkYXRlcyBhbGwgbGF5ZXJzIGN1cnJlbnRseSBwYXNzZWQgdG8gdGhpcyB2ZXJ5IGZ1bmN0aW9uLlxuXG4vLyBUaGVyZWZvcmUsIHBlci1sYXllciBldmVudCBoYW5kbGVycyBtdXN0IGJlIGludm9rZWQgYXQgdGhlIGVuZFxuLy8gb2YgdGhlIHBpY2tpbmcgb3BlcmF0aW9uLiBOTyBvcGVyYXRpb24gdGhhdCByZWxpZXMgb24gdGhlIHN0YXRlcyBvZiBjdXJyZW50XG4vLyBsYXllcnMgc2hvdWxkIGJlIGNhbGxlZCBhZnRlciB0aGlzIGNvZGUuXG5mdW5jdGlvbiBjYWxsTGF5ZXJQaWNraW5nQ2FsbGJhY2tzKGluZm9zLCBtb2RlKSB7XG4gIGNvbnN0IHVuaGFuZGxlZFBpY2tJbmZvcyA9IFtdO1xuXG4gIGluZm9zLmZvckVhY2goaW5mbyA9PiB7XG4gICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICBjYXNlICdjbGljayc6IGhhbmRsZWQgPSBpbmZvLmxheWVyLnByb3BzLm9uQ2xpY2soaW5mbyk7IGJyZWFrO1xuICAgIGNhc2UgJ2hvdmVyJzogaGFuZGxlZCA9IGluZm8ubGF5ZXIucHJvcHMub25Ib3ZlcihpbmZvKTsgYnJlYWs7XG4gICAgY2FzZSAncXVlcnknOiBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gcGljayB0eXBlJyk7XG4gICAgfVxuXG4gICAgaWYgKCFoYW5kbGVkKSB7XG4gICAgICB1bmhhbmRsZWRQaWNrSW5mb3MucHVzaChpbmZvKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB1bmhhbmRsZWRQaWNrSW5mb3M7XG59XG5cbi8qKlxuICogUGljayBhdCBhIHNwZWNpZmllZCBwaXhlbCB3aXRoIGEgdG9sZXJhbmNlIHJhZGl1c1xuICogUmV0dXJucyB0aGUgY2xvc2VzdCBvYmplY3QgdG8gdGhlIHBpeGVsIGluIHNoYXBlIGB7cGlja2VkQ29sb3IsIHBpY2tlZExheWVyLCBwaWNrZWRPYmplY3RJbmRleH1gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbG9zZXN0RnJvbVBpY2tpbmdCdWZmZXIoZ2wsIHtcbiAgcGlja2VkQ29sb3JzLFxuICBsYXllcnMsXG4gIGRldmljZVgsXG4gIGRldmljZVksXG4gIGRldmljZVJhZGl1cyxcbiAgZGV2aWNlUmVjdFxufSkge1xuICBhc3NlcnQocGlja2VkQ29sb3JzKTtcblxuICAvLyBUcmF2ZXJzZSBhbGwgcGl4ZWxzIGluIHBpY2tpbmcgcmVzdWx0cyBhbmQgZmluZCB0aGUgb25lIGNsb3Nlc3QgdG8gdGhlIHN1cHBsaWVkXG4gIC8vIFtkZXZpY2VYLCBkZXZpY2VZXVxuICBjb25zdCB7eCwgeSwgd2lkdGgsIGhlaWdodH0gPSBkZXZpY2VSZWN0O1xuICBsZXQgbWluU3F1YXJlRGlzdGFuY2VUb0NlbnRlciA9IGRldmljZVJhZGl1cyAqIGRldmljZVJhZGl1cztcbiAgbGV0IGNsb3Nlc3RQaXhlbEluZGV4ID0gLTE7XG4gIGxldCBpID0gMDtcblxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBoZWlnaHQ7IHJvdysrKSB7XG4gICAgY29uc3QgZHkgPSByb3cgKyB5IC0gZGV2aWNlWTtcbiAgICBjb25zdCBkeTIgPSBkeSAqIGR5O1xuXG4gICAgaWYgKGR5MiA+IG1pblNxdWFyZURpc3RhbmNlVG9DZW50ZXIpIHtcbiAgICAgIC8vIHNraXAgdGhpcyByb3dcbiAgICAgIGkgKz0gNCAqIHdpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB3aWR0aDsgY29sKyspIHtcbiAgICAgICAgLy8gRGVjb2RlIHBpY2tlZCBsYXllciBmcm9tIGNvbG9yXG4gICAgICAgIGNvbnN0IHBpY2tlZExheWVySW5kZXggPSBwaWNrZWRDb2xvcnNbaSArIDNdIC0gMTtcblxuICAgICAgICBpZiAocGlja2VkTGF5ZXJJbmRleCA+PSAwKSB7XG4gICAgICAgICAgY29uc3QgZHggPSBjb2wgKyB4IC0gZGV2aWNlWDtcbiAgICAgICAgICBjb25zdCBkMiA9IGR4ICogZHggKyBkeTI7XG5cbiAgICAgICAgICBpZiAoZDIgPD0gbWluU3F1YXJlRGlzdGFuY2VUb0NlbnRlcikge1xuICAgICAgICAgICAgbWluU3F1YXJlRGlzdGFuY2VUb0NlbnRlciA9IGQyO1xuICAgICAgICAgICAgY2xvc2VzdFBpeGVsSW5kZXggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpICs9IDQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGNsb3Nlc3RQaXhlbEluZGV4ID49IDApIHtcbiAgICAvLyBEZWNvZGUgcGlja2VkIG9iamVjdCBpbmRleCBmcm9tIGNvbG9yXG4gICAgY29uc3QgcGlja2VkTGF5ZXJJbmRleCA9IHBpY2tlZENvbG9yc1tjbG9zZXN0UGl4ZWxJbmRleCArIDNdIC0gMTtcbiAgICBjb25zdCBwaWNrZWRDb2xvciA9IHBpY2tlZENvbG9ycy5zbGljZShjbG9zZXN0UGl4ZWxJbmRleCwgY2xvc2VzdFBpeGVsSW5kZXggKyA0KTtcbiAgICBjb25zdCBwaWNrZWRMYXllciA9IGxheWVyc1twaWNrZWRMYXllckluZGV4XTtcbiAgICBpZiAocGlja2VkTGF5ZXIpIHtcbiAgICAgIGNvbnN0IHBpY2tlZE9iamVjdEluZGV4ID0gcGlja2VkTGF5ZXIuZGVjb2RlUGlja2luZ0NvbG9yKHBpY2tlZENvbG9yKTtcbiAgICAgIHJldHVybiB7cGlja2VkQ29sb3IsIHBpY2tlZExheWVyLCBwaWNrZWRPYmplY3RJbmRleH07XG4gICAgfVxuICAgIGxvZy5lcnJvcignUGlja2VkIG5vbi1leGlzdGVudCBsYXllci4gSXMgcGlja2luZyBidWZmZXIgY29ycnVwdD8nKTtcbiAgfVxuXG4gIHJldHVybiBOT19QSUNLRURfT0JKRUNUO1xufVxuLyogZXNsaW50LWVuYWJsZSBtYXgtZGVwdGgsIG1heC1zdGF0ZW1lbnRzICovXG5cbi8qKlxuICogRXhhbWluZXMgYSBwaWNraW5nIGJ1ZmZlciBmb3IgdW5pcXVlIGNvbG9yc1xuICogUmV0dXJucyBhcnJheSBvZiB1bmlxdWUgb2JqZWN0cyBpbiBzaGFwZSBge3gsIHksIHBpY2tlZENvbG9yLCBwaWNrZWRMYXllciwgcGlja2VkT2JqZWN0SW5kZXh9YFxuICovXG5mdW5jdGlvbiBnZXRVbmlxdWVzRnJvbVBpY2tpbmdCdWZmZXIoZ2wsIHtwaWNrZWRDb2xvcnMsIGxheWVyc30pIHtcbiAgY29uc3QgdW5pcXVlQ29sb3JzID0gbmV3IE1hcCgpO1xuXG4gIC8vIFRyYXZlcnNlIGFsbCBwaXhlbHMgaW4gcGlja2luZyByZXN1bHRzIGFuZCBnZXQgdW5pcXVlIGNvbG9yc1xuICBpZiAocGlja2VkQ29sb3JzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaWNrZWRDb2xvcnMubGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgIC8vIERlY29kZSBwaWNrZWQgbGF5ZXIgZnJvbSBjb2xvclxuICAgICAgY29uc3QgcGlja2VkTGF5ZXJJbmRleCA9IHBpY2tlZENvbG9yc1tpICsgM10gLSAxO1xuXG4gICAgICBpZiAocGlja2VkTGF5ZXJJbmRleCA+PSAwKSB7XG4gICAgICAgIGNvbnN0IHBpY2tlZENvbG9yID0gcGlja2VkQ29sb3JzLnNsaWNlKGksIGkgKyA0KTtcbiAgICAgICAgY29uc3QgY29sb3JLZXkgPSBwaWNrZWRDb2xvci5qb2luKCcsJyk7XG4gICAgICAgIGlmICghdW5pcXVlQ29sb3JzLmhhcyhjb2xvcktleSkpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICAgIGNvbnN0IHBpY2tlZExheWVyID0gbGF5ZXJzW3BpY2tlZExheWVySW5kZXhdO1xuICAgICAgICAgIGlmIChwaWNrZWRMYXllcikgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgICAgICB1bmlxdWVDb2xvcnMuc2V0KGNvbG9yS2V5LCB7XG4gICAgICAgICAgICAgIHBpY2tlZENvbG9yLFxuICAgICAgICAgICAgICBwaWNrZWRMYXllcixcbiAgICAgICAgICAgICAgcGlja2VkT2JqZWN0SW5kZXg6IHBpY2tlZExheWVyLmRlY29kZVBpY2tpbmdDb2xvcihwaWNrZWRDb2xvcilcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoJ1BpY2tlZCBub24tZXhpc3RlbnQgbGF5ZXIuIElzIHBpY2tpbmcgYnVmZmVyIGNvcnJ1cHQ/Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIEFycmF5LmZyb20odW5pcXVlQ29sb3JzLnZhbHVlcygpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSW5mbyhwaXhlbCwgdmlld3BvcnQpIHtcbiAgLy8gQXNzaWduIGEgbnVtYmVyIG9mIHBvdGVudGlhbGx5IHVzZWZ1bCBwcm9wcyB0byB0aGUgXCJpbmZvXCIgb2JqZWN0XG4gIHJldHVybiB7XG4gICAgY29sb3I6IG51bGwsXG4gICAgbGF5ZXI6IG51bGwsXG4gICAgaW5kZXg6IC0xLFxuICAgIHBpY2tlZDogZmFsc2UsXG4gICAgeDogcGl4ZWxbMF0sXG4gICAgeTogcGl4ZWxbMV0sXG4gICAgcGl4ZWwsXG4gICAgbG5nTGF0OiB2aWV3cG9ydC51bnByb2plY3QocGl4ZWwpXG4gIH07XG59XG5cbi8vIFdhbGsgdXAgdGhlIGxheWVyIGNvbXBvc2l0ZSBjaGFpbiB0byBwb3B1bGF0ZSB0aGUgaW5mbyBvYmplY3RcbmZ1bmN0aW9uIGdldExheWVyUGlja2luZ0luZm8oe2xheWVyLCBpbmZvLCBtb2RlfSkge1xuICB3aGlsZSAobGF5ZXIgJiYgaW5mbykge1xuICAgIC8vIEZvciBhIGNvbXBvc2l0ZSBsYXllciwgc291cmNlTGF5ZXIgd2lsbCBwb2ludCB0byB0aGUgc3VibGF5ZXJcbiAgICAvLyB3aGVyZSB0aGUgZXZlbnQgb3JpZ2luYXRlcyBmcm9tLlxuICAgIC8vIEl0IHByb3ZpZGVzIGFkZGl0aW9uYWwgY29udGV4dCBmb3IgdGhlIGNvbXBvc2l0ZSBsYXllcidzXG4gICAgLy8gZ2V0UGlja2luZ0luZm8oKSBtZXRob2QgdG8gcG9wdWxhdGUgdGhlIGluZm8gb2JqZWN0XG4gICAgY29uc3Qgc291cmNlTGF5ZXIgPSBpbmZvLmxheWVyIHx8IGxheWVyO1xuICAgIGluZm8ubGF5ZXIgPSBsYXllcjtcbiAgICAvLyBsYXllci5waWNrTGF5ZXIoKSBmdW5jdGlvbiByZXF1aXJlcyBhIG5vbi1udWxsIGBgYGxheWVyLnN0YXRlYGBgXG4gICAgLy8gb2JqZWN0IHRvIGZ1bnRpb24gcHJvcGVybHkuIFNvIHRoZSBsYXllciByZWZlcmVjZWQgaGVyZVxuICAgIC8vIG11c3QgYmUgdGhlIFwiY3VycmVudFwiIGxheWVyLCBub3QgYW4gXCJvdXQtZGF0ZWRcIiAvIFwiaW52YWxpZGF0ZWRcIiBsYXllclxuICAgIGluZm8gPSBsYXllci5waWNrTGF5ZXIoe2luZm8sIG1vZGUsIHNvdXJjZUxheWVyfSk7XG4gICAgbGF5ZXIgPSBsYXllci5wYXJlbnRMYXllcjtcbiAgfVxuICByZXR1cm4gaW5mbztcbn1cbiJdfQ==