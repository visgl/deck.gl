// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, OrthographicView, type Layer} from '@deck.gl/core';
import {LuSpatialPointLayer} from '@deck.gl-community/gpu-layers';
import {Buffer, type Device} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {DrawCommandBuffer} from '@luma.gl/gpgpu/gpu-core';
import {ShaderAssembler} from '@luma.gl/shadertools';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {expect, it} from 'vitest';
import {vi, type MockInstance} from 'vitest';

const TEST_VIEWPORT_SIZE = 64;
const TEST_TIMEOUT_MILLISECONDS = 10_000;
type TestDeck = Deck<OrthographicView>;

it('LuSpatialPointLayer links and submits a caller-owned indirect draw', async () => {
  const device = await getWebGPUTestDevice();
  if (!device) {
    void 0;
    void 0;
    return;
  }

  const positions = device.createBuffer({
    id: 'luspatial-browser-test-positions',
    data: new Float32Array([-0.25, -0.25, 0.25, 0.25]),
    usage: Buffer.STORAGE | Buffer.COPY_DST
  });
  const pointIds = device.createBuffer({
    id: 'luspatial-browser-test-point-ids',
    data: new Uint32Array([0, 1]),
    usage: Buffer.STORAGE | Buffer.COPY_DST
  });
  const drawCommands = new DrawCommandBuffer(device, {
    id: 'luspatial-browser-test-draw-commands',
    type: 'draw',
    commands: [{vertexCount: 6, instanceCount: 2}]
  });
  const drawSpy = vi.spyOn(drawCommands, 'draw');
  let layerError: Error | null = null;
  let deckError: Error | null = null;
  const layer = new LuSpatialPointLayer({
    id: 'luspatial-browser-test-layer',
    data: [],
    positions,
    pointIds,
    drawCommands,
    pickable: true,
    onError: error => {
      layerError = error;
      return true;
    }
  });
  const parent = document.createElement('div');
  parent.style.width = `${TEST_VIEWPORT_SIZE}px`;
  parent.style.height = `${TEST_VIEWPORT_SIZE}px`;
  document.body.append(parent);
  let restoreShaderAssembler = () => {};
  let deck: TestDeck | null = null;

  try {
    deck = createTestDeck(
      device,
      parent,
      layer,
      error => {
        deckError = error;
      },
      restore => {
        restoreShaderAssembler = restore;
      }
    );
    await waitForDeckInitialization(deck, () => layerError ?? deckError);
    const model = await waitForLayerModel(layer, () => layerError ?? deckError);
    await waitForPipeline(model);

    drawSpy.mockClear();
    deck.redraw('luSpatial browser smoke');
    await waitForIndirectDraw(drawSpy, () => layerError ?? deckError);

    expect(model.pipeline.linkStatus, 'the real WebGPU pipeline linked').toBe('success');
    expect(layerError, 'the layer reported no error').toBe(null);
    expect(deckError, 'Deck reported no rendering error').toBe(null);
    expect(
      Boolean(drawSpy.mock.calls.length > 0),
      'the real indirect draw command was submitted'
    ).toBe(true);

    deck.finalize();
    deck = null;
    expect(Boolean(positions.destroyed), 'the caller-owned position buffer remains alive').toBe(
      false
    );
    expect(Boolean(pointIds.destroyed), 'the caller-owned point-ID buffer remains alive').toBe(
      false
    );
    expect(
      Boolean(drawCommands.buffer.destroyed),
      'the caller-owned command buffer remains alive'
    ).toBe(false);
  } finally {
    deck?.finalize();
    restoreShaderAssembler();
    parent.remove();
    drawSpy.mockRestore();
    drawCommands.destroy();
    positions.destroy();
    pointIds.destroy();
  }

  void 0;
});

function createTestDeck(
  device: Device,
  parent: HTMLDivElement,
  layer: Layer,
  onError: (error: Error) => void,
  onShaderAssemblerReady: (restore: () => void) => void
): TestDeck {
  return new Deck({
    parent,
    device,
    width: TEST_VIEWPORT_SIZE,
    height: TEST_VIEWPORT_SIZE,
    views: new OrthographicView({id: 'main'}),
    initialViewState: {target: [0, 0], zoom: 0},
    layers: [layer],
    onError,
    onDeviceInitialized: initializedDevice => {
      const getDefaultShaderAssembler = ShaderAssembler.getDefaultShaderAssembler;
      const shaderAssemblerSpy = vi.spyOn(ShaderAssembler, 'getDefaultShaderAssembler');
      const restore = () => shaderAssemblerSpy.mockRestore();
      onShaderAssemblerReady(restore);
      shaderAssemblerSpy.mockImplementation(shaderLanguage => {
        if (shaderLanguage !== undefined) {
          return getDefaultShaderAssembler.call(ShaderAssembler, shaderLanguage);
        }
        restore();
        return getDefaultShaderAssembler.call(
          ShaderAssembler,
          initializedDevice.info.shadingLanguage
        );
      });
    }
  });
}

async function waitForDeckInitialization(
  deck: TestDeck,
  getError: () => Error | null
): Promise<void> {
  const timeout = Date.now() + TEST_TIMEOUT_MILLISECONDS;
  while (Date.now() < timeout && !deck.isInitialized) {
    throwIfError(getError());
    await nextFrame();
  }
  throwIfError(getError());
  if (!deck.isInitialized) {
    throw new Error('Deck did not initialize');
  }
}

async function waitForLayerModel(layer: Layer, getError: () => Error | null): Promise<Model> {
  const timeout = Date.now() + TEST_TIMEOUT_MILLISECONDS;
  while (Date.now() < timeout) {
    const model = (layer.state as {model?: Model} | undefined)?.model;
    if (model) {
      return model;
    }
    throwIfError(getError());
    await nextFrame();
  }
  throwIfError(getError());
  throw new Error(`${layer.id} did not create a draw model`);
}

async function waitForPipeline(model: Model): Promise<void> {
  const timeout = Date.now() + TEST_TIMEOUT_MILLISECONDS;
  while (Date.now() < timeout && model.pipeline.linkStatus === 'pending') {
    await nextFrame();
  }
  if (model.pipeline.linkStatus !== 'success') {
    const vertexMessages = await model.pipeline.vs.getCompilationInfo();
    const fragmentMessages = await model.pipeline.fs?.getCompilationInfo();
    throw new Error(
      `${model.id} pipeline did not link successfully: ${JSON.stringify({vertexMessages, fragmentMessages})}`
    );
  }
}

async function waitForIndirectDraw(
  drawSpy: MockInstance<DrawCommandBuffer['draw']>,
  getError: () => Error | null
): Promise<void> {
  const timeout = Date.now() + TEST_TIMEOUT_MILLISECONDS;
  while (Date.now() < timeout && drawSpy.mock.calls.length === 0) {
    throwIfError(getError());
    await nextFrame();
  }
  throwIfError(getError());
  if (drawSpy.mock.calls.length === 0) {
    throw new Error('LuSpatialPointLayer did not submit its indirect draw');
  }
}

function throwIfError(error: Error | null): void {
  if (error) {
    throw error;
  }
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
