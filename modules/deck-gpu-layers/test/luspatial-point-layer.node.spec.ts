// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {readFileSync} from 'node:fs';
import type {LayerContext} from '@deck.gl/core';
import {LuSpatialPointLayer} from '@deck.gl-community/gpu-layers';
import type {Buffer, Device, RenderPass} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import type {DrawCommandBuffer} from '@luma.gl/gpgpu/gpu-core';
import {describe, expect, test, vi} from 'vitest';

function makeLayer(
  overrides: Partial<ConstructorParameters<typeof LuSpatialPointLayer>[0]> = {}
): LuSpatialPointLayer {
  return new LuSpatialPointLayer({
    id: 'test-luspatial-points',
    positions: {} as Buffer,
    pointIds: {} as Buffer,
    drawCommands: {type: 'draw', draw: vi.fn()} as unknown as DrawCommandBuffer,
    ...overrides
  });
}

describe('LuSpatialPointLayer resource lifecycle', () => {
  test('rejects non-WebGPU devices before allocating resources', () => {
    const createBuffer = vi.fn();
    const layer = makeLayer();

    expect(() =>
      layer.initializeState({
        device: {type: 'webgl', createBuffer} as unknown as Device
      } as LayerContext)
    ).toThrow('LuSpatialPointLayer requires WebGPU');
    expect(createBuffer).not.toHaveBeenCalled();
  });

  test('rejects indexed draw commands before allocating resources', () => {
    const createBuffer = vi.fn();
    const layer = makeLayer({
      drawCommands: {type: 'draw-indexed'} as unknown as DrawCommandBuffer
    });

    expect(() =>
      layer.initializeState({
        device: {type: 'webgpu', createBuffer} as unknown as Device
      } as LayerContext)
    ).toThrow('LuSpatialPointLayer requires non-indexed draw commands');
    expect(createBuffer).not.toHaveBeenCalled();
  });

  test('releases its uniform buffer after model construction fails', () => {
    const destroy = vi.fn();
    const device = {
      type: 'webgpu',
      createBuffer: vi.fn(() => ({destroy}))
    } as unknown as Device;
    const layer = makeLayer();

    expect(() => layer.initializeState({device} as LayerContext)).toThrow();
    expect(destroy).toHaveBeenCalledOnce();
  });

  test('destroys owned render resources without destroying borrowed inputs', () => {
    const positions = {destroy: vi.fn()} as unknown as Buffer;
    const pointIds = {destroy: vi.fn()} as unknown as Buffer;
    const drawCommands = {
      draw: vi.fn(),
      destroy: vi.fn()
    } as unknown as DrawCommandBuffer;
    const model = {destroy: vi.fn()} as unknown as Model;
    const styleUniforms = {destroy: vi.fn()} as unknown as Buffer;
    const layer = makeLayer({positions, pointIds, drawCommands});
    layer.state = {model, styleUniforms};

    layer.finalizeState({} as LayerContext);

    expect(model.destroy).toHaveBeenCalledOnce();
    expect(styleUniforms.destroy).toHaveBeenCalledOnce();
    expect(positions.destroy).not.toHaveBeenCalled();
    expect(pointIds.destroy).not.toHaveBeenCalled();
    expect(drawCommands.destroy).not.toHaveBeenCalled();
    expect(layer.getModels()).toEqual([]);
  });
});

