// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {LayerContext} from '@deck.gl/core';
import {ArrowPolygonRenderer} from '@luma.gl/engine/arrow';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {StoragePolygonLayer} from '@deck.gl/proposals/layers/polygon-layer';
import {expect, test, vi} from 'vitest';

type Mesh = Awaited<ReturnType<typeof ArrowPolygonRenderer.convertToGPUVectors>>;

function pendingMesh() {
  let finish!: (mesh: Mesh) => void;
  const result = new Promise<Mesh>(resolve => {
    finish = resolve;
  });
  const destroy = vi.fn();
  const mesh = {
    destroy() {
      expect(this).toBe(mesh);
      destroy();
    }
  };
  return {result, destroy, finish: () => finish(mesh as unknown as Mesh)};
}

test('polygon preparation releases stale, replaced, and finalized meshes', async () => {
  const first = pendingMesh();
  const stale = pendingMesh();
  const replacement = pendingMesh();
  const finalized = pendingMesh();
  const convert = vi.spyOn(ArrowPolygonRenderer, 'convertToGPUVectors');
  for (const mesh of [first, stale, replacement, finalized]) {
    convert.mockReturnValueOnce(mesh.result);
  }
  const layer = new StoragePolygonLayer({polygons: {} as never});
  layer.context = {resourceManager: {unsubscribe: vi.fn()}} as unknown as LayerContext;
  layer.initializeState();
  const update = (polygons: object) => {
    layer.updateState({
      props: {...layer.props, polygons},
      oldProps: layer.props
    } as never);
  };

  try {
    update({});
    first.finish();
    await first.result;
    const visibleMesh = layer.state.mesh;
    expect(visibleMesh).toBeDefined();

    update({});
    update({});
    expect(layer.state.mesh).toBe(visibleMesh);
    stale.finish();
    await stale.result;
    expect(stale.destroy).toHaveBeenCalledOnce();
    expect(layer.state.mesh).toBe(visibleMesh);
    expect(first.destroy).not.toHaveBeenCalled();

    replacement.finish();
    await replacement.result;
    expect(first.destroy).toHaveBeenCalledOnce();
    expect(layer.state.mesh).not.toBe(visibleMesh);

    update({});
    layer.finalizeState({} as LayerContext);
    finalized.finish();
    await finalized.result;
    expect(replacement.destroy).toHaveBeenCalledOnce();
    expect(finalized.destroy).toHaveBeenCalledOnce();
    expect(layer.state.mesh).toBeUndefined();
  } finally {
    convert.mockRestore();
  }
});

test('GPU ring input requires readback permission', () => {
  const polygons = Object.create(GPUVector.prototype) as GPUVector;
  const layer = new StoragePolygonLayer({polygons});
  layer.initializeState();
  const raiseError = vi.spyOn(layer, 'raiseError').mockImplementation(() => {});
  vi.spyOn(layer, 'getCurrentLayer').mockReturnValue(layer);
  layer.updateState({props: layer.props, oldProps: {}} as never);
  expect(raiseError).toHaveBeenCalledWith(
    expect.objectContaining({message: expect.stringContaining('allowPolygonReadback')}),
    'preparing polygon mesh'
  );
  expect(layer.state.request).toBeUndefined();
});
