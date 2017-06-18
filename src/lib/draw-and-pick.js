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

/* global window */
import {GL, withParameters} from 'luma.gl';
import {getUniformsFromViewport} from './viewport-uniforms';
import {log} from './utils';

// Note: corresponding touch events, once supported, should be included here as well.
const MOTION_EVENTS = [
  'dragmove',
  'dragend'
];
const EMPTY_PIXEL = new Uint8Array(4);
let renderCount = 0;

export function drawLayers({layers, pass}) {
  // render layers in normal colors
  let visibleCount = 0;
  let compositeCount = 0;
  // render layers in normal colors
  layers.forEach((layer, layerIndex) => {
    if (layer.isComposite) {
      compositeCount++;
    } else if (layer.props.visible) {
      layer.drawLayer({
        uniforms: Object.assign(
          {renderPickingBuffer: 0, pickingEnabled: 0},
          layer.context.uniforms,
          getUniformsFromViewport(layer.context.viewport, layer.props),
          {layerIndex}
        )
      });
      visibleCount++;
    }
  });
  const totalCount = layers.length;
  const primitiveCount = totalCount - compositeCount;
  const hiddenCount = primitiveCount - visibleCount;

  const message = `\
#${renderCount++}: Rendering ${visibleCount} of ${totalCount} layers ${pass} \
(${hiddenCount} hidden, ${compositeCount} composite)`;

  log.log(2, message);
}

// Pick all objects within the given bounding box
export function queryLayers(gl, {
  layers,
  pickingFBO,
  x,
  y,
  width,
  height,
  viewport,
  mode
}) {

  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const deviceLeft = Math.round(x * pixelRatio);
  const deviceBottom = Math.round(gl.canvas.height - y * pixelRatio);
  const deviceRight = Math.round((x + width) * pixelRatio);
  const deviceTop = Math.round(gl.canvas.height - (y + height) * pixelRatio);

  const pickInfos = getUniquesFromPickingBuffer(gl, {
    layers,
    pickingFBO,
    deviceRect: {
      x: deviceLeft,
      y: deviceTop,
      width: deviceRight - deviceLeft,
      height: deviceBottom - deviceTop
    }
  });

  // Only return unique infos, identified by info.object
  const uniqueInfos = new Map();

  pickInfos.forEach(pickInfo => {
    let info = createInfo([pickInfo.x / pixelRatio, pickInfo.y / pixelRatio], viewport);
    info.devicePixel = [pickInfo.x, pickInfo.y];
    info.pixelRatio = pixelRatio;
    info.color = pickInfo.pickedColor;
    info.index = pickInfo.pickedObjectIndex;
    info.picked = true;

    info = getLayerPickingInfo({layer: pickInfo.pickedLayer, info, mode});
    if (!uniqueInfos.has(info.object)) {
      uniqueInfos.set(info.object, info);
    }
  });

  return Array.from(uniqueInfos.values());
}