describe('LuSpatialPointLayer rendering', () => {
  test('accepts a viewport radius accessor during Deck prop validation', () => {
    const layer = makeLayer({radiusScale: () => 1});

    expect(() => layer.validateProps()).not.toThrow();
  });

  test('rebinds replacement source buffers', () => {
    const oldPositions = {} as Buffer;
    const oldPointIds = {} as Buffer;
    const positions = {} as Buffer;
    const pointIds = {} as Buffer;
    const setBindings = vi.fn();
    const layer = makeLayer({positions: oldPositions, pointIds: oldPointIds});
    layer.state = {model: {setBindings} as unknown as Model, styleUniforms: {} as Buffer};

    layer.updateState({
      props: {...layer.props, positions, pointIds},
      oldProps: layer.props
    } as never);

    expect(setBindings).toHaveBeenCalledWith({positions, pointIds});
  });

  test('applies generic styling and delegates the indirect draw record', () => {
    const renderPass = {} as RenderPass;
    const drawCommands = {draw: vi.fn()} as unknown as DrawCommandBuffer;
    const model = {
      setInstanceCount: vi.fn(),
      draw: vi.fn(() => true)
    } as unknown as Model;
    const styleUniforms = {write: vi.fn()} as unknown as Buffer;
    const viewport = {zoom: 15};
    const radiusScale = vi.fn(() => 2);
    const layer = makeLayer({
      drawCommands,
      commandIndex: 3,
      color: [64, 128, 255, 192],
      radiusPixels: 2.5,
      radiusScale,
      highlightRadiusScale: 1.65,
      opacity: 0.75
    });
    layer.state = {model, styleUniforms};
    Object.defineProperty(layer, 'context', {value: {viewport}});

    layer.draw({renderPass, shaderModuleProps: {picking: {isActive: true}}});

    expect(styleUniforms.write).toHaveBeenCalledOnce();
    const style = vi.mocked(styleUniforms.write).mock.calls[0]![0] as Float32Array;
    expect(Array.from(style)).toHaveLength(8);
    expect(style[0]).toBeCloseTo(64 / 255);
    expect(style[1]).toBeCloseTo(128 / 255);
    expect(style[2]).toBe(1);
    expect(style[3]).toBeCloseTo(192 / 255);
    expect(Array.from(style.slice(4, 7))).toEqual([5, 0.75, 1]);
    expect(style[7]).toBeCloseTo(1.65);
    expect(radiusScale).toHaveBeenCalledWith(viewport);
    expect(model.setInstanceCount).toHaveBeenCalledWith(0);
    expect(model.draw).toHaveBeenCalledWith(renderPass);
    expect(drawCommands.draw).toHaveBeenCalledWith(renderPass, 3);
  });

  test('withholds staged and pipeline-blocked indirect draws', () => {
    const renderPass = {} as RenderPass;
    const drawCommands = {draw: vi.fn()} as unknown as DrawCommandBuffer;
    const model = {
      setInstanceCount: vi.fn(),
      draw: vi.fn(() => false)
    } as unknown as Model;
    const styleUniforms = {write: vi.fn()} as unknown as Buffer;
    const stagedLayer = makeLayer({staged: true, drawCommands});
    stagedLayer.state = {model, styleUniforms};
    stagedLayer.updateState({
      props: stagedLayer.props,
      oldProps: {...stagedLayer.props, staged: false}
    } as never);

    stagedLayer.draw({renderPass});
    expect(model.draw).not.toHaveBeenCalled();
    expect(drawCommands.draw).not.toHaveBeenCalled();

    stagedLayer.reveal();
    stagedLayer.draw({renderPass});
    expect(model.draw).toHaveBeenCalledOnce();
    expect(drawCommands.draw).not.toHaveBeenCalled();
  });
});

describe('@deck.gl-community/gpu-layers package boundary', () => {
  test('depends only on Deck and GPU-native luma rendering APIs', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8')
    ) as {sideEffects?: boolean; dependencies?: Record<string, string>};

    expect(packageJson.sideEffects).toBe(false);
    expect(
      Object.keys({...packageJson.dependencies, ...packageJson.peerDependencies}).sort()
    ).toEqual([
      '@deck.gl/core',
      '@luma.gl/core',
      '@luma.gl/engine',
      '@luma.gl/experimental',
      '@luma.gl/gpgpu',
      '@luma.gl/shadertools',
      '@luma.gl/text',
      '@math.gl/core',
      '@math.gl/sun'
    ]);
  });
});
