// TODO - this is the new picking for deck.gl
/* eslint-disable max-statements, no-try-catch */
import {GL, glContextWithState, FramebufferObject} from 'luma.gl';

/* eslint-disable max-depth */
export function pickModels(gl, {
  layers,
  uniforms = {},
  x,
  y,
  pixelRatio,
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
  x *= pixelRatio;
  y = gl.canvas.height - y * pixelRatio;

  // TODO - just return glContextWithState once luma updates
  let value = null;

  // Make sure we clear scissor test and fbo bindings in case of exceptions
  // We are only interested in one pixel, no need to render anything else
  glContextWithState(gl, {
    frameBuffer: pickingFBO,
    framebuffer: pickingFBO,
    scissorTest: {x, y, w: 1, h: 1}
  }, () => {
    for (let i = layers.length - 1; i >= 0; --i) {
      const layer = layers[i];

      if (layer.props.pickable) {
        // Clear the frame buffer, render and sample
        gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        const info = layer.pickLayer({uniforms, x, y});
        if (info) {
          info.layer = layer;
          info.x = x;
          info.y = y;
          info.pixelRatio = pixelRatio;
          switch (type) {
          case 'click': layer.onClick(info); break;
          case 'hover': layer.onHover(info); break;
          default: break;
          }
          value = info;
          return info;
        }
      }
    }
    return null;
  });

  return value;
}
/* eslint-enable max-depth */
