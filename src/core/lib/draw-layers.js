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
import {GL, withParameters, setParameters} from 'luma.gl';
import {log} from './utils';

let renderCount = 0;

// TODO - Exported for pick-layers.js - Move to util?
export const getPixelRatio = ({useDevicePixelRatio}) =>
  useDevicePixelRatio && typeof window !== 'undefined' ? window.devicePixelRatio : 1;

// Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
const getGLViewport = (gl, {viewport, pixelRatio}) => {
  const width = gl.canvas.clientWidth;
  const height = gl.canvas.clientHeight;
  // Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
  const dimensions = viewport.getDimensions({width, height});
  return [
    dimensions.x * pixelRatio,
    (height - dimensions.y - dimensions.height) * pixelRatio,
    dimensions.width * pixelRatio,
    dimensions.height * pixelRatio
  ];
};

// Helper functions

function clearCanvas(gl, {useDevicePixelRatio}) {
  // const pixelRatio = getPixelRatio({useDevicePixelRatio});
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  // clear depth and color buffers, restoring transparency
  withParameters(gl, {viewport: [0, 0, width, height]}, () => {
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  });
}

// Draw a list of layers in a list of viewports
export function drawLayers(gl, {
  layers,
  viewports,
  onViewportActive,
  useDevicePixelRatio,
  drawPickingColors = false,
  deviceRect = null,
  parameters = {},
  pass = 'draw'
}) {
  clearCanvas(gl, {useDevicePixelRatio});

  // effectManager.preDraw();

  viewports.forEach((viewportOrDescriptor, i) => {
    const viewport = getViewportFromDescriptor(viewportOrDescriptor);

    // Update context to point to this viewport
    onViewportActive(viewport);

    // render this viewport
    drawLayersInViewport(gl, {
      layers,
      viewport,
      useDevicePixelRatio,
      drawPickingColors,
      deviceRect,
      parameters,
      pass
    });
  });

  // effectManager.draw();
}

// Draws list of layers and viewports into the picking buffer
// Note: does not sample the buffer, that has to be done by the caller
export function drawPickingBuffer(gl, {
  layers,
  viewports,
  onViewportActive,
  useDevicePixelRatio,
  pickingFBO,
  deviceRect: {x, y, width, height}
}) {
  // Make sure we clear scissor test and fbo bindings in case of exceptions
  // We are only interested in one pixel, no need to render anything else
  // Note that the callback here is called synchronously.
  // Set blend mode for picking
  // always overwrite existing pixel with [r,g,b,layerIndex]
  return withParameters(gl, {
    framebuffer: pickingFBO,
    scissorTest: true,
    scissor: [x, y, width, height],
    clearColor: [0, 0, 0, 0]
  }, () => {

    drawLayers(gl, {
      layers,
      viewports,
      onViewportActive,
      useDevicePixelRatio,
      drawPickingColors: true,
      pass: 'picking',
      parameters: {
        blend: true,
        blendFunc: [gl.ONE, gl.ZERO, gl.CONSTANT_ALPHA, gl.ZERO],
        blendEquation: gl.FUNC_ADD,
        blendColor: [0, 0, 0, 0]
      }
    });

  });
}

// Draws a list of layers in one viewport
// TODO - when picking we could completely skip rendering viewports that dont
// intersect with the picking rect
function drawLayersInViewport(gl, {
  layers,
  viewport,
  useDevicePixelRatio,
  drawPickingColors = false,
  deviceRect = null,
  parameters = {},
  pass = 'draw'
}) {
  const pixelRatio = getPixelRatio({useDevicePixelRatio});
  const glViewport = getGLViewport(gl, {viewport, pixelRatio});

  // render layers in normal colors
  let visibleCount = 0;
  let compositeCount = 0;
  let pickableCount = 0;

  // const {x, y, width, height} = deviceRect || [];

  // TODO: Update all layers to use 'picking_uActive' (picking shader module)
  // and then remove 'renderPickingBuffer' and 'pickingEnabled'.
  const pickingUniforms = {
    picking_uActive: drawPickingColors ? 1 : 0,
    renderPickingBuffer: drawPickingColors ? 1 : 0,
    pickingEnabled: drawPickingColors ? 1 : 0
  };

  setParameters(gl, parameters || {});

  // render layers in normal colors
  layers.forEach((layer, layerIndex) => {
    if (layer.isComposite) {
      compositeCount++;
    }

    if (layer.props.pickable) {
      pickableCount++;
    }

    if (layer.props.visible && (layer.props.pickable || !drawPickingColors)) {

      visibleCount++;

      const moduleParameters = Object.assign({}, layer.props, {
        viewport: layer.context.viewport
      });

      const uniforms = Object.assign(
        pickingUniforms,
        layer.context.uniforms,
        {layerIndex}
      );

      // All parameter resolving is done here instead of the layer
      // Blend parameters must not be overriden
      const layerParameters = Object.assign({}, layer.props.parameters || {}, parameters);

      Object.assign(layerParameters, {
        viewport: glViewport
      });

      if (drawPickingColors) {
        // TODO - Disable during picking
        Object.assign(moduleParameters, getPickingModuleParameters(layer));

        Object.assign(layerParameters, {
          blendColor: [0, 0, 0, (layerIndex + 1) / 255]
        });
      }

      withParameters(gl, layerParameters, () => {
        layer.drawLayer({
          moduleParameters,
          uniforms,
          parameters: layerParameters
        });
      });
    }
  });

  const totalCount = layers.length;
  const primitiveCount = totalCount - compositeCount;
  const hiddenCount = primitiveCount - visibleCount;

  const message = `\
#${renderCount++}: Rendering ${pass} : ${visibleCount} of ${totalCount} layers \
(${hiddenCount} hidden, ${compositeCount} composite ${pickableCount} unpickable) \
DPR={pixelRatio} pick=${drawPickingColors}`;

  log.log(2, message);
}

// Get a viewport from a viewport descriptor (which can be a plain viewport)
function getViewportFromDescriptor(viewportOrDescriptor) {
  return viewportOrDescriptor.viewport ? viewportOrDescriptor.viewport : viewportOrDescriptor;
}

/**
 * Returns the picking color of currenlty selected object of the given 'layer'.
 * @return {Array} - the picking color or null if layers selected object is invalid.
 */
function getPickingModuleParameters(layer) {
  // TODO - inefficient to update settings every render?
  // TODO: Add warning if 'highlightedObjectIndex' is > numberOfInstances of the model.

  // Update picking module settings if highlightedObjectIndex is set.
  // This will overwrite any settings from auto highlighting.
  const pickingSelectedColorValid = layer.props.highlightedObjectIndex >= 0;
  if (pickingSelectedColorValid) {
    const pickingSelectedColor = layer.encodePickingColor(layer.props.highlightedObjectIndex);

    return {
      pickingSelectedColor,
      pickingSelectedColorValid
    };
  }
  return null;
}
