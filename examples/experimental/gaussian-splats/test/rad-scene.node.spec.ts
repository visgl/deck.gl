// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it, vi} from 'vitest';
import {NullDevice} from '@luma.gl/test-utils';
import {makeGPUSplatData} from '@luma.gl/splats';
import {RADScene} from '../splat-layer/rad-scene';
import type {RADSelection} from '../splat-layer/rad-selection';

vi.mock('../splat-layer/rad-source-client', () => ({
  RADSourceClient: class {
    getMetadata = () => new Promise(() => {});
    configure = vi.fn(async () => {});
    select = vi.fn(() => new Promise<RADSelection>(() => {}));
    remove = vi.fn(async () => {});
    getPage = vi.fn();
    admit = vi.fn(async () => {});
    discard = vi.fn(async () => {});
    destroy = vi.fn();
  }
}));

const view = {
  cameraPosition: [0, 0, 2] as [number, number, number],
  viewportSize: [1000, 1000] as [number, number],
  modelViewProjectionMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
};

function makeScene() {
  const device = new NullDevice({});
  Object.defineProperty(device, 'type', {value: 'webgpu'});
  const onChange = vi.fn();
  const onStatus = vi.fn();
  const onError = vi.fn();
  const scene = new RADScene(device, {
    data: 'scene.rad',
    maxActiveSplats: 2_000_000,
    maxResidentSplats: 8_000_000,
    maxConcurrentLoads: 8,
    onChange,
    onStatus,
    onError
  });
  scene['rootReady'] = true;
  const select = vi.spyOn(scene['source'], 'select');
  const schedule = vi.spyOn(scene.scheduler, 'update').mockImplementation(() => {});
  return {device, scene, select, schedule, onChange, onStatus, onError};
}

function makeSelection(version: number, viewVersion: number): RADSelection {
  return {
    version,
    viewVersion,
    protectedPageIds: [],
    requests: [],
    hasPendingTraversal: false,
    duration: 1
  };
}

