// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {beforeEach, expect, test} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {
  PathLayer,
  ScatterplotLayer,
  _TextBackgroundLayer as TextBackgroundLayer
} from '@deck.gl/layers';
import {PathStyleExtension, type PathStyleExtensionProps} from '@deck.gl/extensions';
import {Buffer, luma, Texture} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';

beforeEach(async context => {
  if (!(await getWebGPUTestDevice())) context.skip();
});

test.each(['scatterplot', 'text-background'] as const)(
  'PathStyleExtension#WebGPU highlights filled dash gaps on %s',
  async layerType => {
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;top:0;left:0;width:128px;height:128px';
    document.body.appendChild(container);
    const device = await luma.createDevice({
      type: 'webgpu',
      adapters: [webgpuAdapter],
      createCanvasContext: {
        container: document.createElement('div'),
        width: 128,
        height: 128,
        useDevicePixels: false
      }
    });
    const texture = device.createTexture({
      width: 128,
      height: 128,
      format: 'rgba8unorm',
      usage: Texture.RENDER | Texture.COPY_SRC
    });
    const framebuffer = device.createFramebuffer({
      width: 128,
      height: 128,
      colorAttachments: [texture],
      depthStencilAttachment: 'depth24plus'
    });
    const readback = device.createBuffer({
      byteLength: texture.computeMemoryLayout().byteLength,
      usage: Buffer.COPY_DST | Buffer.MAP_READ
    });
    const props = {
      id: 'highlighted-dash',
      data: [{position: [0, 0, 0]}],
      getPosition: [0, 0, 0] as [number, number, number],
      getFillColor: [255, 0, 0, 255] as [number, number, number, number],
      getLineColor: [255, 0, 0, 255] as [number, number, number, number],
      getDashArray: [1, 2] as [number, number],
      extensions: [new PathStyleExtension({dash: true})],
      pickable: true,
      highlightedObjectIndex: 0,
      highlightColor: [0, 255, 0, 255] as [number, number, number, number]
    };
    const layer =
      layerType === 'scatterplot'
        ? new ScatterplotLayer({
            ...props,
            stroked: true,
            filled: true,
            getRadius: 30,
            radiusUnits: 'pixels',
            getLineWidth: 8,
            lineWidthUnits: 'pixels'
          })
        : new TextBackgroundLayer({
            ...props,
            stroked: true,
            getBoundingRect: [-30, -30, 60, 60],
            getLineWidth: 8
          });
    const errors: Error[] = [];
    const deck = new Deck({
      device,
      parent: container,
      width: 128,
      height: 128,
      useDevicePixels: false,
      views: new OrthographicView(),
      initialViewState: {target: [0, 0, 0], zoom: 0},
      _framebuffer: framebuffer,
      layers: [layer],
      onError: error => errors.push(error)
    });
    try {
      await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
      deck.redraw('test highlighted dash');
      texture.readBuffer({}, readback);
      const pixels = await readback.readAsync();
      let greenPixels = 0;
      let redPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 1] > 100 && pixels[i] < 20) greenPixels++;
        if (pixels[i] > 100 && pixels[i + 1] < 20) redPixels++;
      }
      expect(errors).toEqual([]);
      expect(greenPixels).toBeGreaterThan(100);
      expect(redPixels, 'dash gaps must retain the highlight').toBe(0);
    } finally {
      deck.finalize();
      readback.destroy();
      framebuffer.destroy();
      texture.destroy();
      device.destroy();
      container.remove();
    }
  }
);

test('PathStyleExtension#WebGPU solid dash pattern preserves rounded antialiasing', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    createCanvasContext: {
      container: document.createElement('div'),
      width: 128,
      height: 128,
      useDevicePixels: false
    }
  });
  const texture = device.createTexture({
    width: 128,
    height: 128,
    format: 'rgba8unorm',
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({
    width: 128,
    height: 128,
    colorAttachments: [texture],
    depthStencilAttachment: 'depth24plus'
  });
  const readback = device.createBuffer({
    byteLength: texture.computeMemoryLayout().byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  const layer = new PathLayer<{path: [number, number][]}, PathStyleExtensionProps>({
    id: 'solid-path',
    data: [
      {
        path: [
          [-40, 0],
          [40, 0]
        ]
      }
    ],
    getPath: d => d.path,
    widthUnits: 'pixels',
    getWidth: 11,
    getColor: [255, 0, 0],
    capRounded: true,
    jointRounded: true,
    antialiasing: true
  });
  const errors: Error[] = [];
  const deck = new Deck({
    device,
    parent: container,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    _framebuffer: framebuffer,
    layers: [layer],
    onError: error => errors.push(error)
  });
  try {
    await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
    deck.redraw('render plain path');
    texture.readBuffer({}, readback);
    const plain = new Uint8Array(await readback.readAsync());
    await new Promise<void>(resolve =>
      deck.setProps({
        layers: [
          layer.clone({extensions: [new PathStyleExtension({dash: true})], getDashArray: [0, 0]})
        ],
        onAfterRender: () => resolve()
      })
    );
    deck.redraw('render solid dash');
    texture.readBuffer({}, readback);
    const dashed = await readback.readAsync();
    expect(errors).toEqual([]);
    expect(plain.some(value => value > 0)).toBe(true);
    expect(dashed).toEqual(plain);
  } finally {
    deck.finalize();
    readback.destroy();
    framebuffer.destroy();
    texture.destroy();
    device.destroy();
    container.remove();
  }
});
