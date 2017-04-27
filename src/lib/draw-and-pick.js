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
import {GL, glContextWithState} from 'luma.gl';
import {getUniformsFromViewport} from './viewport-uniforms';
import {log, getBlendMode, setBlendMode} from './utils';

// Note: corresponding touch events, once supported, should be included here as well.
const MOTION_EVENTS = [
  'dragmove',
  'dragend'
];
const EMPTY_PIXEL = new Uint8Array(4);
let renderCount = 0;

export function drawLayers({layers, pass}) {
  log.log(3, `DRAWING ${layers.length} layers`);

  // render layers in normal colors
  let visibleCount = 0;
  // render layers in normal colors
  layers.forEach((layer, layerIndex) => {
    if (!layer.isComposite && layer.props.visible) {
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

  log.log(3, `RENDER PASS ${pass}: ${renderCount++}
    ${visibleCount} visible, ${layers.length} total`);
}

/* eslint-disable max-depth, max-statements */
export function pickLayers(gl, {
  layers,
  pickingFBO,
  uniforms = {},
  x,
  y,
  viewport,
  mode,
  lastPickedInfo
}) {

  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  const pixelRatio = typeof window !== 'undefined' ?
    window.devicePixelRatio : 1;
  const deviceX = x * pixelRatio;
  const deviceY = gl.canvas.height - y * pixelRatio;

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
    const pickInfo = pickFromBuffer(gl, {
      layers,
      pickingFBO,
      deviceX,
      deviceY
    });
    pickedColor = pickInfo.pickedColor;
    pickedLayer = pickInfo.pickedLayer;
    pickedObjectIndex = pickInfo.pickedObjectIndex;
    affectedLayers = pickInfo.affectedLayers;

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

    // Walk up the composite chain and find the owner of the event
    // sublayers are never directly exposed to the user
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
    default: throw new Error('unknown pick type');
    }

    if (!handled) {
      unhandledPickInfos.push(info);
    }
  });

  return unhandledPickInfos;
}
/* eslint-enable max-depth, max-statements */

function pickFromBuffer(gl, {
  layers,
  pickingFBO,
  deviceX,
  deviceY
}) {
  // TODO - just return glContextWithState once luma updates
  // Make sure we clear scissor test and fbo bindings in case of exceptions
  // We are only interested in one pixel, no need to render anything else
  // Note that the callback here is called synchronously.
  return glContextWithState(gl, {
    frameBuffer: pickingFBO,
    framebuffer: pickingFBO,
    scissorTest: {x: deviceX, y: deviceY, w: 1, h: 1}
  }, () => {

    // Clear the frame buffer
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    // Save current blend settings
    const oldBlendMode = getBlendMode(gl);
    // Set blend mode for picking
    // always overwrite existing pixel with [r,g,b,layerIndex]
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.CONSTANT_ALPHA, gl.ZERO);
    gl.blendEquation(gl.FUNC_ADD);

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
    const pickedColor = new Uint8Array(4);
    gl.readPixels(deviceX, deviceY, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, pickedColor);

    // restore blend mode
    setBlendMode(gl, oldBlendMode);

    // Decode picked color
    const pickedLayerIndex = pickedColor[3] - 1;
    const pickedLayer = pickedLayerIndex >= 0 ? layers[pickedLayerIndex] : null;
    return {
      pickedColor,
      pickedLayer,
      pickedObjectIndex: pickedLayer ? pickedLayer.decodePickingColor(pickedColor) : -1,
      affectedLayers: pickedLayer ? [pickedLayer] : []
    };
  });
}

function createInfo(pixel, viewport) {
  // Assign a number of potentially useful props to the "info" object
  return {
    color: EMPTY_PIXEL,
    index: -1,
    picked: false,
    x: pixel[0],
    y: pixel[1],
    pixel,
    lngLat: viewport.unproject(pixel)
  };
}