describe('SplatLayer off-thread refinement', () => {
  it('configures selection from metadata and admits the root before becoming ready', async () => {
    const {device, scene, onChange} = makeScene();
    scene['rootReady'] = false;
    const source = scene['source'];
    const metadata = {count: 40_000_000, chunkSize: 262_144, lodTree: {}};
    vi.spyOn(source, 'getMetadata').mockResolvedValue(metadata as never);
    const configure = vi.spyOn(source, 'configure').mockResolvedValue();
    const loadPage = vi
      .spyOn(
        scene as unknown as {
          loadPage: (pageIndex: number, priority: number, signal: AbortSignal) => Promise<boolean>;
        },
        'loadPage'
      )
      .mockResolvedValue(true);
    onChange.mockClear();

    await scene['initialize']();

    expect(configure).toHaveBeenCalledWith({
      pageSize: 262_144,
      maxActiveSplats: 2_000_000,
      maxResidentSplats: 8_000_000,
      maxConcurrentLoads: 8
    });
    expect(loadPage).toHaveBeenCalledWith(0, Number.MAX_SAFE_INTEGER, expect.any(AbortSignal));
    expect(scene['rootReady']).toBe(true);
    expect(scene['sourceSplats']).toBe(40_000_000);
    expect(onChange).toHaveBeenCalledTimes(1);
    scene.destroy();
    device.destroy();
  });

  it('rejects sources without hierarchy metadata before requesting the root page', async () => {
    const {device, scene} = makeScene();
    scene['rootReady'] = false;
    const source = scene['source'];
    vi.spyOn(source, 'getMetadata').mockResolvedValue({count: 1} as never);
    const configure = vi.spyOn(source, 'configure');
    const loadPage = vi.spyOn(
      scene as unknown as {
        loadPage: (pageIndex: number, priority: number, signal: AbortSignal) => Promise<boolean>;
      },
      'loadPage'
    );

    await expect(scene['initialize']()).rejects.toThrow(
      'SplatLayer requires a RAD hierarchy with a declared chunkSize.'
    );
    expect(configure).not.toHaveBeenCalled();
    expect(loadPage).not.toHaveBeenCalled();
    scene.destroy();
    device.destroy();
  });

  it('rejects a root page that cannot fit the configured resident budget', async () => {
    const {device, scene} = makeScene();
    scene['rootReady'] = false;
    const source = scene['source'];
    vi.spyOn(source, 'getMetadata').mockResolvedValue({
      count: 4,
      chunkSize: 4,
      lodTree: {}
    } as never);
    vi.spyOn(source, 'configure').mockResolvedValue();
    vi.spyOn(
      scene as unknown as {
        loadPage: (pageIndex: number, priority: number, signal: AbortSignal) => Promise<boolean>;
      },
      'loadPage'
    ).mockResolvedValue(false);

    await expect(scene['initialize']()).rejects.toThrow(
      'The RAD root page exceeds maxResidentSplats.'
    );
    expect(scene['rootReady']).toBe(false);
    scene.destroy();
    device.destroy();
  });

  it('admits queued GPU uploads between traversal leases without evicting the visible root', async () => {
    const {device, scene, select} = makeScene();
    const source = {
      positions: new Float32Array([0, 0, 0]),
      scales: new Float32Array([0.1, 0.1, 0.1]),
      rotations: new Float32Array([1, 0, 0, 0]),
      colors: new Uint8Array([255, 255, 255, 255]),
      opacities: new Float32Array([1])
    };
    const root = makeGPUSplatData(device, source);
    const unused = makeGPUSplatData(device, {...source, rowIndexBase: 1});
    scene.residency.setBudget({maxResidentSplats: 2});
    scene.residency.add(root, {id: 'rad:0'});
    scene.residency.add(unused, {id: 'rad:1'});
    let complete: (selection: RADSelection) => void = () => {};
    select.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          complete = resolve;
        })
    );
    scene.update(view, 1, 0);
    vi.spyOn(scene['source'], 'getPage').mockResolvedValue({
      requestId: 12,
      colors: new Float32Array([1, 1, 1, 1]),
      splats: {...source, format: 'rad', splatCount: 1, loaderData: {base: 2}}
    });
    const loaded = scene['loadPage'](2, 10, new AbortController().signal);
    await Promise.resolve();
    scene.update(view, 1, 16);
    expect(scene.residency.has('rad:2')).toBe(false);
    expect(unused.destroyed).toBe(false);
    complete(makeSelection(1, 1));
    await Promise.resolve();
    scene.update(view, 1, 32);
    expect(await loaded).toBe(true);
    expect(unused.destroyed).toBe(true);
    expect(root.destroyed).toBe(false);
    expect(scene.residency.getChunk('rad:2')?.pinned).toBe(true);
    scene.destroy();
    device.destroy();
  });

  it('coalesces motion to one worker request while updating the camera immediately', async () => {
    const {device, scene, select} = makeScene();
    let complete: (selection: RADSelection) => void = () => {};
    select.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          complete = resolve;
        })
    );
    scene.update(view, 1, 0);
    const cameraUpdates = vi.spyOn(scene.renderer, 'setProps');
    const latest = {...view, modelViewProjectionMatrix: [...view.modelViewProjectionMatrix]};
    for (let index = 1; index <= 30; index++) {
      latest.modelViewProjectionMatrix = [...view.modelViewProjectionMatrix];
      latest.modelViewProjectionMatrix[12] = index / 100;
      scene.update({...latest}, 1, index * 16);
    }
    expect(select).toHaveBeenCalledTimes(1);
    expect(cameraUpdates).toHaveBeenCalledWith(latest);
    complete(makeSelection(1, 1));
    await Promise.resolve();
    scene.update(latest, 1, 500);
    expect(select).toHaveBeenCalledTimes(2);
    expect(select).toHaveBeenLastCalledWith(latest, 31);
    scene.destroy();
    device.destroy();
  });

  it('atomically promotes coherent replies during motion and protects borrowed GPU pages', async () => {
    const {device, scene, select} = makeScene();
    const data = makeGPUSplatData(device, {
      positions: new Float32Array([0, 0, 0]),
      scales: new Float32Array([0.1, 0.1, 0.1]),
      rotations: new Float32Array([1, 0, 0, 0]),
      colors: new Uint8Array([255, 255, 255, 255]),
      opacities: new Float32Array([1])
    });
    scene.residency.add(data, {id: 'rad:0'});
    let complete: (selection: RADSelection) => void = () => {};
    select.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          complete = resolve;
        })
    );
    const frontier = vi.spyOn(scene.renderer, 'setFrontier');
    scene.update(view, 1, 0);
    expect(scene.residency.getChunk('rad:0')?.pinned).toBe(true);
    const moved = {...view, viewportSize: [900, 900] as [number, number]};
    scene.update(moved, 1, 16);
    expect(frontier).not.toHaveBeenCalled();
    complete({...makeSelection(1, 1), frontier: [{id: 'rad:0', activeRows: new Uint32Array([0])}]});
    await Promise.resolve();
    scene.update(moved, 1, 32);
    expect(frontier).toHaveBeenCalledTimes(1);
    expect(scene.renderer.pages[0].data).toBe(data);
    expect(scene.residency.getChunk('rad:0')?.pinned).toBe(true);
    expect(select).toHaveBeenLastCalledWith(moved, 2);
    scene.destroy();
    expect(data.destroyed).toBe(true);
    device.destroy();
  });

  it('ignores worker completion after destruction', async () => {
    const {device, scene, select, onChange} = makeScene();
    let complete: (selection: RADSelection) => void = () => {};
    select.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          complete = resolve;
        })
    );
    scene.update(view, 1, 0);
    scene.destroy();
    onChange.mockClear();
    complete(makeSelection(1, 1));
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
    expect(scene['pendingSelection']).toBeUndefined();
    device.destroy();
  });

  it('discards decoded geometry when residency rejects a page', async () => {
    const {device, scene} = makeScene();
    scene['rootReady'] = false;
    const source = {
      positions: new Float32Array([0, 0, 0]),
      scales: new Float32Array([0.1, 0.1, 0.1]),
      rotations: new Float32Array([1, 0, 0, 0]),
      colors: new Uint8Array([255, 255, 255, 255]),
      opacities: new Float32Array([1])
    };
    vi.spyOn(scene['source'], 'getPage').mockResolvedValue({
      requestId: 20,
      colors: new Float32Array([1, 1, 1, 1]),
      splats: {...source, format: 'rad', splatCount: 1, loaderData: {base: 2}}
    });
    vi.spyOn(scene.residency, 'load').mockResolvedValue(undefined as never);
    const discard = vi.spyOn(scene['source'], 'discard').mockResolvedValue();

    await expect(scene['loadPage'](2, 10, new AbortController().signal)).resolves.toBe(false);
    expect(discard).toHaveBeenCalledWith(20);
    expect(scene.residency.has('rad:2')).toBe(false);
    scene.destroy();
    device.destroy();
  });

  it('discards a decoded page if its view request is cancelled before GPU upload', async () => {
    const {device, scene} = makeScene();
    const source = {
      positions: new Float32Array([0, 0, 0]),
      scales: new Float32Array([0.1, 0.1, 0.1]),
      rotations: new Float32Array([1, 0, 0, 0]),
      colors: new Uint8Array([255, 255, 255, 255]),
      opacities: new Float32Array([1])
    };
    vi.spyOn(scene['source'], 'getPage').mockResolvedValue({
      requestId: 22,
      colors: new Float32Array([1, 1, 1, 1]),
      splats: {...source, format: 'rad', splatCount: 1, loaderData: {base: 2}}
    });
    const discard = vi.spyOn(scene['source'], 'discard').mockResolvedValue();
    const controller = new AbortController();
    const loaded = scene['loadPage'](2, 10, controller.signal);
    await Promise.resolve();
    controller.abort();
    scene.update(view, 1, 0);

    await expect(loaded).resolves.toBe(false);
    expect(discard).toHaveBeenCalledWith(22);
    expect(scene.residency.has('rad:2')).toBe(false);
    scene.destroy();
    device.destroy();
  });

  it('removes an uploaded page and discards worker geometry if admission fails', async () => {
    const {device, scene} = makeScene();
    scene['rootReady'] = false;
    const source = {
      positions: new Float32Array([0, 0, 0]),
      scales: new Float32Array([0.1, 0.1, 0.1]),
      rotations: new Float32Array([1, 0, 0, 0]),
      colors: new Uint8Array([255, 255, 255, 255]),
      opacities: new Float32Array([1])
    };
    vi.spyOn(scene['source'], 'getPage').mockResolvedValue({
      requestId: 21,
      colors: new Float32Array([1, 1, 1, 1]),
      splats: {...source, format: 'rad', splatCount: 1, loaderData: {base: 2}}
    });
    const error = new Error('worker admission failed');
    vi.spyOn(scene['source'], 'admit').mockRejectedValue(error);
    const discard = vi.spyOn(scene['source'], 'discard').mockResolvedValue();

    await expect(scene['loadPage'](2, 10, new AbortController().signal)).rejects.toBe(error);
    expect(discard).toHaveBeenCalledWith(21);
    expect(scene.residency.has('rad:2')).toBe(false);
    scene.destroy();
    device.destroy();
  });

  it('reports ready, budget-limited, refining, and error states without duplicate status events', () => {
    const {device, scene, onStatus, onError} = makeScene();
    scene['currentView'] = view;
    scene['selectionNeeded'] = false;
    onStatus.mockClear();

    scene.update(view, 1, 0);
    scene.update(view, 1, 1);
    expect(onStatus).toHaveBeenCalledTimes(1);
    expect(onStatus).toHaveBeenLastCalledWith(expect.objectContaining({phase: 'ready'}));

    scene['requests'] = [{pageIndex: 4, priority: 1}];
    scene.scheduler.rejected.add(4);
    scene.update(view, 1, 2);
    expect(onStatus).toHaveBeenLastCalledWith(expect.objectContaining({phase: 'budget-limited'}));

    scene['selecting'] = true;
    scene.update(view, 1, 3);
    expect(onStatus).toHaveBeenLastCalledWith(expect.objectContaining({phase: 'refining'}));

    const error = new Error('decoder unavailable');
    scene['fail'](error);
    expect(onStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({phase: 'error', message: 'decoder unavailable'})
    );
    expect(onError).toHaveBeenCalledWith(error);
    scene.destroy();
    device.destroy();
  });
});
