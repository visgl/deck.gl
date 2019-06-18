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
import { GL, withParameters, setParameters } from 'luma.gl';
import log from '../utils/log';
import assert from 'assert';

var LOG_PRIORITY_DRAW = 2;

var renderCount = 0;

// TODO - Exported for pick-layers.js - Move to util?
export var getPixelRatio = function getPixelRatio(_ref) {
  var useDevicePixels = _ref.useDevicePixels;

  assert(typeof useDevicePixels === 'boolean', 'Invalid useDevicePixels');
  return useDevicePixels && typeof window !== 'undefined' ? window.devicePixelRatio : 1;
};

// Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
var getGLViewport = function getGLViewport(gl, _ref2) {
  var viewport = _ref2.viewport,
      pixelRatio = _ref2.pixelRatio;

  // TODO - dummy default for node
  var height = gl.canvas ? gl.canvas.clientHeight : 100;
  // Convert viewport top-left CSS coordinates to bottom up WebGL coordinates
  var dimensions = viewport;
  return [dimensions.x * pixelRatio, (height - dimensions.y - dimensions.height) * pixelRatio, dimensions.width * pixelRatio, dimensions.height * pixelRatio];
};

// Helper functions

function clearCanvas(gl, _ref3) {
  var useDevicePixels = _ref3.useDevicePixels;

  // const pixelRatio = getPixelRatio({useDevicePixels});
  var width = gl.drawingBufferWidth;
  var height = gl.drawingBufferHeight;
  // clear depth and color buffers, restoring transparency
  withParameters(gl, { viewport: [0, 0, width, height] }, function () {
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  });
}

// Draw a list of layers in a list of viewports
export function drawLayers(gl, _ref4) {
  var layers = _ref4.layers,
      viewports = _ref4.viewports,
      onViewportActive = _ref4.onViewportActive,
      useDevicePixels = _ref4.useDevicePixels,
      _ref4$drawPickingColo = _ref4.drawPickingColors,
      drawPickingColors = _ref4$drawPickingColo === undefined ? false : _ref4$drawPickingColo,
      _ref4$deviceRect = _ref4.deviceRect,
      deviceRect = _ref4$deviceRect === undefined ? null : _ref4$deviceRect,
      _ref4$parameters = _ref4.parameters,
      parameters = _ref4$parameters === undefined ? {} : _ref4$parameters,
      _ref4$layerFilter = _ref4.layerFilter,
      layerFilter = _ref4$layerFilter === undefined ? null : _ref4$layerFilter,
      _ref4$pass = _ref4.pass,
      pass = _ref4$pass === undefined ? 'draw' : _ref4$pass,
      _ref4$redrawReason = _ref4.redrawReason,
      redrawReason = _ref4$redrawReason === undefined ? '' : _ref4$redrawReason;

  clearCanvas(gl, { useDevicePixels: useDevicePixels });

  // effectManager.preDraw();

  viewports.forEach(function (viewportOrDescriptor, i) {
    var viewport = getViewportFromDescriptor(viewportOrDescriptor);

    // Update context to point to this viewport
    onViewportActive(viewport);

    // render this viewport
    drawLayersInViewport(gl, {
      layers: layers,
      viewport: viewport,
      useDevicePixels: useDevicePixels,
      drawPickingColors: drawPickingColors,
      deviceRect: deviceRect,
      parameters: parameters,
      layerFilter: layerFilter,
      pass: pass,
      redrawReason: redrawReason
    });
  });

  // effectManager.draw();
}

