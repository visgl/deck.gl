// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Effect, EffectContext} from '@deck.gl/core';
import {LuSpatialGeographicPointQueryEffect} from '@deck.gl-community/gpu-layers/query';
import type {Device} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {expect, test} from 'vitest';

test('LuSpatialGeographicPointQueryEffect validates props before browser GPU allocation', () => {
  const props = {
    longitudeLatitudes: new Float32Array([-73.97, 40.75]),
    sourceBounds: [-74, 40.72, -73.94, 40.78] as const,
    projectedBounds: [-1, -1, 1, 1] as const,
    projectionOrigin: [-73.97, 40.75] as const
  };
  expect(
    () =>
      new LuSpatialGeographicPointQueryEffect({type: 'webgpu'} as Device, {
        ...props,
        viewportProjectionPaddingKilometres: -1
      })
  ).toThrow('viewportProjectionPaddingKilometres must be a non-negative finite number');

  const allocationSentinel = 'browser validation reached buffer allocation';
  const device = {
    type: 'webgpu',
    createBuffer: () => {
      throw new Error(allocationSentinel);
    }
  } as unknown as Device;
  expect(() => new LuSpatialGeographicPointQueryEffect(device, props)).toThrow(allocationSentinel);
});

test('LuSpatialGeographicPointQueryEffect supports a browser WebGPU lifecycle on hardware', async () => {
  const device = await getWebGPUTestDevice();
  // Constructing this graph compiles its integer-fp64 pipelines and leaves SwiftShader busy for
  // minutes during browser teardown. Real hardware still covers the lifecycle and submitted results.
  if (!device || isSoftwareBackedDevice(device)) return;
  const publishedStats: unknown[] = [];
  const effect = new LuSpatialGeographicPointQueryEffect(device, {
    id: 'luspatial-geographic-query-hardware-lifecycle-test',
    longitudeLatitudes: new Float32Array([-73.97, 40.75, -73.99, 40.74]),
    sourceBounds: [-74, 40.72, -73.94, 40.78],
    projectionOrigin: [-73.97, 40.75],
    projectedBounds: [-3, -3, 3, 3],
    gridSize: [2, 2],
    initialSelection: {center: [-73.97, 40.75], radiusKilometres: 2},
    selectionRadiusRangeKilometres: [0.1, 1],
    viewportId: 'map',
    viewportProjectionPaddingKilometres: 0,
    enableDiagnostics: false,
    maxInspectorSamples: 4,
    onStats: stats => publishedStats.push(stats)
  });
  const redrawReasons: string[] = [];
  const effectContext = {
    device,
    deck: {redraw: (reason: string) => redrawReasons.push(reason)}
  } as unknown as EffectContext;

  try {
    expect(publishedStats).toHaveLength(1);
    expect(effect.getSelection()).toEqual({
      center: [-73.97, 40.75],
      radiusKilometres: 1
    });
    expect(() =>
      effect.setup({...effectContext, device: {...device}} as unknown as EffectContext)
    ).toThrow(/must be adopted by the device used during construction/);
    effect.setup(effectContext);

    expect(() => effect.setSelection([181, 0])).toThrow(/must be valid longitude\/latitude/);
    expect(() => effect.setSelection([-73.98, 40.75], Number.POSITIVE_INFINITY)).toThrow(
      /selection radius must be finite/
    );
    effect.setSelection([-73.98, 40.75], 0.5);
    expect(effect.getSelection()).toEqual({center: [-73.98, 40.75], radiusKilometres: 0.5});
    expect(() => effect.setSelectionRadius(Number.NaN)).toThrow(/selection radius must be finite/);
    effect.setSelectionRadius(0.01);
    expect(effect.getSelection().radiusKilometres).toBe(0.1);
    expect(redrawReasons).toEqual([
      'luspatial-geographic-query-hardware-lifecycle-test selection changed',
      'luspatial-geographic-query-hardware-lifecycle-test selection radius changed'
    ]);

    const defaultCommandEncoder = device.commandEncoder;
    const lifecycleCommandEncoder = device.createCommandEncoder({
      id: 'luspatial-geographic-query-hardware-lifecycle-test'
    });
    device.commandEncoder = lifecycleCommandEncoder;
    try {
      const preRenderOptions = {
        viewports: [
          {
            id: 'map',
            width: 100,
            height: 100,
            unproject: ([x, y]: number[]) => [-74 + (x / 100) * 0.06, 40.77 - (y / 100) * 0.04]
          }
        ]
      } as unknown as Parameters<NonNullable<Effect['preRender']>>[0];
      effect.preRender(preRenderOptions);
      effect.preRender(preRenderOptions);
      effect.preRender({
        viewports: [{id: 'other', width: 100, height: 100}]
      } as unknown as Parameters<NonNullable<Effect['preRender']>>[0]);
    } finally {
      device.commandEncoder = defaultCommandEncoder;
      const discardedCommandBuffer = lifecycleCommandEncoder.finish();
      discardedCommandBuffer.destroy();
    }
    expect(publishedStats).toHaveLength(2);
  } finally {
    effect.cleanup(effectContext);
    effect.destroy();
  }

  effect.preRender({viewports: []} as unknown as Parameters<NonNullable<Effect['preRender']>>[0]);
});

test('LuSpatialGeographicPointQueryEffect builds and updates real hardware WebGPU queries', async () => {
  const device = await getWebGPUTestDevice();
  // The precise radius kernel uses integer fp64 emulation and is intentionally not exercised on
  // SwiftShader. Its focused geospatial tests apply the same exclusion; hardware coverage below
  // still verifies the complete projection, index, mutable query, and indirect-draw path.
  if (!device || isSoftwareBackedDevice(device)) return;

  const effect = new LuSpatialGeographicPointQueryEffect(device, {
    id: 'luspatial-geographic-query-browser-test',
    longitudeLatitudes: new Float32Array([
      -73.97, 40.75, -73.971, 40.75, -73.99, 40.75, -74.2, 40.75
    ]),
    sourceBounds: [-74.21, 40.74, -73.73, 40.76],
    projectionOrigin: [-73.97, 40.75],
    projectedBounds: [-3, -3, 3, 3],
    gridSize: [4, 4],
    initialSelection: {center: [-73.97, 40.75], radiusKilometres: 0.2},
    selectionRadiusRangeKilometres: [0.05, 1]
  });
  const redrawReasons: string[] = [];
  expect(() =>
    effect.setup({
      device: {...device},
      deck: {redraw: () => undefined}
    } as unknown as EffectContext)
  ).toThrow(/must be adopted by the device used during construction/);
  const effectContext = {
    device,
    deck: {redraw: (reason: string) => redrawReasons.push(reason)}
  } as unknown as EffectContext;
  effect.setup(effectContext);

  try {
    effect.preRender({
      viewports: [
        {
          id: 'map',
          width: 100,
          height: 100,
          unproject: ([x, y]: number[]) => [-74 + (x / 100) * 0.06, 40.77 - (y / 100) * 0.04]
        }
      ]
    } as unknown as Parameters<NonNullable<Effect['preRender']>>[0]);
    device.submit();

    const drawCommandBytes = await effect.drawCommands.buffer.readAsync();
    const drawCommandView = new DataView(
      drawCommandBytes.buffer,
      drawCommandBytes.byteOffset,
      drawCommandBytes.byteLength
    );
    const viewportCount = drawCommandView.getUint32(
      effect.drawCommands.getInstanceCountByteOffset(effect.outputs.viewport.commandIndex),
      true
    );
    const selectionCount = drawCommandView.getUint32(
      effect.drawCommands.getInstanceCountByteOffset(effect.outputs.selection.commandIndex),
      true
    );
    expect(viewportCount, 'viewport output contains the three indexed visible rows').toBe(3);
    expect(selectionCount, 'selection output applies the local radius').toBe(2);

    effect.setSelection([-73.99, 40.75], 0.1);
    expect(redrawReasons.at(-1), 'selection mutation asks Deck to schedule another frame').toMatch(
      /selection changed/
    );
    expect(effect.getSelection(), 'selection mutators expose the current geographic query').toEqual(
      {center: [-73.99, 40.75], radiusKilometres: 0.1}
    );
    effect.preRender({
      viewports: [
        {
          id: 'map',
          width: 100,
          height: 100,
          unproject: ([x, y]: number[]) => [-74 + (x / 100) * 0.06, 40.77 - (y / 100) * 0.04]
        }
      ]
    } as unknown as Parameters<NonNullable<Effect['preRender']>>[0]);
    device.submit();
    const updatedDrawCommandBytes = await effect.drawCommands.buffer.readAsync();
    const updatedDrawCommandView = new DataView(
      updatedDrawCommandBytes.buffer,
      updatedDrawCommandBytes.byteOffset,
      updatedDrawCommandBytes.byteLength
    );
    const updatedSelectionCount = updatedDrawCommandView.getUint32(
      effect.drawCommands.getInstanceCountByteOffset(effect.outputs.selection.commandIndex),
      true
    );
    const updatedSelectionIdBytes = await effect.outputs.selection.pointIds.readAsync(
      0,
      updatedSelectionCount * 4
    );
    const updatedSelectionIds = new Uint32Array(
      updatedSelectionIdBytes.buffer,
      updatedSelectionIdBytes.byteOffset,
      updatedSelectionIdBytes.byteLength / Uint32Array.BYTES_PER_ELEMENT
    );
    expect(updatedSelectionCount, 'the mutable selection reruns without rebuilding').toBe(1);
    expect(Array.from(updatedSelectionIds), 'the second selection targets row 2').toEqual([2]);

    effect.preRender({viewports: []} as unknown as Parameters<NonNullable<Effect['preRender']>>[0]);
    const clearedDrawCommandBytes = await effect.drawCommands.buffer.readAsync();
    const clearedDrawCommandView = new DataView(
      clearedDrawCommandBytes.buffer,
      clearedDrawCommandBytes.byteOffset,
      clearedDrawCommandBytes.byteLength
    );
    expect(
      clearedDrawCommandView.getUint32(
        effect.drawCommands.getInstanceCountByteOffset(effect.outputs.viewport.commandIndex),
        true
      ),
      'a missing viewport clears the stale viewport draw count'
    ).toBe(0);
    expect(
      clearedDrawCommandView.getUint32(
        effect.drawCommands.getInstanceCountByteOffset(effect.outputs.selection.commandIndex),
        true
      ),
      'a missing viewport clears the stale selection draw count'
    ).toBe(0);
  } finally {
    effect.cleanup(effectContext);
    effect.destroy();
  }
}, 60_000);

function isSoftwareBackedDevice(device: Device): boolean {
  return (
    device.info.gpu === 'software' || device.info.gpuType === 'cpu' || Boolean(device.info.fallback)
  );
}