/* eslint-disable max-depth, max-statements */
// Pick the closest object at the given (x,y) coordinate
export function pickLayers(gl, {
  layers,
  pickingFBO,
  x,
  y,
  radius,
  viewport,
  mode,
  lastPickedInfo
}) {

  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
  const deviceX = Math.round(x * pixelRatio);
  const deviceY = Math.round(gl.canvas.height - y * pixelRatio);
  const deviceRadius = Math.round(radius * pixelRatio);

  let pickedColor;
  let pickedLayer;
  let pickedObjectIndex;
  let affectedLayers = [];

  if (MOTION_EVENTS.indexOf(mode) !== -1) {
    // "Motion events" are those that track the motion of an interaction
    // after its initiation. In this case, these subsequent events
    // should be bound to the object that was first picked,
    // e.g. to enable dragging behaviors.
    // Therefore, the picking process does not run for these events.
    const {layerId} = lastPickedInfo;
    pickedLayer = layers.find(layer => layer.props.id === layerId);
    if (pickedLayer) {
      pickedColor = lastPickedInfo.color;
      pickedObjectIndex = lastPickedInfo.index;
      affectedLayers.push(pickedLayer);
    }

  } else {
    // For all other events, run picking process normally.
    const pickInfo = getClosestFromPickingBuffer(gl, {
      layers,
      pickingFBO,
      deviceX,
      deviceY,
      deviceRadius
    });

    pickedColor = pickInfo.pickedColor;
    pickedLayer = pickInfo.pickedLayer;
    pickedObjectIndex = pickInfo.pickedObjectIndex;
    affectedLayers = pickedLayer ? [pickedLayer] : [];

    if (mode === 'hover') {
      // only invoke onHover events if picked object has changed
      const lastPickedObjectIndex = lastPickedInfo.index;
      const lastPickedLayerId = lastPickedInfo.layerId;
      const pickedLayerId = pickedLayer && pickedLayer.props.id;

      // proceed only if picked object changed
      if (pickedLayerId !== lastPickedLayerId || pickedObjectIndex !== lastPickedObjectIndex) {
        if (pickedLayerId !== lastPickedLayerId) {
          // We cannot store a ref to lastPickedLayer in the context because
          // the state of an outdated layer is no longer valid
          // and the props may have changed
          const lastPickedLayer = layers.find(layer => layer.props.id === lastPickedLayerId);
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
  }

  const baseInfo = createInfo([x, y], viewport);
  baseInfo.devicePixel = [deviceX, deviceY];
  baseInfo.pixelRatio = pixelRatio;

  // Use a Map to store all picking infos.
  // The following two forEach loops are the result of
  // https://github.com/uber/deck.gl/issues/443
  // Please be very careful when changing this pattern
  const infos = new Map();
  const unhandledPickInfos = [];

  affectedLayers.forEach(layer => {
    let info = Object.assign({}, baseInfo);

    if (layer === pickedLayer) {
      info.color = pickedColor;
      info.index = pickedObjectIndex;
      info.picked = true;
    }

    info = getLayerPickingInfo({layer, info, mode});

    // This guarantees that there will be only one copy of info for
    // one composite layer
    if (info) {
      infos.set(info.layer.id, info);
    }
  });

  infos.forEach(info => {
    let handled = false;
    // The onClick and onHover functions are provided by the user
    // and out of control by deck.gl. It's very much possible that
    // the user calls React lifecycle methods in these function, such as
    // ReactComponent.setState(). React lifecycle methods sometimes induce
    // a re-render and re-generation of props of deck.gl and its layers,
    // which invalidates all layers currently passed to this very function.

    // Therefore, calls to functions like onClick and onHover need to be done
    // at the end of the function. NO operation relies on the states of current
    // layers should be called after this code.
    switch (mode) {
    case 'click': handled = info.layer.props.onClick(info); break;
    case 'dragstart': handled = info.layer.props.onDragStart(info); break;
    case 'dragmove': handled = info.layer.props.onDragMove(info); break;
    case 'dragend': handled = info.layer.props.onDragEnd(info); break;
    case 'dragcancel': handled = info.layer.props.onDragCancel(info); break;
    case 'hover': handled = info.layer.props.onHover(info); break;
    case 'query': break;
    default: throw new Error('unknown pick type');
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
function getClosestFromPickingBuffer(gl, {
  layers,
  pickingFBO,
  deviceX,
  deviceY,
  deviceRadius
}) {
  // Create a box of size `radius * 2 + 1` centered at [deviceX, deviceY]
  const x = Math.max(0, deviceX - deviceRadius);
  const y = Math.max(0, deviceY - deviceRadius);
  const width = Math.min(pickingFBO.width, deviceX + deviceRadius) - x + 1;
  const height = Math.min(pickingFBO.height, deviceY + deviceRadius) - y + 1;

  const pickedColors = getPickedColors(gl, {layers, pickingFBO, deviceRect: {x, y, width, height}});

  // Traverse all pixels in picking results and find the one closest to the supplied
  // [deviceX, deviceY]
  let minSquareDistanceToCenter = deviceRadius * deviceRadius;
  let closestResultToCenter = {
    pickedColor: EMPTY_PIXEL,
    pickedLayer: null,
    pickedObjectIndex: -1
  };
  let i = 0;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      // Decode picked layer from color
      const pickedLayerIndex = pickedColors[i + 3] - 1;

      if (pickedLayerIndex >= 0) {
        const dx = col + x - deviceX;
        const dy = row + y - deviceY;
        const d2 = dx * dx + dy * dy;

        if (d2 <= minSquareDistanceToCenter) {
          minSquareDistanceToCenter = d2;

          // Decode picked object index from color
          const pickedColor = pickedColors.slice(i, i + 4);
          const pickedLayer = layers[pickedLayerIndex];
          const pickedObjectIndex = pickedLayer.decodePickingColor(pickedColor);
          closestResultToCenter = {pickedColor, pickedLayer, pickedObjectIndex};
        }
      }
      i += 4;
    }
  }

  return closestResultToCenter;
}
/* eslint-enable max-depth, max-statements */

/**
 * Query within a specified rectangle
 * Returns array of unique objects in shape `{x, y, pickedColor, pickedLayer, pickedObjectIndex}`
 */
function getUniquesFromPickingBuffer(gl, {
  layers,
  pickingFBO,
  deviceRect: {x, y, width, height}
}) {
  const pickedColors = getPickedColors(gl, {layers, pickingFBO, deviceRect: {x, y, width, height}});
  const uniqueColors = new Map();

  // Traverse all pixels in picking results and get unique colors
  for (let i = 0; i < pickedColors.length; i += 4) {
    // Decode picked layer from color
    const pickedLayerIndex = pickedColors[i + 3] - 1;

    if (pickedLayerIndex >= 0) {
      const pickedColor = pickedColors.slice(i, i + 4);
      const colorKey = pickedColor.join(',');
      if (!uniqueColors.has(colorKey)) {
        const pickedLayer = layers[pickedLayerIndex];
        uniqueColors.set(colorKey, {
          pickedColor,
          pickedLayer,
          pickedObjectIndex: pickedLayer.decodePickingColor(pickedColor)
        });
      }
    }
  }

  return Array.from(uniqueColors.values());
}

// Returns an Uint8ClampedArray of picked pixels
function getPickedColors(gl, {
  layers,
  pickingFBO,
  deviceRect: {x, y, width, height}
}) {
  // Make sure we clear scissor test and fbo bindings in case of exceptions
  // We are only interested in one pixel, no need to render anything else
  // Note that the callback here is called synchronously.
  return withParameters(gl, {
    frameBuffer: pickingFBO,
    scissorTest: true,
    scissor: [x, y, width, height],
    blend: true,
    blendFunc: [gl.ONE, gl.ZERO, gl.CONSTANT_ALPHA, gl.ZERO],
    blendEquation: gl.FUNC_ADD
    // TODO - Set clear color
  }, () => {

    // Clear the frame buffer
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    // Save current blend settings
    // const oldBlendMode = getBlendMode(gl);
    // Set blend mode for picking
    // always overwrite existing pixel with [r,g,b,layerIndex]
    // gl.enable(gl.BLEND);
    // gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.CONSTANT_ALPHA, gl.ZERO);
    // gl.blendEquation(gl.FUNC_ADD);

    // Render all pickable layers in picking colors
    layers.forEach((layer, layerIndex) => {
      if (!layer.isComposite && layer.props.visible && layer.props.pickable) {

        // Encode layerIndex with alpha
        gl.blendColor(0, 0, 0, (layerIndex + 1) / 255);

        layer.drawLayer({
          uniforms: Object.assign(
            {renderPickingBuffer: 1, pickingEnabled: 1},
            layer.context.uniforms,
            getUniformsFromViewport(layer.context.viewport, layer.props),
            {layerIndex}
          )
        });
      }
    });

    // Read color in the central pixel, to be mapped with picking colors
    const pickedColors = new Uint8Array(width * height * 4);
    gl.readPixels(x, y, width, height, GL.RGBA, GL.UNSIGNED_BYTE, pickedColors);

    // restore blend mode
    // setBlendMode(gl, oldBlendMode);

    return pickedColors;
  });
}

function createInfo(pixel, viewport) {
  // Assign a number of potentially useful props to the "info" object
  return {
    color: EMPTY_PIXEL,
    layer: null,
    index: -1,
    picked: false,
    x: pixel[0],
    y: pixel[1],
    pixel,
    lngLat: viewport.unproject(pixel)
  };
}

// Walk up the layer composite chain to populate the info object
function getLayerPickingInfo({layer, info, mode}) {
  while (layer && info) {
    // For a composite layer, sourceLayer will point to the sublayer
    // where the event originates from.
    // It provides additional context for the composite layer's
    // getPickingInfo() method to populate the info object
    const sourceLayer = info.layer || layer;
    info.layer = layer;
    // layer.pickLayer() function requires a non-null ```layer.state```
    // object to funtion properly. So the layer refereced here
    // must be the "current" layer, not an "out-dated" / "invalidated" layer
    info = layer.pickLayer({info, mode, sourceLayer});
    layer = layer.parentLayer;
  }
  return info;
}