// Draws list of layers and viewports into the picking buffer
// Note: does not sample the buffer, that has to be done by the caller
export function drawPickingBuffer(gl, _ref5) {
  var layers = _ref5.layers,
      viewports = _ref5.viewports,
      onViewportActive = _ref5.onViewportActive,
      useDevicePixels = _ref5.useDevicePixels,
      pickingFBO = _ref5.pickingFBO,
      _ref5$deviceRect = _ref5.deviceRect,
      x = _ref5$deviceRect.x,
      y = _ref5$deviceRect.y,
      width = _ref5$deviceRect.width,
      height = _ref5$deviceRect.height,
      _ref5$layerFilter = _ref5.layerFilter,
      layerFilter = _ref5$layerFilter === undefined ? null : _ref5$layerFilter,
      _ref5$redrawReason = _ref5.redrawReason,
      redrawReason = _ref5$redrawReason === undefined ? '' : _ref5$redrawReason;

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
  }, function () {

    drawLayers(gl, {
      layers: layers,
      viewports: viewports,
      onViewportActive: onViewportActive,
      useDevicePixels: useDevicePixels,
      drawPickingColors: true,
      layerFilter: layerFilter,
      pass: 'picking',
      redrawReason: redrawReason,
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
function drawLayersInViewport(gl, _ref6) {
  var layers = _ref6.layers,
      viewport = _ref6.viewport,
      useDevicePixels = _ref6.useDevicePixels,
      _ref6$drawPickingColo = _ref6.drawPickingColors,
      drawPickingColors = _ref6$drawPickingColo === undefined ? false : _ref6$drawPickingColo,
      _ref6$deviceRect = _ref6.deviceRect,
      deviceRect = _ref6$deviceRect === undefined ? null : _ref6$deviceRect,
      _ref6$parameters = _ref6.parameters,
      parameters = _ref6$parameters === undefined ? {} : _ref6$parameters,
      layerFilter = _ref6.layerFilter,
      _ref6$pass = _ref6.pass,
      pass = _ref6$pass === undefined ? 'draw' : _ref6$pass,
      _ref6$redrawReason = _ref6.redrawReason,
      redrawReason = _ref6$redrawReason === undefined ? '' : _ref6$redrawReason;

  var pixelRatio = getPixelRatio({ useDevicePixels: useDevicePixels });
  var glViewport = getGLViewport(gl, { viewport: viewport, pixelRatio: pixelRatio });

  // render layers in normal colors
  var renderStats = {
    totalCount: layers.length,
    visibleCount: 0,
    compositeCount: 0,
    pickableCount: 0
  };

  // const {x, y, width, height} = deviceRect || [];

  setParameters(gl, parameters || {});

  // render layers in normal colors
  layers.forEach(function (layer, layerIndex) {

    // Check if we should draw layer
    var shouldDrawLayer = layer.props.visible;
    if (drawPickingColors) {
      shouldDrawLayer = shouldDrawLayer && layer.props.pickable;
    }
    if (shouldDrawLayer && layerFilter) {
      shouldDrawLayer = layerFilter({ layer: layer, viewport: viewport, isPicking: drawPickingColors });
    }

    // Calculate stats
    if (shouldDrawLayer && layer.props.pickable) {
      renderStats.pickableCount++;
    }
    if (layer.isComposite) {
      renderStats.compositeCount++;
    }

    // Draw the layer
    if (shouldDrawLayer) {

      if (!layer.isComposite) {
        renderStats.visibleCount++;
      }

      drawLayerInViewport({ gl: gl, layer: layer, layerIndex: layerIndex, drawPickingColors: drawPickingColors, glViewport: glViewport, parameters: parameters });
    }
  });

  renderCount++;

  logRenderStats({ renderStats: renderStats, pass: pass, redrawReason: redrawReason });
}

function drawLayerInViewport(_ref7) {
  var gl = _ref7.gl,
      layer = _ref7.layer,
      layerIndex = _ref7.layerIndex,
      drawPickingColors = _ref7.drawPickingColors,
      glViewport = _ref7.glViewport,
      parameters = _ref7.parameters;

  var moduleParameters = Object.assign({}, layer.props, {
    viewport: layer.context.viewport,
    pickingActive: drawPickingColors ? 1 : 0
  });

  // TODO: Update all layers to use 'picking_uActive' (picking shader module)
  // and then remove 'renderPickingBuffer' and 'pickingEnabled'.
  var pickingUniforms = {
    renderPickingBuffer: drawPickingColors ? 1 : 0,
    pickingEnabled: drawPickingColors ? 1 : 0
  };

  var uniforms = Object.assign(pickingUniforms, layer.context.uniforms, { layerIndex: layerIndex });

  // All parameter resolving is done here instead of the layer
  // Blend parameters must not be overriden
  var layerParameters = Object.assign({}, layer.props.parameters || {}, parameters);

  Object.assign(layerParameters, {
    viewport: glViewport
  });

  if (drawPickingColors) {
    Object.assign(layerParameters, {
      blendColor: [0, 0, 0, (layerIndex + 1) / 255]
    });
  } else {
    Object.assign(moduleParameters, getObjectHighlightParameters(layer));
  }

  layer.drawLayer({
    moduleParameters: moduleParameters,
    uniforms: uniforms,
    parameters: layerParameters
  });
}

function logRenderStats(_ref8) {
  var renderStats = _ref8.renderStats,
      pass = _ref8.pass,
      redrawReason = _ref8.redrawReason;

  if (log.priority >= LOG_PRIORITY_DRAW) {
    var totalCount = renderStats.totalCount,
        visibleCount = renderStats.visibleCount,
        compositeCount = renderStats.compositeCount,
        pickableCount = renderStats.pickableCount;

    var primitiveCount = totalCount - compositeCount;
    var hiddenCount = primitiveCount - visibleCount;

    var message = '';
    message += 'RENDER #' + renderCount + ' ' + visibleCount + ' (of ' + totalCount + ' layers) to ' + pass + ' because ' + redrawReason + ' ';
    if (log.priority > LOG_PRIORITY_DRAW) {
      message += '(' + hiddenCount + ' hidden, ' + compositeCount + ' composite ' + pickableCount + ' unpickable)';
    }

    log.log(LOG_PRIORITY_DRAW, message);
  }
}

// Get a viewport from a viewport descriptor (which can be a plain viewport)
function getViewportFromDescriptor(viewportOrDescriptor) {
  return viewportOrDescriptor.viewport ? viewportOrDescriptor.viewport : viewportOrDescriptor;
}

/**
 * Returns the picking color of currenlty selected object of the given 'layer'.
 * @return {Array} - the picking color or null if layers selected object is invalid.
 */
function getObjectHighlightParameters(layer) {
  // TODO - inefficient to update settings every render?
  // TODO: Add warning if 'highlightedObjectIndex' is > numberOfInstances of the model.

  // Update picking module settings if highlightedObjectIndex is set.
  // This will overwrite any settings from auto highlighting.
  if (layer.props.highlightedObjectIndex >= 0) {
    var pickingSelectedColor = layer.encodePickingColor(layer.props.highlightedObjectIndex);

    return {
      pickingSelectedColor: pickingSelectedColor
    };
  }
  return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9kcmF3LWxheWVycy5qcyJdLCJuYW1lcyI6WyJHTCIsIndpdGhQYXJhbWV0ZXJzIiwic2V0UGFyYW1ldGVycyIsImxvZyIsImFzc2VydCIsIkxPR19QUklPUklUWV9EUkFXIiwicmVuZGVyQ291bnQiLCJnZXRQaXhlbFJhdGlvIiwidXNlRGV2aWNlUGl4ZWxzIiwid2luZG93IiwiZGV2aWNlUGl4ZWxSYXRpbyIsImdldEdMVmlld3BvcnQiLCJnbCIsInZpZXdwb3J0IiwicGl4ZWxSYXRpbyIsImhlaWdodCIsImNhbnZhcyIsImNsaWVudEhlaWdodCIsImRpbWVuc2lvbnMiLCJ4IiwieSIsIndpZHRoIiwiY2xlYXJDYW52YXMiLCJkcmF3aW5nQnVmZmVyV2lkdGgiLCJkcmF3aW5nQnVmZmVySGVpZ2h0IiwiY2xlYXIiLCJDT0xPUl9CVUZGRVJfQklUIiwiREVQVEhfQlVGRkVSX0JJVCIsImRyYXdMYXllcnMiLCJsYXllcnMiLCJ2aWV3cG9ydHMiLCJvblZpZXdwb3J0QWN0aXZlIiwiZHJhd1BpY2tpbmdDb2xvcnMiLCJkZXZpY2VSZWN0IiwicGFyYW1ldGVycyIsImxheWVyRmlsdGVyIiwicGFzcyIsInJlZHJhd1JlYXNvbiIsImZvckVhY2giLCJ2aWV3cG9ydE9yRGVzY3JpcHRvciIsImkiLCJnZXRWaWV3cG9ydEZyb21EZXNjcmlwdG9yIiwiZHJhd0xheWVyc0luVmlld3BvcnQiLCJkcmF3UGlja2luZ0J1ZmZlciIsInBpY2tpbmdGQk8iLCJmcmFtZWJ1ZmZlciIsInNjaXNzb3JUZXN0Iiwic2Npc3NvciIsImNsZWFyQ29sb3IiLCJibGVuZCIsImJsZW5kRnVuYyIsIk9ORSIsIlpFUk8iLCJDT05TVEFOVF9BTFBIQSIsImJsZW5kRXF1YXRpb24iLCJGVU5DX0FERCIsImJsZW5kQ29sb3IiLCJnbFZpZXdwb3J0IiwicmVuZGVyU3RhdHMiLCJ0b3RhbENvdW50IiwibGVuZ3RoIiwidmlzaWJsZUNvdW50IiwiY29tcG9zaXRlQ291bnQiLCJwaWNrYWJsZUNvdW50IiwibGF5ZXIiLCJsYXllckluZGV4Iiwic2hvdWxkRHJhd0xheWVyIiwicHJvcHMiLCJ2aXNpYmxlIiwicGlja2FibGUiLCJpc1BpY2tpbmciLCJpc0NvbXBvc2l0ZSIsImRyYXdMYXllckluVmlld3BvcnQiLCJsb2dSZW5kZXJTdGF0cyIsIm1vZHVsZVBhcmFtZXRlcnMiLCJPYmplY3QiLCJhc3NpZ24iLCJjb250ZXh0IiwicGlja2luZ0FjdGl2ZSIsInBpY2tpbmdVbmlmb3JtcyIsInJlbmRlclBpY2tpbmdCdWZmZXIiLCJwaWNraW5nRW5hYmxlZCIsInVuaWZvcm1zIiwibGF5ZXJQYXJhbWV0ZXJzIiwiZ2V0T2JqZWN0SGlnaGxpZ2h0UGFyYW1ldGVycyIsImRyYXdMYXllciIsInByaW9yaXR5IiwicHJpbWl0aXZlQ291bnQiLCJoaWRkZW5Db3VudCIsIm1lc3NhZ2UiLCJoaWdobGlnaHRlZE9iamVjdEluZGV4IiwicGlja2luZ1NlbGVjdGVkQ29sb3IiLCJlbmNvZGVQaWNraW5nQ29sb3IiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUUEsRUFBUixFQUFZQyxjQUFaLEVBQTRCQyxhQUE1QixRQUFnRCxTQUFoRDtBQUNBLE9BQU9DLEdBQVAsTUFBZ0IsY0FBaEI7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5COztBQUVBLElBQU1DLG9CQUFvQixDQUExQjs7QUFFQSxJQUFJQyxjQUFjLENBQWxCOztBQUVBO0FBQ0EsT0FBTyxJQUFNQyxnQkFBZ0IsU0FBaEJBLGFBQWdCLE9BQXVCO0FBQUEsTUFBckJDLGVBQXFCLFFBQXJCQSxlQUFxQjs7QUFDbERKLFNBQU8sT0FBT0ksZUFBUCxLQUEyQixTQUFsQyxFQUE2Qyx5QkFBN0M7QUFDQSxTQUFPQSxtQkFBbUIsT0FBT0MsTUFBUCxLQUFrQixXQUFyQyxHQUFtREEsT0FBT0MsZ0JBQTFELEdBQTZFLENBQXBGO0FBQ0QsQ0FITTs7QUFLUDtBQUNBLElBQU1DLGdCQUFnQixTQUFoQkEsYUFBZ0IsQ0FBQ0MsRUFBRCxTQUFnQztBQUFBLE1BQTFCQyxRQUEwQixTQUExQkEsUUFBMEI7QUFBQSxNQUFoQkMsVUFBZ0IsU0FBaEJBLFVBQWdCOztBQUNwRDtBQUNBLE1BQU1DLFNBQVNILEdBQUdJLE1BQUgsR0FBWUosR0FBR0ksTUFBSCxDQUFVQyxZQUF0QixHQUFxQyxHQUFwRDtBQUNBO0FBQ0EsTUFBTUMsYUFBYUwsUUFBbkI7QUFDQSxTQUFPLENBQ0xLLFdBQVdDLENBQVgsR0FBZUwsVUFEVixFQUVMLENBQUNDLFNBQVNHLFdBQVdFLENBQXBCLEdBQXdCRixXQUFXSCxNQUFwQyxJQUE4Q0QsVUFGekMsRUFHTEksV0FBV0csS0FBWCxHQUFtQlAsVUFIZCxFQUlMSSxXQUFXSCxNQUFYLEdBQW9CRCxVQUpmLENBQVA7QUFNRCxDQVhEOztBQWFBOztBQUVBLFNBQVNRLFdBQVQsQ0FBcUJWLEVBQXJCLFNBQTRDO0FBQUEsTUFBbEJKLGVBQWtCLFNBQWxCQSxlQUFrQjs7QUFDMUM7QUFDQSxNQUFNYSxRQUFRVCxHQUFHVyxrQkFBakI7QUFDQSxNQUFNUixTQUFTSCxHQUFHWSxtQkFBbEI7QUFDQTtBQUNBdkIsaUJBQWVXLEVBQWYsRUFBbUIsRUFBQ0MsVUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU9RLEtBQVAsRUFBY04sTUFBZCxDQUFYLEVBQW5CLEVBQXNELFlBQU07QUFDMURILE9BQUdhLEtBQUgsQ0FBU3pCLEdBQUcwQixnQkFBSCxHQUFzQjFCLEdBQUcyQixnQkFBbEM7QUFDRCxHQUZEO0FBR0Q7O0FBRUQ7QUFDQSxPQUFPLFNBQVNDLFVBQVQsQ0FBb0JoQixFQUFwQixTQVdKO0FBQUEsTUFWRGlCLE1BVUMsU0FWREEsTUFVQztBQUFBLE1BVERDLFNBU0MsU0FUREEsU0FTQztBQUFBLE1BUkRDLGdCQVFDLFNBUkRBLGdCQVFDO0FBQUEsTUFQRHZCLGVBT0MsU0FQREEsZUFPQztBQUFBLG9DQU5Ed0IsaUJBTUM7QUFBQSxNQU5EQSxpQkFNQyx5Q0FObUIsS0FNbkI7QUFBQSwrQkFMREMsVUFLQztBQUFBLE1BTERBLFVBS0Msb0NBTFksSUFLWjtBQUFBLCtCQUpEQyxVQUlDO0FBQUEsTUFKREEsVUFJQyxvQ0FKWSxFQUlaO0FBQUEsZ0NBSERDLFdBR0M7QUFBQSxNQUhEQSxXQUdDLHFDQUhhLElBR2I7QUFBQSx5QkFGREMsSUFFQztBQUFBLE1BRkRBLElBRUMsOEJBRk0sTUFFTjtBQUFBLGlDQUREQyxZQUNDO0FBQUEsTUFEREEsWUFDQyxzQ0FEYyxFQUNkOztBQUNEZixjQUFZVixFQUFaLEVBQWdCLEVBQUNKLGdDQUFELEVBQWhCOztBQUVBOztBQUVBc0IsWUFBVVEsT0FBVixDQUFrQixVQUFDQyxvQkFBRCxFQUF1QkMsQ0FBdkIsRUFBNkI7QUFDN0MsUUFBTTNCLFdBQVc0QiwwQkFBMEJGLG9CQUExQixDQUFqQjs7QUFFQTtBQUNBUixxQkFBaUJsQixRQUFqQjs7QUFFQTtBQUNBNkIseUJBQXFCOUIsRUFBckIsRUFBeUI7QUFDdkJpQixvQkFEdUI7QUFFdkJoQix3QkFGdUI7QUFHdkJMLHNDQUh1QjtBQUl2QndCLDBDQUp1QjtBQUt2QkMsNEJBTHVCO0FBTXZCQyw0QkFOdUI7QUFPdkJDLDhCQVB1QjtBQVF2QkMsZ0JBUnVCO0FBU3ZCQztBQVR1QixLQUF6QjtBQVdELEdBbEJEOztBQW9CQTtBQUNEOztBQUVEO0FBQ0E7QUFDQSxPQUFPLFNBQVNNLGlCQUFULENBQTJCL0IsRUFBM0IsU0FTSjtBQUFBLE1BUkRpQixNQVFDLFNBUkRBLE1BUUM7QUFBQSxNQVBEQyxTQU9DLFNBUERBLFNBT0M7QUFBQSxNQU5EQyxnQkFNQyxTQU5EQSxnQkFNQztBQUFBLE1BTER2QixlQUtDLFNBTERBLGVBS0M7QUFBQSxNQUpEb0MsVUFJQyxTQUpEQSxVQUlDO0FBQUEsK0JBSERYLFVBR0M7QUFBQSxNQUhZZCxDQUdaLG9CQUhZQSxDQUdaO0FBQUEsTUFIZUMsQ0FHZixvQkFIZUEsQ0FHZjtBQUFBLE1BSGtCQyxLQUdsQixvQkFIa0JBLEtBR2xCO0FBQUEsTUFIeUJOLE1BR3pCLG9CQUh5QkEsTUFHekI7QUFBQSxnQ0FGRG9CLFdBRUM7QUFBQSxNQUZEQSxXQUVDLHFDQUZhLElBRWI7QUFBQSxpQ0FEREUsWUFDQztBQUFBLE1BRERBLFlBQ0Msc0NBRGMsRUFDZDs7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBT3BDLGVBQWVXLEVBQWYsRUFBbUI7QUFDeEJpQyxpQkFBYUQsVUFEVztBQUV4QkUsaUJBQWEsSUFGVztBQUd4QkMsYUFBUyxDQUFDNUIsQ0FBRCxFQUFJQyxDQUFKLEVBQU9DLEtBQVAsRUFBY04sTUFBZCxDQUhlO0FBSXhCaUMsZ0JBQVksQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO0FBSlksR0FBbkIsRUFLSixZQUFNOztBQUVQcEIsZUFBV2hCLEVBQVgsRUFBZTtBQUNiaUIsb0JBRGE7QUFFYkMsMEJBRmE7QUFHYkMsd0NBSGE7QUFJYnZCLHNDQUphO0FBS2J3Qix5QkFBbUIsSUFMTjtBQU1iRyw4QkFOYTtBQU9iQyxZQUFNLFNBUE87QUFRYkMsZ0NBUmE7QUFTYkgsa0JBQVk7QUFDVmUsZUFBTyxJQURHO0FBRVZDLG1CQUFXLENBQUN0QyxHQUFHdUMsR0FBSixFQUFTdkMsR0FBR3dDLElBQVosRUFBa0J4QyxHQUFHeUMsY0FBckIsRUFBcUN6QyxHQUFHd0MsSUFBeEMsQ0FGRDtBQUdWRSx1QkFBZTFDLEdBQUcyQyxRQUhSO0FBSVZDLG9CQUFZLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVjtBQUpGO0FBVEMsS0FBZjtBQWlCRCxHQXhCTSxDQUFQO0FBeUJEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLFNBQVNkLG9CQUFULENBQThCOUIsRUFBOUIsU0FVRztBQUFBLE1BVERpQixNQVNDLFNBVERBLE1BU0M7QUFBQSxNQVJEaEIsUUFRQyxTQVJEQSxRQVFDO0FBQUEsTUFQREwsZUFPQyxTQVBEQSxlQU9DO0FBQUEsb0NBTkR3QixpQkFNQztBQUFBLE1BTkRBLGlCQU1DLHlDQU5tQixLQU1uQjtBQUFBLCtCQUxEQyxVQUtDO0FBQUEsTUFMREEsVUFLQyxvQ0FMWSxJQUtaO0FBQUEsK0JBSkRDLFVBSUM7QUFBQSxNQUpEQSxVQUlDLG9DQUpZLEVBSVo7QUFBQSxNQUhEQyxXQUdDLFNBSERBLFdBR0M7QUFBQSx5QkFGREMsSUFFQztBQUFBLE1BRkRBLElBRUMsOEJBRk0sTUFFTjtBQUFBLGlDQUREQyxZQUNDO0FBQUEsTUFEREEsWUFDQyxzQ0FEYyxFQUNkOztBQUNELE1BQU12QixhQUFhUCxjQUFjLEVBQUNDLGdDQUFELEVBQWQsQ0FBbkI7QUFDQSxNQUFNaUQsYUFBYTlDLGNBQWNDLEVBQWQsRUFBa0IsRUFBQ0Msa0JBQUQsRUFBV0Msc0JBQVgsRUFBbEIsQ0FBbkI7O0FBRUE7QUFDQSxNQUFNNEMsY0FBYztBQUNsQkMsZ0JBQVk5QixPQUFPK0IsTUFERDtBQUVsQkMsa0JBQWMsQ0FGSTtBQUdsQkMsb0JBQWdCLENBSEU7QUFJbEJDLG1CQUFlO0FBSkcsR0FBcEI7O0FBT0E7O0FBRUE3RCxnQkFBY1UsRUFBZCxFQUFrQnNCLGNBQWMsRUFBaEM7O0FBRUE7QUFDQUwsU0FBT1MsT0FBUCxDQUFlLFVBQUMwQixLQUFELEVBQVFDLFVBQVIsRUFBdUI7O0FBRXBDO0FBQ0EsUUFBSUMsa0JBQWtCRixNQUFNRyxLQUFOLENBQVlDLE9BQWxDO0FBQ0EsUUFBSXBDLGlCQUFKLEVBQXVCO0FBQ3JCa0Msd0JBQWtCQSxtQkFBbUJGLE1BQU1HLEtBQU4sQ0FBWUUsUUFBakQ7QUFDRDtBQUNELFFBQUlILG1CQUFtQi9CLFdBQXZCLEVBQW9DO0FBQ2xDK0Isd0JBQWtCL0IsWUFBWSxFQUFDNkIsWUFBRCxFQUFRbkQsa0JBQVIsRUFBa0J5RCxXQUFXdEMsaUJBQTdCLEVBQVosQ0FBbEI7QUFDRDs7QUFFRDtBQUNBLFFBQUlrQyxtQkFBbUJGLE1BQU1HLEtBQU4sQ0FBWUUsUUFBbkMsRUFBNkM7QUFDM0NYLGtCQUFZSyxhQUFaO0FBQ0Q7QUFDRCxRQUFJQyxNQUFNTyxXQUFWLEVBQXVCO0FBQ3JCYixrQkFBWUksY0FBWjtBQUNEOztBQUVEO0FBQ0EsUUFBSUksZUFBSixFQUFxQjs7QUFFbkIsVUFBSSxDQUFDRixNQUFNTyxXQUFYLEVBQXdCO0FBQ3RCYixvQkFBWUcsWUFBWjtBQUNEOztBQUVEVywwQkFBb0IsRUFBQzVELE1BQUQsRUFBS29ELFlBQUwsRUFBWUMsc0JBQVosRUFBd0JqQyxvQ0FBeEIsRUFBMkN5QixzQkFBM0MsRUFBdUR2QixzQkFBdkQsRUFBcEI7QUFDRDtBQUVGLEdBN0JEOztBQStCQTVCOztBQUVBbUUsaUJBQWUsRUFBQ2Ysd0JBQUQsRUFBY3RCLFVBQWQsRUFBb0JDLDBCQUFwQixFQUFmO0FBQ0Q7O0FBRUQsU0FBU21DLG1CQUFULFFBQWlHO0FBQUEsTUFBbkU1RCxFQUFtRSxTQUFuRUEsRUFBbUU7QUFBQSxNQUEvRG9ELEtBQStELFNBQS9EQSxLQUErRDtBQUFBLE1BQXhEQyxVQUF3RCxTQUF4REEsVUFBd0Q7QUFBQSxNQUE1Q2pDLGlCQUE0QyxTQUE1Q0EsaUJBQTRDO0FBQUEsTUFBekJ5QixVQUF5QixTQUF6QkEsVUFBeUI7QUFBQSxNQUFidkIsVUFBYSxTQUFiQSxVQUFhOztBQUMvRixNQUFNd0MsbUJBQW1CQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQlosTUFBTUcsS0FBeEIsRUFBK0I7QUFDdER0RCxjQUFVbUQsTUFBTWEsT0FBTixDQUFjaEUsUUFEOEI7QUFFdERpRSxtQkFBZTlDLG9CQUFvQixDQUFwQixHQUF3QjtBQUZlLEdBQS9CLENBQXpCOztBQUtBO0FBQ0E7QUFDQSxNQUFNK0Msa0JBQWtCO0FBQ3RCQyx5QkFBcUJoRCxvQkFBb0IsQ0FBcEIsR0FBd0IsQ0FEdkI7QUFFdEJpRCxvQkFBZ0JqRCxvQkFBb0IsQ0FBcEIsR0FBd0I7QUFGbEIsR0FBeEI7O0FBS0EsTUFBTWtELFdBQVdQLE9BQU9DLE1BQVAsQ0FDZkcsZUFEZSxFQUVmZixNQUFNYSxPQUFOLENBQWNLLFFBRkMsRUFHZixFQUFDakIsc0JBQUQsRUFIZSxDQUFqQjs7QUFNQTtBQUNBO0FBQ0EsTUFBTWtCLGtCQUFrQlIsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JaLE1BQU1HLEtBQU4sQ0FBWWpDLFVBQVosSUFBMEIsRUFBNUMsRUFBZ0RBLFVBQWhELENBQXhCOztBQUVBeUMsU0FBT0MsTUFBUCxDQUFjTyxlQUFkLEVBQStCO0FBQzdCdEUsY0FBVTRDO0FBRG1CLEdBQS9COztBQUlBLE1BQUl6QixpQkFBSixFQUF1QjtBQUNyQjJDLFdBQU9DLE1BQVAsQ0FBY08sZUFBZCxFQUErQjtBQUM3QjNCLGtCQUFZLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBQ1MsYUFBYSxDQUFkLElBQW1CLEdBQTdCO0FBRGlCLEtBQS9CO0FBR0QsR0FKRCxNQUlPO0FBQ0xVLFdBQU9DLE1BQVAsQ0FBY0YsZ0JBQWQsRUFBZ0NVLDZCQUE2QnBCLEtBQTdCLENBQWhDO0FBQ0Q7O0FBRURBLFFBQU1xQixTQUFOLENBQWdCO0FBQ2RYLHNDQURjO0FBRWRRLHNCQUZjO0FBR2RoRCxnQkFBWWlEO0FBSEUsR0FBaEI7QUFLRDs7QUFFRCxTQUFTVixjQUFULFFBQTJEO0FBQUEsTUFBbENmLFdBQWtDLFNBQWxDQSxXQUFrQztBQUFBLE1BQXJCdEIsSUFBcUIsU0FBckJBLElBQXFCO0FBQUEsTUFBZkMsWUFBZSxTQUFmQSxZQUFlOztBQUN6RCxNQUFJbEMsSUFBSW1GLFFBQUosSUFBZ0JqRixpQkFBcEIsRUFBdUM7QUFBQSxRQUM5QnNELFVBRDhCLEdBQzZCRCxXQUQ3QixDQUM5QkMsVUFEOEI7QUFBQSxRQUNsQkUsWUFEa0IsR0FDNkJILFdBRDdCLENBQ2xCRyxZQURrQjtBQUFBLFFBQ0pDLGNBREksR0FDNkJKLFdBRDdCLENBQ0pJLGNBREk7QUFBQSxRQUNZQyxhQURaLEdBQzZCTCxXQUQ3QixDQUNZSyxhQURaOztBQUVyQyxRQUFNd0IsaUJBQWlCNUIsYUFBYUcsY0FBcEM7QUFDQSxRQUFNMEIsY0FBY0QsaUJBQWlCMUIsWUFBckM7O0FBRUEsUUFBSTRCLFVBQVUsRUFBZDtBQUNBQSw0QkFBc0JuRixXQUF0QixTQUNGdUQsWUFERSxhQUNrQkYsVUFEbEIsb0JBQzJDdkIsSUFEM0MsaUJBQzJEQyxZQUQzRDtBQUVBLFFBQUlsQyxJQUFJbUYsUUFBSixHQUFlakYsaUJBQW5CLEVBQXNDO0FBQ3BDb0YsdUJBQ0hELFdBREcsaUJBQ29CMUIsY0FEcEIsbUJBQ2dEQyxhQURoRDtBQUVEOztBQUVENUQsUUFBSUEsR0FBSixDQUFRRSxpQkFBUixFQUEyQm9GLE9BQTNCO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLFNBQVNoRCx5QkFBVCxDQUFtQ0Ysb0JBQW5DLEVBQXlEO0FBQ3ZELFNBQU9BLHFCQUFxQjFCLFFBQXJCLEdBQWdDMEIscUJBQXFCMUIsUUFBckQsR0FBZ0UwQixvQkFBdkU7QUFDRDs7QUFFRDs7OztBQUlBLFNBQVM2Qyw0QkFBVCxDQUFzQ3BCLEtBQXRDLEVBQTZDO0FBQzNDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUlBLE1BQU1HLEtBQU4sQ0FBWXVCLHNCQUFaLElBQXNDLENBQTFDLEVBQTZDO0FBQzNDLFFBQU1DLHVCQUF1QjNCLE1BQU00QixrQkFBTixDQUF5QjVCLE1BQU1HLEtBQU4sQ0FBWXVCLHNCQUFyQyxDQUE3Qjs7QUFFQSxXQUFPO0FBQ0xDO0FBREssS0FBUDtBQUdEO0FBQ0QsU0FBTyxJQUFQO0FBQ0QiLCJmaWxlIjoiZHJhdy1sYXllcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZ2xvYmFsIHdpbmRvdyAqL1xuaW1wb3J0IHtHTCwgd2l0aFBhcmFtZXRlcnMsIHNldFBhcmFtZXRlcnN9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi91dGlscy9sb2cnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBMT0dfUFJJT1JJVFlfRFJBVyA9IDI7XG5cbmxldCByZW5kZXJDb3VudCA9IDA7XG5cbi8vIFRPRE8gLSBFeHBvcnRlZCBmb3IgcGljay1sYXllcnMuanMgLSBNb3ZlIHRvIHV0aWw/XG5leHBvcnQgY29uc3QgZ2V0UGl4ZWxSYXRpbyA9ICh7dXNlRGV2aWNlUGl4ZWxzfSkgPT4ge1xuICBhc3NlcnQodHlwZW9mIHVzZURldmljZVBpeGVscyA9PT0gJ2Jvb2xlYW4nLCAnSW52YWxpZCB1c2VEZXZpY2VQaXhlbHMnKTtcbiAgcmV0dXJuIHVzZURldmljZVBpeGVscyAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIDogMTtcbn07XG5cbi8vIENvbnZlcnQgdmlld3BvcnQgdG9wLWxlZnQgQ1NTIGNvb3JkaW5hdGVzIHRvIGJvdHRvbSB1cCBXZWJHTCBjb29yZGluYXRlc1xuY29uc3QgZ2V0R0xWaWV3cG9ydCA9IChnbCwge3ZpZXdwb3J0LCBwaXhlbFJhdGlvfSkgPT4ge1xuICAvLyBUT0RPIC0gZHVtbXkgZGVmYXVsdCBmb3Igbm9kZVxuICBjb25zdCBoZWlnaHQgPSBnbC5jYW52YXMgPyBnbC5jYW52YXMuY2xpZW50SGVpZ2h0IDogMTAwO1xuICAvLyBDb252ZXJ0IHZpZXdwb3J0IHRvcC1sZWZ0IENTUyBjb29yZGluYXRlcyB0byBib3R0b20gdXAgV2ViR0wgY29vcmRpbmF0ZXNcbiAgY29uc3QgZGltZW5zaW9ucyA9IHZpZXdwb3J0O1xuICByZXR1cm4gW1xuICAgIGRpbWVuc2lvbnMueCAqIHBpeGVsUmF0aW8sXG4gICAgKGhlaWdodCAtIGRpbWVuc2lvbnMueSAtIGRpbWVuc2lvbnMuaGVpZ2h0KSAqIHBpeGVsUmF0aW8sXG4gICAgZGltZW5zaW9ucy53aWR0aCAqIHBpeGVsUmF0aW8sXG4gICAgZGltZW5zaW9ucy5oZWlnaHQgKiBwaXhlbFJhdGlvXG4gIF07XG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG5cbmZ1bmN0aW9uIGNsZWFyQ2FudmFzKGdsLCB7dXNlRGV2aWNlUGl4ZWxzfSkge1xuICAvLyBjb25zdCBwaXhlbFJhdGlvID0gZ2V0UGl4ZWxSYXRpbyh7dXNlRGV2aWNlUGl4ZWxzfSk7XG4gIGNvbnN0IHdpZHRoID0gZ2wuZHJhd2luZ0J1ZmZlcldpZHRoO1xuICBjb25zdCBoZWlnaHQgPSBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0O1xuICAvLyBjbGVhciBkZXB0aCBhbmQgY29sb3IgYnVmZmVycywgcmVzdG9yaW5nIHRyYW5zcGFyZW5jeVxuICB3aXRoUGFyYW1ldGVycyhnbCwge3ZpZXdwb3J0OiBbMCwgMCwgd2lkdGgsIGhlaWdodF19LCAoKSA9PiB7XG4gICAgZ2wuY2xlYXIoR0wuQ09MT1JfQlVGRkVSX0JJVCB8IEdMLkRFUFRIX0JVRkZFUl9CSVQpO1xuICB9KTtcbn1cblxuLy8gRHJhdyBhIGxpc3Qgb2YgbGF5ZXJzIGluIGEgbGlzdCBvZiB2aWV3cG9ydHNcbmV4cG9ydCBmdW5jdGlvbiBkcmF3TGF5ZXJzKGdsLCB7XG4gIGxheWVycyxcbiAgdmlld3BvcnRzLFxuICBvblZpZXdwb3J0QWN0aXZlLFxuICB1c2VEZXZpY2VQaXhlbHMsXG4gIGRyYXdQaWNraW5nQ29sb3JzID0gZmFsc2UsXG4gIGRldmljZVJlY3QgPSBudWxsLFxuICBwYXJhbWV0ZXJzID0ge30sXG4gIGxheWVyRmlsdGVyID0gbnVsbCxcbiAgcGFzcyA9ICdkcmF3JyxcbiAgcmVkcmF3UmVhc29uID0gJydcbn0pIHtcbiAgY2xlYXJDYW52YXMoZ2wsIHt1c2VEZXZpY2VQaXhlbHN9KTtcblxuICAvLyBlZmZlY3RNYW5hZ2VyLnByZURyYXcoKTtcblxuICB2aWV3cG9ydHMuZm9yRWFjaCgodmlld3BvcnRPckRlc2NyaXB0b3IsIGkpID0+IHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IGdldFZpZXdwb3J0RnJvbURlc2NyaXB0b3Iodmlld3BvcnRPckRlc2NyaXB0b3IpO1xuXG4gICAgLy8gVXBkYXRlIGNvbnRleHQgdG8gcG9pbnQgdG8gdGhpcyB2aWV3cG9ydFxuICAgIG9uVmlld3BvcnRBY3RpdmUodmlld3BvcnQpO1xuXG4gICAgLy8gcmVuZGVyIHRoaXMgdmlld3BvcnRcbiAgICBkcmF3TGF5ZXJzSW5WaWV3cG9ydChnbCwge1xuICAgICAgbGF5ZXJzLFxuICAgICAgdmlld3BvcnQsXG4gICAgICB1c2VEZXZpY2VQaXhlbHMsXG4gICAgICBkcmF3UGlja2luZ0NvbG9ycyxcbiAgICAgIGRldmljZVJlY3QsXG4gICAgICBwYXJhbWV0ZXJzLFxuICAgICAgbGF5ZXJGaWx0ZXIsXG4gICAgICBwYXNzLFxuICAgICAgcmVkcmF3UmVhc29uXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIGVmZmVjdE1hbmFnZXIuZHJhdygpO1xufVxuXG4vLyBEcmF3cyBsaXN0IG9mIGxheWVycyBhbmQgdmlld3BvcnRzIGludG8gdGhlIHBpY2tpbmcgYnVmZmVyXG4vLyBOb3RlOiBkb2VzIG5vdCBzYW1wbGUgdGhlIGJ1ZmZlciwgdGhhdCBoYXMgdG8gYmUgZG9uZSBieSB0aGUgY2FsbGVyXG5leHBvcnQgZnVuY3Rpb24gZHJhd1BpY2tpbmdCdWZmZXIoZ2wsIHtcbiAgbGF5ZXJzLFxuICB2aWV3cG9ydHMsXG4gIG9uVmlld3BvcnRBY3RpdmUsXG4gIHVzZURldmljZVBpeGVscyxcbiAgcGlja2luZ0ZCTyxcbiAgZGV2aWNlUmVjdDoge3gsIHksIHdpZHRoLCBoZWlnaHR9LFxuICBsYXllckZpbHRlciA9IG51bGwsXG4gIHJlZHJhd1JlYXNvbiA9ICcnXG59KSB7XG4gIC8vIE1ha2Ugc3VyZSB3ZSBjbGVhciBzY2lzc29yIHRlc3QgYW5kIGZibyBiaW5kaW5ncyBpbiBjYXNlIG9mIGV4Y2VwdGlvbnNcbiAgLy8gV2UgYXJlIG9ubHkgaW50ZXJlc3RlZCBpbiBvbmUgcGl4ZWwsIG5vIG5lZWQgdG8gcmVuZGVyIGFueXRoaW5nIGVsc2VcbiAgLy8gTm90ZSB0aGF0IHRoZSBjYWxsYmFjayBoZXJlIGlzIGNhbGxlZCBzeW5jaHJvbm91c2x5LlxuICAvLyBTZXQgYmxlbmQgbW9kZSBmb3IgcGlja2luZ1xuICAvLyBhbHdheXMgb3ZlcndyaXRlIGV4aXN0aW5nIHBpeGVsIHdpdGggW3IsZyxiLGxheWVySW5kZXhdXG4gIHJldHVybiB3aXRoUGFyYW1ldGVycyhnbCwge1xuICAgIGZyYW1lYnVmZmVyOiBwaWNraW5nRkJPLFxuICAgIHNjaXNzb3JUZXN0OiB0cnVlLFxuICAgIHNjaXNzb3I6IFt4LCB5LCB3aWR0aCwgaGVpZ2h0XSxcbiAgICBjbGVhckNvbG9yOiBbMCwgMCwgMCwgMF1cbiAgfSwgKCkgPT4ge1xuXG4gICAgZHJhd0xheWVycyhnbCwge1xuICAgICAgbGF5ZXJzLFxuICAgICAgdmlld3BvcnRzLFxuICAgICAgb25WaWV3cG9ydEFjdGl2ZSxcbiAgICAgIHVzZURldmljZVBpeGVscyxcbiAgICAgIGRyYXdQaWNraW5nQ29sb3JzOiB0cnVlLFxuICAgICAgbGF5ZXJGaWx0ZXIsXG4gICAgICBwYXNzOiAncGlja2luZycsXG4gICAgICByZWRyYXdSZWFzb24sXG4gICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIGJsZW5kOiB0cnVlLFxuICAgICAgICBibGVuZEZ1bmM6IFtnbC5PTkUsIGdsLlpFUk8sIGdsLkNPTlNUQU5UX0FMUEhBLCBnbC5aRVJPXSxcbiAgICAgICAgYmxlbmRFcXVhdGlvbjogZ2wuRlVOQ19BREQsXG4gICAgICAgIGJsZW5kQ29sb3I6IFswLCAwLCAwLCAwXVxuICAgICAgfVxuICAgIH0pO1xuXG4gIH0pO1xufVxuXG4vLyBEcmF3cyBhIGxpc3Qgb2YgbGF5ZXJzIGluIG9uZSB2aWV3cG9ydFxuLy8gVE9ETyAtIHdoZW4gcGlja2luZyB3ZSBjb3VsZCBjb21wbGV0ZWx5IHNraXAgcmVuZGVyaW5nIHZpZXdwb3J0cyB0aGF0IGRvbnRcbi8vIGludGVyc2VjdCB3aXRoIHRoZSBwaWNraW5nIHJlY3RcbmZ1bmN0aW9uIGRyYXdMYXllcnNJblZpZXdwb3J0KGdsLCB7XG4gIGxheWVycyxcbiAgdmlld3BvcnQsXG4gIHVzZURldmljZVBpeGVscyxcbiAgZHJhd1BpY2tpbmdDb2xvcnMgPSBmYWxzZSxcbiAgZGV2aWNlUmVjdCA9IG51bGwsXG4gIHBhcmFtZXRlcnMgPSB7fSxcbiAgbGF5ZXJGaWx0ZXIsXG4gIHBhc3MgPSAnZHJhdycsXG4gIHJlZHJhd1JlYXNvbiA9ICcnXG59KSB7XG4gIGNvbnN0IHBpeGVsUmF0aW8gPSBnZXRQaXhlbFJhdGlvKHt1c2VEZXZpY2VQaXhlbHN9KTtcbiAgY29uc3QgZ2xWaWV3cG9ydCA9IGdldEdMVmlld3BvcnQoZ2wsIHt2aWV3cG9ydCwgcGl4ZWxSYXRpb30pO1xuXG4gIC8vIHJlbmRlciBsYXllcnMgaW4gbm9ybWFsIGNvbG9yc1xuICBjb25zdCByZW5kZXJTdGF0cyA9IHtcbiAgICB0b3RhbENvdW50OiBsYXllcnMubGVuZ3RoLFxuICAgIHZpc2libGVDb3VudDogMCxcbiAgICBjb21wb3NpdGVDb3VudDogMCxcbiAgICBwaWNrYWJsZUNvdW50OiAwXG4gIH07XG5cbiAgLy8gY29uc3Qge3gsIHksIHdpZHRoLCBoZWlnaHR9ID0gZGV2aWNlUmVjdCB8fCBbXTtcblxuICBzZXRQYXJhbWV0ZXJzKGdsLCBwYXJhbWV0ZXJzIHx8IHt9KTtcblxuICAvLyByZW5kZXIgbGF5ZXJzIGluIG5vcm1hbCBjb2xvcnNcbiAgbGF5ZXJzLmZvckVhY2goKGxheWVyLCBsYXllckluZGV4KSA9PiB7XG5cbiAgICAvLyBDaGVjayBpZiB3ZSBzaG91bGQgZHJhdyBsYXllclxuICAgIGxldCBzaG91bGREcmF3TGF5ZXIgPSBsYXllci5wcm9wcy52aXNpYmxlO1xuICAgIGlmIChkcmF3UGlja2luZ0NvbG9ycykge1xuICAgICAgc2hvdWxkRHJhd0xheWVyID0gc2hvdWxkRHJhd0xheWVyICYmIGxheWVyLnByb3BzLnBpY2thYmxlO1xuICAgIH1cbiAgICBpZiAoc2hvdWxkRHJhd0xheWVyICYmIGxheWVyRmlsdGVyKSB7XG4gICAgICBzaG91bGREcmF3TGF5ZXIgPSBsYXllckZpbHRlcih7bGF5ZXIsIHZpZXdwb3J0LCBpc1BpY2tpbmc6IGRyYXdQaWNraW5nQ29sb3JzfSk7XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIHN0YXRzXG4gICAgaWYgKHNob3VsZERyYXdMYXllciAmJiBsYXllci5wcm9wcy5waWNrYWJsZSkge1xuICAgICAgcmVuZGVyU3RhdHMucGlja2FibGVDb3VudCsrO1xuICAgIH1cbiAgICBpZiAobGF5ZXIuaXNDb21wb3NpdGUpIHtcbiAgICAgIHJlbmRlclN0YXRzLmNvbXBvc2l0ZUNvdW50Kys7XG4gICAgfVxuXG4gICAgLy8gRHJhdyB0aGUgbGF5ZXJcbiAgICBpZiAoc2hvdWxkRHJhd0xheWVyKSB7XG5cbiAgICAgIGlmICghbGF5ZXIuaXNDb21wb3NpdGUpIHtcbiAgICAgICAgcmVuZGVyU3RhdHMudmlzaWJsZUNvdW50Kys7XG4gICAgICB9XG5cbiAgICAgIGRyYXdMYXllckluVmlld3BvcnQoe2dsLCBsYXllciwgbGF5ZXJJbmRleCwgZHJhd1BpY2tpbmdDb2xvcnMsIGdsVmlld3BvcnQsIHBhcmFtZXRlcnN9KTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgcmVuZGVyQ291bnQrKztcblxuICBsb2dSZW5kZXJTdGF0cyh7cmVuZGVyU3RhdHMsIHBhc3MsIHJlZHJhd1JlYXNvbn0pO1xufVxuXG5mdW5jdGlvbiBkcmF3TGF5ZXJJblZpZXdwb3J0KHtnbCwgbGF5ZXIsIGxheWVySW5kZXgsIGRyYXdQaWNraW5nQ29sb3JzLCBnbFZpZXdwb3J0LCBwYXJhbWV0ZXJzfSkge1xuICBjb25zdCBtb2R1bGVQYXJhbWV0ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgbGF5ZXIucHJvcHMsIHtcbiAgICB2aWV3cG9ydDogbGF5ZXIuY29udGV4dC52aWV3cG9ydCxcbiAgICBwaWNraW5nQWN0aXZlOiBkcmF3UGlja2luZ0NvbG9ycyA/IDEgOiAwXG4gIH0pO1xuXG4gIC8vIFRPRE86IFVwZGF0ZSBhbGwgbGF5ZXJzIHRvIHVzZSAncGlja2luZ191QWN0aXZlJyAocGlja2luZyBzaGFkZXIgbW9kdWxlKVxuICAvLyBhbmQgdGhlbiByZW1vdmUgJ3JlbmRlclBpY2tpbmdCdWZmZXInIGFuZCAncGlja2luZ0VuYWJsZWQnLlxuICBjb25zdCBwaWNraW5nVW5pZm9ybXMgPSB7XG4gICAgcmVuZGVyUGlja2luZ0J1ZmZlcjogZHJhd1BpY2tpbmdDb2xvcnMgPyAxIDogMCxcbiAgICBwaWNraW5nRW5hYmxlZDogZHJhd1BpY2tpbmdDb2xvcnMgPyAxIDogMFxuICB9O1xuXG4gIGNvbnN0IHVuaWZvcm1zID0gT2JqZWN0LmFzc2lnbihcbiAgICBwaWNraW5nVW5pZm9ybXMsXG4gICAgbGF5ZXIuY29udGV4dC51bmlmb3JtcyxcbiAgICB7bGF5ZXJJbmRleH1cbiAgKTtcblxuICAvLyBBbGwgcGFyYW1ldGVyIHJlc29sdmluZyBpcyBkb25lIGhlcmUgaW5zdGVhZCBvZiB0aGUgbGF5ZXJcbiAgLy8gQmxlbmQgcGFyYW1ldGVycyBtdXN0IG5vdCBiZSBvdmVycmlkZW5cbiAgY29uc3QgbGF5ZXJQYXJhbWV0ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgbGF5ZXIucHJvcHMucGFyYW1ldGVycyB8fCB7fSwgcGFyYW1ldGVycyk7XG5cbiAgT2JqZWN0LmFzc2lnbihsYXllclBhcmFtZXRlcnMsIHtcbiAgICB2aWV3cG9ydDogZ2xWaWV3cG9ydFxuICB9KTtcblxuICBpZiAoZHJhd1BpY2tpbmdDb2xvcnMpIHtcbiAgICBPYmplY3QuYXNzaWduKGxheWVyUGFyYW1ldGVycywge1xuICAgICAgYmxlbmRDb2xvcjogWzAsIDAsIDAsIChsYXllckluZGV4ICsgMSkgLyAyNTVdXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgT2JqZWN0LmFzc2lnbihtb2R1bGVQYXJhbWV0ZXJzLCBnZXRPYmplY3RIaWdobGlnaHRQYXJhbWV0ZXJzKGxheWVyKSk7XG4gIH1cblxuICBsYXllci5kcmF3TGF5ZXIoe1xuICAgIG1vZHVsZVBhcmFtZXRlcnMsXG4gICAgdW5pZm9ybXMsXG4gICAgcGFyYW1ldGVyczogbGF5ZXJQYXJhbWV0ZXJzXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBsb2dSZW5kZXJTdGF0cyh7cmVuZGVyU3RhdHMsIHBhc3MsIHJlZHJhd1JlYXNvbn0pIHtcbiAgaWYgKGxvZy5wcmlvcml0eSA+PSBMT0dfUFJJT1JJVFlfRFJBVykge1xuICAgIGNvbnN0IHt0b3RhbENvdW50LCB2aXNpYmxlQ291bnQsIGNvbXBvc2l0ZUNvdW50LCBwaWNrYWJsZUNvdW50fSA9IHJlbmRlclN0YXRzO1xuICAgIGNvbnN0IHByaW1pdGl2ZUNvdW50ID0gdG90YWxDb3VudCAtIGNvbXBvc2l0ZUNvdW50O1xuICAgIGNvbnN0IGhpZGRlbkNvdW50ID0gcHJpbWl0aXZlQ291bnQgLSB2aXNpYmxlQ291bnQ7XG5cbiAgICBsZXQgbWVzc2FnZSA9ICcnO1xuICAgIG1lc3NhZ2UgKz0gYFJFTkRFUiAjJHtyZW5kZXJDb3VudH0gXFxcbiR7dmlzaWJsZUNvdW50fSAob2YgJHt0b3RhbENvdW50fSBsYXllcnMpIHRvICR7cGFzc30gYmVjYXVzZSAke3JlZHJhd1JlYXNvbn0gYDtcbiAgICBpZiAobG9nLnByaW9yaXR5ID4gTE9HX1BSSU9SSVRZX0RSQVcpIHtcbiAgICAgIG1lc3NhZ2UgKz0gYFxcXG4oJHtoaWRkZW5Db3VudH0gaGlkZGVuLCAke2NvbXBvc2l0ZUNvdW50fSBjb21wb3NpdGUgJHtwaWNrYWJsZUNvdW50fSB1bnBpY2thYmxlKWA7XG4gICAgfVxuXG4gICAgbG9nLmxvZyhMT0dfUFJJT1JJVFlfRFJBVywgbWVzc2FnZSk7XG4gIH1cbn1cblxuLy8gR2V0IGEgdmlld3BvcnQgZnJvbSBhIHZpZXdwb3J0IGRlc2NyaXB0b3IgKHdoaWNoIGNhbiBiZSBhIHBsYWluIHZpZXdwb3J0KVxuZnVuY3Rpb24gZ2V0Vmlld3BvcnRGcm9tRGVzY3JpcHRvcih2aWV3cG9ydE9yRGVzY3JpcHRvcikge1xuICByZXR1cm4gdmlld3BvcnRPckRlc2NyaXB0b3Iudmlld3BvcnQgPyB2aWV3cG9ydE9yRGVzY3JpcHRvci52aWV3cG9ydCA6IHZpZXdwb3J0T3JEZXNjcmlwdG9yO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBpY2tpbmcgY29sb3Igb2YgY3VycmVubHR5IHNlbGVjdGVkIG9iamVjdCBvZiB0aGUgZ2l2ZW4gJ2xheWVyJy5cbiAqIEByZXR1cm4ge0FycmF5fSAtIHRoZSBwaWNraW5nIGNvbG9yIG9yIG51bGwgaWYgbGF5ZXJzIHNlbGVjdGVkIG9iamVjdCBpcyBpbnZhbGlkLlxuICovXG5mdW5jdGlvbiBnZXRPYmplY3RIaWdobGlnaHRQYXJhbWV0ZXJzKGxheWVyKSB7XG4gIC8vIFRPRE8gLSBpbmVmZmljaWVudCB0byB1cGRhdGUgc2V0dGluZ3MgZXZlcnkgcmVuZGVyP1xuICAvLyBUT0RPOiBBZGQgd2FybmluZyBpZiAnaGlnaGxpZ2h0ZWRPYmplY3RJbmRleCcgaXMgPiBudW1iZXJPZkluc3RhbmNlcyBvZiB0aGUgbW9kZWwuXG5cbiAgLy8gVXBkYXRlIHBpY2tpbmcgbW9kdWxlIHNldHRpbmdzIGlmIGhpZ2hsaWdodGVkT2JqZWN0SW5kZXggaXMgc2V0LlxuICAvLyBUaGlzIHdpbGwgb3ZlcndyaXRlIGFueSBzZXR0aW5ncyBmcm9tIGF1dG8gaGlnaGxpZ2h0aW5nLlxuICBpZiAobGF5ZXIucHJvcHMuaGlnaGxpZ2h0ZWRPYmplY3RJbmRleCA+PSAwKSB7XG4gICAgY29uc3QgcGlja2luZ1NlbGVjdGVkQ29sb3IgPSBsYXllci5lbmNvZGVQaWNraW5nQ29sb3IobGF5ZXIucHJvcHMuaGlnaGxpZ2h0ZWRPYmplY3RJbmRleCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGlja2luZ1NlbGVjdGVkQ29sb3JcbiAgICB9O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuIl19