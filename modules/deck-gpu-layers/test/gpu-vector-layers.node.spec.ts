// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {PickingInfo} from '@deck.gl/core';
import {
  GPUArcLayer,
  GPUColumnLayer,
  GPUGridCellLayer,
  GPUIconLayer,
  GPULineLayer,
  GPUPointCloudLayer,
  GPUScatterplotLayer,
  type GPUVectorLayerPickingInfo
} from '@deck.gl-community/gpu-layers';
import type {Buffer, RenderPass, Texture} from '@luma.gl/core';
import {GPUData, GPUVector, type GPUVectorFormat} from '@luma.gl/gpgpu/gpu-data';
import {NullDevice} from '@luma.gl/test-utils';
import {describe, expect, test, vi} from 'vitest';
import {
  createGPUVectorStyleBuffer,
  getGPUVectorLayerBatches,
  getGPUVectorStyleBufferBinding,
  resizeGPUVectorStyleBuffer
} from '../src/layers/gpu-vector-layer-utils';

describe('GPUVector deck layers', () => {
  test('grows aligned style storage when more chunks are appended', () => {
    const device = new NullDevice({});
    device.limits.minUniformBufferOffsetAlignment = 256;
    const alignment = device.limits.minUniformBufferOffsetAlignment;
    const byteStride = Math.ceil(48 / alignment) * alignment;
    const initialBuffer = createGPUVectorStyleBuffer(device, 'batch-style', 48, 2);
    expect(initialBuffer.byteLength).toBe(byteStride * 2);
    expect(resizeGPUVectorStyleBuffer(initialBuffer, 48, 2)).toBe(initialBuffer);
    const resizedBuffer = resizeGPUVectorStyleBuffer(initialBuffer, 48, 3);
    expect(initialBuffer.destroyed).toBe(true);
    expect(resizedBuffer.byteLength).toBe(byteStride * 3);
    expect(getGPUVectorStyleBufferBinding(resizedBuffer, 48, 2)).toEqual({
      buffer: resizedBuffer,
      offset: byteStride * 2,
      size: 48
    });
    resizedBuffer.destroy();
    device.destroy();
  });
  test('preserve physical chunks and global picking provenance', () => {
    const positions = makeChunkedVector('positions', 'float32x2', [2, 3]);
    const radii = makeChunkedVector('radii', 'float32', [2, 3]);
    const layer = new GPUScatterplotLayer({
      id: 'gpu-scatterplot',
      getPosition: positions,
      getRadius: radii
    });

    const batches = getGPUVectorLayerBatches(
      layer.id,
      {positions, radii},
      {positions: ['float32x2'], radii: ['float32']}
    );
    expect(batches.map(batch => batch.rowCount)).toEqual([2, 3]);
    const secondInfo = layer.getPickingInfo({
      info: {index: 3} as PickingInfo
    } as never) as GPUVectorLayerPickingInfo;
    expect(secondInfo.index).toBe(3);
    expect(secondInfo.gpuVector).toEqual({rowIndex: 3, batchIndex: 1, batchRowIndex: 1});
  });

  test('rejects misaligned semantic vector chunks', () => {
    const sourcePositions = makeChunkedVector('source', 'float32x2', [2, 3]);
    const targetPositions = makeChunkedVector('target', 'float32x2', [1, 4]);
    expect(() =>
      getGPUVectorLayerBatches(
        'gpu-lines',
        {sourcePositions, targetPositions},
        {sourcePositions: ['float32x2'], targetPositions: ['float32x2']}
      )
    ).toThrow('chunk 0 row counts must align');
  });

  test('borrows GPUVector buffers without taking ownership', () => {
    const destroy = vi.fn();
    const positions = makeChunkedVector('positions', 'float32x2', [2], destroy);
    getGPUVectorLayerBatches('borrowed', {positions}, {positions: ['float32x2']});

    expect(destroy).not.toHaveBeenCalled();
  });

  test('uses one GPUVectorModel-backed layer across every fixed-width primitive batch', () => {
    const positions2 = makeChunkedVector('positions2', 'float32x2', [2, 3]);
    const positions3 = makeChunkedVector('positions3', 'float32x3', [2, 3]);
    const targets = makeChunkedVector('targets', 'float32x2', [2, 3]);
    const offsets = makeChunkedVector('offsets', 'float32x2', [2, 3]);
    const frames = makeChunkedVector('frames', 'float32x4', [2, 3]);
    const colorModes = makeChunkedVector('colorModes', 'float32', [2, 3]);
    const layers = [
      new GPUArcLayer({
        id: 'arcs',
        getSourcePosition: positions2,
        getTargetPosition: targets
      }),
      new GPUColumnLayer({id: 'columns', getPosition: positions2}),
      new GPUIconLayer({
        id: 'icons',
        iconAtlas: {} as Texture,
        getPosition: positions2,
        iconOffsets: offsets,
        iconFrames: frames,
        iconColorModes: colorModes
      }),
      new GPULineLayer({
        id: 'lines',
        getSourcePosition: positions2,
        getTargetPosition: targets
      }),
      new GPUPointCloudLayer({id: 'point-cloud', getPosition: positions3}),
      new GPUScatterplotLayer({id: 'scatterplot', getPosition: positions2})
    ];

    for (const layer of layers) {
      expect('renderLayers' in layer).toBe(false);
    }

    const gridCellLayer = new GPUGridCellLayer({id: 'cells', getPosition: positions2});
    const columnLayer = gridCellLayer.renderLayers();
    expect(columnLayer).toBeInstanceOf(GPUColumnLayer);
    expect('renderLayers' in columnLayer).toBe(false);
  });

  test('delegates physical chunks to one GPUVectorModel draw', () => {
    const positions = makeChunkedVector('positions', 'float32x2', [2, 3]);
    const radii = makeChunkedVector('radii', 'float32', [2, 3]);
    const layer = new GPUScatterplotLayer({
      id: 'gpu-scatterplot-model',
      getPosition: positions,
      getRadius: radii
    });
    const uniformBytes = new Uint8Array(512);
    const write = vi.fn((data: Uint8Array, byteOffset: number) => {
      uniformBytes.set(data, byteOffset);
    });
    const bindings: Array<{offset: number; size: number}> = [];
    const setBindings = vi.fn(({scatterStyle}) => bindings.push(scatterStyle));
    const drawBatches = vi.fn((_renderPass, options) => {
      options.onBatch?.({batchIndex: 0, rowIndexOffset: 0, rowCount: 2, data: {}});
      options.onBatch?.({batchIndex: 1, rowIndexOffset: 2, rowCount: 3, data: {}});
      return true;
    });
    layer.state = {
      model: {drawBatches, setBindings},
      styleBuffer: {
        write,
        byteLength: 512,
        device: {limits: {minUniformBufferOffsetAlignment: 256}}
      }
    } as never;

    layer.draw({renderPass: {} as RenderPass});

    expect(drawBatches).toHaveBeenCalledOnce();
    expect(drawBatches.mock.calls[0]![1].vectors).toEqual({positions, radii});
    expect(bindings.map(binding => binding.offset)).toEqual([0, 256]);
    expect(bindings.map(binding => binding.size)).toEqual([48, 48]);
    // Read after every queue write, as the GPU does when the encoded draws execute.
    expect(
      bindings.map(binding => new Uint32Array(uniformBytes.buffer, binding.offset, 12)[10])
    ).toEqual([0, 2]);
  });
});

function makeChunkedVector<FormatT extends GPUVectorFormat>(
  name: string,
  format: FormatT,
  chunkLengths: number[],
  destroy = vi.fn()
): GPUVector<FormatT> {
  const components = format.endsWith('x2')
    ? 2
    : format.endsWith('x3')
      ? 3
      : format.endsWith('x4')
        ? 4
        : 1;
  const bytesPerRow = components * Float32Array.BYTES_PER_ELEMENT;
  const data = chunkLengths.map(
    length =>
      new GPUData<FormatT>({
        buffer: {byteLength: length * bytesPerRow, destroy} as unknown as Buffer,
        format,
        length,
        byteStride: bytesPerRow,
        rowByteLength: bytesPerRow,
        ownsBuffer: false
      })
  );
  return new GPUVector({type: 'data', name, format, data, ownsData: false});
}
