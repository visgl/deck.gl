/* global window */
import {GL, glContextWithState} from 'luma.gl';

/* eslint-disable max-depth, max-statements */
export function pickLayers(gl, {
  layers,
  pickingFBO,
  uniforms = {},
  x,
  y,
  mode
}) {
  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  const pixelRatio = typeof window !== 'undefined' ?
    window.devicePixelRatio : 1;
  const deviceX = x * pixelRatio;
  const deviceY = gl.canvas.height - y * pixelRatio;

  // TODO - just return glContextWithState once luma updates
  const pickedInfos = [];

  // Make sure we clear scissor test and fbo bindings in case of exceptions
  // We are only interested in one pixel, no need to render anything else
  glContextWithState(gl, {
    frameBuffer: pickingFBO,
    framebuffer: pickingFBO,
    scissorTest: {x: deviceX, y: deviceY, w: 1, h: 1}
  }, () => {
    let zOrder = 0;

    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];

      if (layer.props.visible && layer.props.pickable) {
        // Clear the frame buffer, render and sample
        gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        const info = createInfo({
          layer,
          pixel: [x, y],
          devicePixel: [deviceX, deviceY],
          pixelRatio
        });

        layer.pickLayer({
          info,
          uniforms,
          pickEnableUniforms: {renderPickingBuffer: 1, pickingEnabled: 1},
          pickDisableUniforms: {renderPickingBuffer: 0, pickingEnabled: 0},
          deviceX, deviceY,
          mode
        });

        if (info.index >= 0) {
          info.picked = true;
          info.zOrder = zOrder++;
          // If props.data is an indexable array, get the object
          if (Array.isArray(layer.props.data)) {
            info.object = layer.props.data[info.index];
          }
        }

        pickedInfos.push(info);
      }
    }
  });

  // Calling callbacks can have async interactions with React
  // which nullifies layer.state.
  const unhandledPickInfos = [];
  for (const info of pickedInfos) {
    let handled = null;
    switch (mode) {
    case 'click': handled = info.layer.props.onClick(info); break;
    case 'hover': handled = info.layer.props.onHover(info); break;
    default: throw new Error('unknown pick type');
    }

    if (!handled) {
      unhandledPickInfos.push(info);
    }
  }

  return unhandledPickInfos;
}
/* eslint-enable max-depth, max-statements */

function createInfo({
  info,
  layer,
  pixel,
  devicePixel,
  pixelRatio
}) {
  // Assign a number of potentially useful props to the "info" object
  return {
    layer,
    index: -1,
    picked: false,
    x: pixel[0],
    y: pixel[1],
    pixel,
    devicePixel,
    pixelRatio,
    lngLat: layer.unproject(pixel)
  };
}
