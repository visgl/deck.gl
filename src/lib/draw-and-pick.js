/* global window */
import {GL, glContextWithState} from 'luma.gl';
import {getUniformsFromViewport} from './viewport-uniforms';
import {log, getBlendMode, setBlendMode} from './utils';

const EMPTY_PIXEL = new Uint8Array(4);
let renderCount = 0;

export function drawLayers({layers, pass}) {
  log.log(2, `DRAWING ${layers.length} layers`);

  // render layers in normal colors
  let visibleCount = 0;
  // render layers in normal colors
  layers.forEach((layer, layerIndex) => {
    if (layer.props.visible) {
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

  log.log(1, `RENDER PASS ${pass}: ${renderCount++} 
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

  // TODO - just return glContextWithState once luma updates
  const unhandledPickInfos = [];

  // Make sure we clear scissor test and fbo bindings in case of exceptions
  // We are only interested in one pixel, no need to render anything else
  glContextWithState(gl, {
    frameBuffer: pickingFBO,
    framebuffer: pickingFBO,
    scissorTest: {x: deviceX, y: deviceY, w: 1, h: 1}
  }, () => {

    // Picking process start
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
      if (layer.props.visible && layer.props.pickable) {

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
    // Picking process end

    // Process picked info start
    // Decode picked color
    const pickedLayerIndex = pickedColor[3] - 1;
    const pickedLayer = pickedLayerIndex >= 0 ? layers[pickedLayerIndex] : null;
    const pickedObjectIndex = pickedLayer ? pickedLayer.decodePickingColor(pickedColor) : -1;
    const pickedLayerId = pickedLayer && pickedLayer.props.id;
    const affectedLayers = pickedLayer ? [pickedLayer] : [];

    if (mode === 'hover') {
      // only invoke onHover events if picked object has changed
      const lastPickedObjectIndex = lastPickedInfo.index;
      const lastPickedLayerId = lastPickedInfo.layerId;

      if (pickedLayerId === lastPickedLayerId && pickedObjectIndex === lastPickedObjectIndex) {
        // picked object did not change, no need to proceed
        return;
      }

      if (pickedLayerId !== lastPickedLayerId) {
        // We cannot store a ref to lastPickedLayer in the context because
        // the state of an outdated layer is no longer valid
        // and the props may have changed
        const lastPickedLayer = layers.find(l => l.props.id === lastPickedLayerId);
        if (lastPickedLayer) {
          // Let leave event fire before enter event
          affectedLayers.unshift(lastPickedLayer);
        }
      }

      // Update layer manager context
      lastPickedInfo.layerId = pickedLayerId;
      lastPickedInfo.index = pickedObjectIndex;
    }

    const baseInfo = createInfo([x, y], viewport);
    baseInfo.devicePixel = [deviceX, deviceY];
    baseInfo.pixelRatio = pixelRatio;

    affectedLayers.forEach(layer => {
      let info = Object.assign({}, baseInfo);
      info.layer = layer;

      if (layer === pickedLayer) {
        info.color = pickedColor;
        info.index = pickedObjectIndex;
        info.picked = true;
      }

      // Let layers populate its own info object
      info = layer.pickLayer({info, mode});

      // If layer.getPickingInfo() returns null, do not proceed
      if (info) {
        let handled = false;

        // Calling callbacks can have async interactions with React
        // which nullifies layer.state.
        switch (mode) {
        case 'click': handled = layer.props.onClick(info); break;
        case 'hover': handled = layer.props.onHover(info); break;
        default: throw new Error('unknown pick type');
        }

        if (!handled) {
          unhandledPickInfos.push(info);
        }
      }
    });
  });

  return unhandledPickInfos;
}
/* eslint-enable max-depth, max-statements */

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
