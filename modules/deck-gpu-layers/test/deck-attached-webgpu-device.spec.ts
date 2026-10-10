// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, Layer, OrthographicView} from '@deck.gl/core';
import {Buffer, Texture, type Device, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {ShaderAssembler} from '@luma.gl/shadertools';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {expect, it} from 'vitest';

const VIEWPORT_SIZE = 16;
const REGION_OFFSET = 4;
const REGION_SIZE = 8;
const CHANNEL_TOLERANCE = 2;
const TEST_TIMEOUT_MILLISECONDS = 10_000;
/** `FULL_VIEWPORT_SHADER` fill color as 8-bit RGBA. */
const EXPECTED_PIXEL = [51, 153, 255, 255];

const FULL_VIEWPORT_SHADER = /* wgsl */ `\
@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  var positions = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
  return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

@fragment
fn fragmentMain() -> @location(0) vec4<f32> {
  return vec4<f32>(0.2, 0.6, 1.0, 1.0);
}
`;

/** Minimal deck.gl layer that covers the viewport with one opaque color. */
class FullViewportLayer extends Layer {
  static override layerName = 'FullViewportLayer';

  override initializeState(): void {
    const model = new Model(this.context.device, {
      id: `${this.id}-model`,
      source: FULL_VIEWPORT_SHADER,
      shaderAssembler: ShaderAssembler.getDefaultShaderAssembler('wgsl'),
      topology: 'triangle-list',
      vertexCount: 3,
      bufferLayout: [],
      parameters: {depthWriteEnabled: false, depthCompare: 'always'}
    });
    this.setState({model});
  }

  override getModels(): Model[] {
    const {model} = this.state as {model?: Model};
    return model ? [model] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    (this.state as {model: Model}).model.draw(renderPass);
  }
}

it('Deck renders one frame on an attached application GPUDevice', async context => {
  // A missing WebGPU implementation must fail this test instead of skipping it.
  expect(navigator.gpu, 'navigator.gpu').toBeTruthy();
  const gpuAdapter = await navigator.gpu.requestAdapter();
  if (!gpuAdapter) {
    // Headless Chromium can transiently return no adapter (for example while its GPU
    // connection is restored). That is an environment limitation, not attach() behavior.
    context.skip();
    return;
  }
  const gpuDevice = await gpuAdapter.requestDevice({
    requiredLimits: {
      maxStorageBuffersPerShaderStage: gpuAdapter.limits.maxStorageBuffersPerShaderStage
    }
  });

  const parent = document.createElement('div');
  parent.style.width = `${VIEWPORT_SIZE}px`;
  parent.style.height = `${VIEWPORT_SIZE}px`;
  document.body.append(parent);
  const canvas = document.createElement('canvas');
  canvas.style.width = `${VIEWPORT_SIZE}px`;
  canvas.style.height = `${VIEWPORT_SIZE}px`;
  parent.append(canvas);

  const device = await webgpuAdapter.attach(gpuDevice, {
    createCanvasContext: {canvas, useDevicePixels: false, alphaMode: 'opaque'}
  });
  // Render into a copyable texture and read it back with WebGPU. Copying the presented
  // WebGPU canvas into a 2D canvas depends on browser compositor interop that headless
  // CI configurations do not reliably provide.
  const colorTexture = device.createTexture({
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
    format: 'rgba8unorm',
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
    colorAttachments: [colorTexture],
    depthStencilAttachment: 'depth24plus'
  });

  let deck: Deck<OrthographicView> | null = null;
  let deckError: Error | null = null;
  let hasRenderedFrame = false;

  try {
    gpuDevice.pushErrorScope('validation');
    deck = new Deck({
      device,
      parent,
      width: VIEWPORT_SIZE,
      height: VIEWPORT_SIZE,
      useDevicePixels: false,
      _framebuffer: framebuffer,
      views: new OrthographicView({id: 'main'}),
      initialViewState: {target: [0, 0], zoom: 0},
      layers: [new FullViewportLayer({id: 'full-viewport'})],
      onError: error => {
        deckError = error;
      },
      onAfterRender: () => {
        if (deck?.isInitialized) {
          hasRenderedFrame = true;
        }
      }
    });

    const timeout = Date.now() + TEST_TIMEOUT_MILLISECONDS;
    while (!hasRenderedFrame && !deckError && Date.now() < timeout) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    device.submit();
    await gpuDevice.queue.onSubmittedWorkDone();
    expect(await gpuDevice.popErrorScope()).toBeNull();
    expect(deckError).toBeNull();
    expect(hasRenderedFrame, 'Deck rendered a frame').toBe(true);

    const actualPixels = await readTexturePixels(device, colorTexture);
    const actualRegion = getPixelRegion(actualPixels);
    for (let byteIndex = 0; byteIndex < actualRegion.length; byteIndex++) {
      const expectedValue = EXPECTED_PIXEL[byteIndex % 4];
      if (Math.abs(actualRegion[byteIndex] - expectedValue) > CHANNEL_TOLERANCE) {
        expect.fail(
          `pixel byte ${byteIndex}: expected ${expectedValue}, got ${actualRegion[byteIndex]}`
        );
      }
    }

    deck.finalize();
    deck = null;
    framebuffer.destroy();
    colorTexture.destroy();
    device.destroy();

    gpuDevice.pushErrorScope('validation');
    const buffer = gpuDevice.createBuffer({size: 16, usage: GPUBufferUsage.COPY_DST});
    await gpuDevice.queue.onSubmittedWorkDone();
    expect(await gpuDevice.popErrorScope(), 'GPUDevice is usable after Deck').toBeNull();
    buffer.destroy();
  } finally {
    deck?.finalize();
    parent.remove();
    gpuDevice.destroy();
  }
});

/** Reads tightly packed RGBA8 rows of a texture through a GPU copy. */
async function readTexturePixels(device: Device, texture: Texture): Promise<Uint8Array> {
  const layout = texture.computeMemoryLayout({width: VIEWPORT_SIZE, height: VIEWPORT_SIZE});
  const readBuffer = device.createBuffer({
    byteLength: layout.byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  try {
    texture.readBuffer({width: VIEWPORT_SIZE, height: VIEWPORT_SIZE}, readBuffer);
    const bytes = await readBuffer.readAsync();
    const pixels = new Uint8Array(VIEWPORT_SIZE * VIEWPORT_SIZE * 4);
    for (let row = 0; row < VIEWPORT_SIZE; row++) {
      const rowStart = row * layout.bytesPerRow;
      pixels.set(bytes.subarray(rowStart, rowStart + VIEWPORT_SIZE * 4), row * VIEWPORT_SIZE * 4);
    }
    return pixels;
  } finally {
    readBuffer.destroy();
  }
}

function getPixelRegion(pixels: Uint8Array): Uint8Array {
  const region = new Uint8Array(REGION_SIZE * REGION_SIZE * 4);
  for (let row = 0; row < REGION_SIZE; row++) {
    const sourceStart = ((row + REGION_OFFSET) * VIEWPORT_SIZE + REGION_OFFSET) * 4;
    region.set(pixels.subarray(sourceStart, sourceStart + REGION_SIZE * 4), row * REGION_SIZE * 4);
  }
  return region;
}
