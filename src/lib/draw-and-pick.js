/* global window */
import {GL, glContextWithState} from 'luma.gl';
import {getUniformsFromViewport} from './viewport-uniforms';
import {log, getBlendMode, setBlendMode} from './utils';

const EMPTY_PIXEL = new Uint8Array(4);
let renderCount = 0;

export function drawLayers({layers, pass}) {
  log.log(2, `DRAWING ${layers.length} layers`);

  let visibleCount = 0;
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
  mode
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

    // Clear the frame buffer
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    // Save current blend settings
    const oldBlendMode = getBlendMode(gl);
    // Set blend mode for picking
    // always overwrite existing pixel with [r,g,b,layerIndex]
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.CONSTANT_ALPHA, gl.ZERO);
    gl.blendEquation(gl.FUNC_ADD);

    // Render all pickable layers
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
    const color = new Uint8Array(4);
    gl.readPixels(deviceX, deviceY, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, color);

    // Decode alpha to layer index
    const pickedLayer = layers[color[3] - 1];
    const baseInfo = Object.assign(
      createInfo([x, y], viewport),
      {
        devicePixel: [deviceX, deviceY],
        pixelRatio
      }
    );

    layers.forEach(layer => {
      const info = Object.assign({}, baseInfo, {layer});

      if (layer === pickedLayer) {
        const index = layer.decodePickingColor(color);
        info.index = index;
        info.color = color;
        if (index >= 0) {
          info.picked = true;
          // If props.data is an indexable array, get the object
          if (Array.isArray(layer.props.data)) {
            info.object = layer.props.data[index];
          }
        }
      }

      const handled = layer.pickLayer({info, mode});

      if (!handled) {
        unhandledPickInfos.push(info);
      }
    });

    // restore blend mode
    setBlendMode(gl, oldBlendMode);
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
