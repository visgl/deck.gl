/* global document */

import {Framebuffer, readPixelsToArray} from '@luma.gl/core';

/** Debug utility to draw FBO contents onto screen */
// eslint-disable-next-line
export const debugFBO = function (
  fbo: Framebuffer,
  {minimap, opaque}: {minimap?: boolean; opaque?: boolean} = {}
) {
  const color = readPixelsToArray(fbo);
  let canvas = document.getElementById('fbo-canvas') as HTMLCanvasElement;
  const canvasHeight = (minimap ? 2 : 1) * fbo.height;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'fbo-canvas';
    canvas.style.zIndex = '100';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.right = '0';
    canvas.style.border = 'blue 1px solid';
    canvas.style.transform = 'scaleY(-1)';
    document.body.appendChild(canvas);
  }
  if (canvas.width !== fbo.width || canvas.height !== canvasHeight) {
    canvas.width = fbo.width;
    canvas.height = canvasHeight;
    canvas.style.width = '400px';
  }
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  // Minimap
  if (minimap) {
    const zoom = 8; // Zoom factor for minimap
    const {width, height} = canvas;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const d = 4 * (x + y * width); // destination pixel
        const s = 4 * (Math.floor(x / zoom) + Math.floor(y / zoom) * width); // source
        imageData.data[d + 0] = color[s + 0];
        imageData.data[d + 1] = color[s + 1];
        imageData.data[d + 2] = color[s + 2];
        imageData.data[d + 3] = opaque ? 255 : color[s + 3];
      }
    }
  }

  // Full map
  const offset = minimap ? color.length : 0;
  for (let i = 0; i < color.length; i += 4) {
    imageData.data[offset + i + 0] = color[i + 0];
    imageData.data[offset + i + 1] = color[i + 1];
    imageData.data[offset + i + 2] = color[i + 2];
    imageData.data[offset + i + 3] = opaque ? 255 : color[i + 3];
  }

  ctx.putImageData(imageData, 0, 0);
};
