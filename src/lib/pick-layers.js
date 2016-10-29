/* global window */
import {GL, glContextWithState, FramebufferObject} from 'luma.gl';

/* eslint-disable max-depth, max-statements */
export function pickLayers(gl, {
  layers,
  uniforms = {},
  x,
  y,
  type
}) {
  // Set up a frame buffer if needed
  // TODO - cache picking fbo (needs to be resized)?
  const pickingFBO = new FramebufferObject(gl, {
    width: gl.canvas.width,
    height: gl.canvas.height
  });

  // Convert from canvas top-left to WebGL bottom-left coordinates
  // And compensate for pixelRatio
  const pixelRatio = typeof window !== 'undefined' ?
    window.devicePixelRatio : 1;
  const deviceX = x * pixelRatio;
  const deviceY = gl.canvas.height - y * pixelRatio;

  // TODO - just return glContextWithState once luma updates
  let value = null;

  // Make sure we clear scissor test and fbo bindings in case of exceptions
  // We are only interested in one pixel, no need to render anything else
  return glContextWithState(gl, {
    frameBuffer: pickingFBO,
    framebuffer: pickingFBO,
    scissorTest: {x: deviceX, y: deviceY, w: 1, h: 1}
  }, () => {
    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];

      if (layer.props.pickable) {
        // Clear the frame buffer, render and sample
        gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        const info = layer.pickLayer({
          uniforms,
          pickEnableUniforms: {renderPickingBuffer: 1, pickingEnabled: 1},
          pickDisableUniforms: {renderPickingBuffer: 0, pickingEnabled: 0},
          x, y,
          deviceX, deviceY
        });
        if (info) {
          // Assign potentially useful props to the "info" object

          const pixel = [x, y];
          const devicePixel = [deviceX, deviceY];
          const lngLat = layer.unproject(pixel);

          Object.assign(info, {
            layer,
            x,
            y,
            deviceX,
            deviceY,
            pixel,
            devicePixel,
            pixelRatio,
            lngLat,
            // Backwards compatibility...
            geoCoords: {lon: lngLat[0], lng: lngLat[0], lat: lngLat[1]}
          });

          // Give layer a chance to add details and modify index
          layer.pickInfo(info);

          // If props.data is an indexable array, get the object
          if (Array.isArray(layer.props.data)) {
            info.object = layer.props.data[info.index];
          }

          switch (type) {
          case 'click': layer.click(info); break;
          case 'hover': layer.hover(info); break;
          default: throw new Error('unknown pick type');
          }
          value = info;
          return info;
        }
      }
    }
    return null;
  }) || value;
}
/* eslint-enable max-depth, max-statements */
