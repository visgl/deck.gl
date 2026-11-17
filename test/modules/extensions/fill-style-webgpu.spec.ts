// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {beforeEach, expect, test} from 'vitest';
import {Deck, LayerManager, OrthographicView, OrthographicViewport} from '@deck.gl/core';
import {ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {FillStyleExtension, type FillStyleExtensionProps} from '@deck.gl/extensions';
import {Buffer, luma, Texture} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';

beforeEach(async context => {
  if (!(await getWebGPUTestDevice())) context.skip();
});

const SQUARE = [
  [-40, -40],
  [40, -40],
  [40, 40],
  [-40, 40]
];

test.each([
  {proceduralPattern: false, pattern: true},
  {proceduralPattern: true, pattern: false}
])('FillStyleExtension#WebGPU compiles pattern shaders (%j)', async options => {
  const device = await getWebGPUTestDevice();
  if (!device) return;
  const atlas = device.createTexture({
    width: 1,
    height: 1,
    data: new Uint8Array([255, 255, 255, 255])
  });
  const manager = new LayerManager(device, {
    viewport: new OrthographicViewport({width: 128, height: 128})
  });
  const errors: Error[] = [];
  manager.setProps({onError: error => errors.push(error)});
  const fillPatternProps: FillStyleExtensionProps = options.proceduralPattern
    ? {fillPatternMapping: {pattern: {type: 'hatch'}}}
    : {
        fillPatternAtlas: atlas,
        fillPatternMapping: {pattern: {x: 0, y: 0, width: 1, height: 1}}
      };
  device.handle.pushErrorScope('validation');
  try {
    manager.setLayers([
      new SolidPolygonLayer({
        id: 'fill-style-polygon',
        data: [{polygon: SQUARE}],
        getPolygon: d => d.polygon,
        getFillPattern: () => 'pattern',
        ...fillPatternProps,
        extensions: [new FillStyleExtension(options)]
      }),
      new ScatterplotLayer({
        id: 'fill-style-scatterplot',
        data: [{}],
        getPosition: [0, 0],
        getRadius: 20,
        getFillPattern: () => 'pattern',
        ...fillPatternProps,
        extensions: [new FillStyleExtension(options)]
      })
    ]);
    expect(errors).toEqual([]);
    device.submit();
    const compilationChecks: Promise<void>[] = [];
    for (const layer of manager.layers) {
      expect(layer.getModels().length, layer.id).toBeGreaterThan(0);
      for (const model of layer.getModels()) {
        for (const shader of [model.pipeline.vs, model.pipeline.fs]) {
          if (shader) {
            compilationChecks.push(
              shader.getCompilationInfo().then(messages => {
                expect(
                  messages
                    .filter(message => message.type === 'error')
                    .map(message => message.message),
                  layer.id
                ).toEqual([]);
              })
            );
          }
        }
      }
    }
    await Promise.all(compilationChecks);
    await device.handle.queue.onSubmittedWorkDone();
    expect(await device.handle.popErrorScope()).toBeNull();
  } finally {
    manager.finalize();
    atlas.destroy();
  }
});

test('FillStyleExtension#WebGPU draws a procedural hatch pattern', async () => {
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
    layers: [
      new SolidPolygonLayer({
        id: 'fill-style-hatch',
        data: [{polygon: SQUARE}],
        getPolygon: d => d.polygon,
        getFillColor: [255, 0, 0, 255],
        fillPatternMapping: {pattern: {type: 'hatch', angle: 0, strokeWidth: 4, gap: 4}},
        fillPatternSizeUnits: 'pixels',
        getFillPattern: () => 'pattern',
        extensions: [new FillStyleExtension({proceduralPattern: true})]
      })
    ],
    onError: error => errors.push(error)
  });
  try {
    await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
    deck.redraw('render hatch');
    texture.readBuffer({}, readback);
    const pixels = await readback.readAsync();
    // Sample the column through the center of the square, away from its edges.
    let filledRows = 0;
    let emptyRows = 0;
    for (let y = 30; y < 98; y++) {
      const red = pixels[(y * 128 + 64) * 4];
      if (red > 200) filledRows++;
      if (red < 50) emptyRows++;
    }
    expect(errors).toEqual([]);
    expect(filledRows, 'hatch lines are drawn').toBeGreaterThan(15);
    expect(emptyRows, 'gaps between hatch lines stay empty').toBeGreaterThan(15);
  } finally {
    deck.finalize();
    readback.destroy();
    framebuffer.destroy();
    texture.destroy();
    device.destroy();
    container.remove();
  }
});
