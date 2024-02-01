/* global document */

import {Framebuffer, Texture} from '@luma.gl/core';
import {readPixelsToArray} from '@luma.gl/webgl';

/** Debug utility to draw FBO contents onto screen */
// eslint-disable-next-line
export const debugFBO = function (
  fbo: Framebuffer | Texture,
  {
    id,
    minimap,
    opaque,
    top = '0',
    left = '0',
    rgbaScale = 1
  }: {
    id: string;
    minimap?: boolean;
    opaque?: boolean;
    top?: string;
    left?: string;
    rgbaScale?: number;
  }
) {
  const color = readPixelsToArray(fbo);
  let canvas = document.getElementById(id) as HTMLCanvasElement;
  let canvasInfo = document.getElementById(`${id}-info`) as HTMLDivElement;
  const canvasHeight = (minimap ? 2 : 1) * fbo.height;
  const singlePixel = fbo.width === 1 && fbo.height === 1;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.title = id;
    canvas.style.zIndex = '100';
    canvas.style.position = 'absolute';
    canvas.style.top = top;
    canvas.style.left = left;
    canvas.style.border = 'blue 1px solid';
    canvas.style.transform = 'scaleY(-1)';
    document.body.appendChild(canvas);

    canvasInfo = document.createElement('div');
    canvasInfo.id = `${id}-info`;
    canvasInfo.innerHTML = 'HI';
    canvasInfo.style.zIndex = '100';
    canvasInfo.style.position = 'absolute';
    canvasInfo.style.top = top;
    canvasInfo.style.left = left;
    canvasInfo.style.padding = '4px';
    canvasInfo.style.color = 'white';
    canvasInfo.style['white-space'] = 'pre';
    canvasInfo.style.fontSize = '10px';
    canvasInfo.style.background = 'rgba(0,0,0,0.5)';
    document.body.appendChild(canvasInfo);
  }
  if (canvas.width !== fbo.width || canvas.height !== canvasHeight) {
    canvas.width = fbo.width;
    canvas.height = canvasHeight;
    canvas.style.width = fbo.width < 100 ? '64px' : '400px';
  }
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(canvas.width, canvas.height);

  // Minimap
  if (minimap) {
    const zoom = 2; // Zoom factor for minimap
    const {width, height} = canvas;
    for (let y = 0; y < width; y++) {
      for (let x = 0; x < width; x++) {
        const d = 4 * (x + y * width); // destination pixel
        const s = 4 * (Math.floor(x / zoom) + Math.floor(y / zoom) * width); // source
        imageData.data[d + 0] = color[s + 0] * rgbaScale;
        imageData.data[d + 1] = color[s + 1] * rgbaScale;
        imageData.data[d + 2] = color[s + 2] * rgbaScale;
        imageData.data[d + 3] = opaque ? 255 : color[s + 3] * rgbaScale;
      }
    }
  }

  // Full map
  const maxRGBA = [0, 0, 0, 0];
  const offset = minimap ? color.length : 0;
  console.log(`drawing FBO: ${id}`);
  for (let i = 0; i < color.length; i += 4) {
    imageData.data[offset + i + 0] = color[i + 0] * rgbaScale;
    imageData.data[offset + i + 1] = color[i + 1] * rgbaScale;
    imageData.data[offset + i + 2] = color[i + 2] * rgbaScale;
    imageData.data[offset + i + 3] = opaque ? 255 : color[i + 3] * rgbaScale;

    for (let c = 0; c < 4; c++) {
      maxRGBA[c] = Math.max(maxRGBA[c], color[i + c]);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const debugInfo = singlePixel ? color : maxRGBA;
  canvasInfo.innerHTML = [...debugInfo].map(n => n.toFixed(8)).join('\n');
};
