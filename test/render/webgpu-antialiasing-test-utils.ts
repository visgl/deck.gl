// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {luma, Texture, Buffer} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {Deck, OrthographicView} from '@deck.gl/core';

const WIDTH = 240;
const HEIGHT = 180;

export const STROKE_COLOR: [number, number, number] = [255, 0, 0];

export type EdgeStats = {partial: number; worstOvershoot: number};

/** Render feathered geometry on WebGPU and measure premultiplication at partial-coverage pixels. */
export async function measureWebGPUEdges(
  layers: any[],
  views = new OrthographicView(),
  viewState: Record<string, unknown> = {target: [0, 0, 0], zoom: 0}
): Promise<EdgeStats> {
  const container = document.createElement('div');
  container.style.cssText = `position:absolute;top:0;left:0;width:${WIDTH}px;height:${HEIGHT}px;`;
  document.body.appendChild(container);

  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    createCanvasContext: {
      container,
      width: WIDTH,
      height: HEIGHT,
      useDevicePixels: false
    },
    alphaMode: 'premultiplied'
  });

  // Render offscreen because the swapchain has no COPY_SRC. Framebuffer dimensions are not derived
  // from attachments, so pass them explicitly.
  const texture = device.createTexture({
    format: 'rgba8unorm',
    width: WIDTH,
    height: HEIGHT,
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({
    width: WIDTH,
    height: HEIGHT,
    colorAttachments: [texture],
    depthStencilAttachment: 'depth24plus'
  });

  const deck = new Deck({
    device,
    container,
    width: WIDTH,
    height: HEIGHT,
    useDevicePixels: false,
    views,
    viewState,
    _framebuffer: framebuffer,
    layers
  });

  await new Promise<void>(resolve => {
    deck.setProps({onAfterRender: () => resolve()});
  });

  const layout = texture.computeMemoryLayout();
  const readback = device.createBuffer({
    byteLength: layout.byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  texture.readBuffer({}, readback);
  const pixels = await readback.readAsync();

  let partial = 0;
  let worstOvershoot = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3];
    if (alpha === 0 || alpha === 255) {
      continue;
    }
    partial++;
    // Premultiplied red at coverage c is (255*c, 0, 0, 255*c), so red should track alpha.
    worstOvershoot = Math.max(worstOvershoot, pixels[index] - alpha);
  }

  deck.finalize();
  device.destroy();
  container.remove();
  return {partial, worstOvershoot};
}
