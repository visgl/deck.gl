// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import type {
  RADSplats,
  RADWorkerRequest,
  RADWorkerResponse
} from '../splat-layer/rad-source-client';

const workerMocks = vi.hoisted(() => ({
  constructSource: vi.fn(),
  getMetadata: vi.fn(),
  getChunkSplats: vi.fn(),
  configureSelection: vi.fn(),
  destroySelection: vi.fn(),
  select: vi.fn(),
  stage: vi.fn(),
  admit: vi.fn(),
  discard: vi.fn(),
  remove: vi.fn()
}));

vi.mock('@loaders.gl/splats', () => ({
  RADSource: class {
    constructor(data: string | Blob, options: object) {
      workerMocks.constructSource(data, options);
    }
    getMetadata = workerMocks.getMetadata;
    getChunkSplats = workerMocks.getChunkSplats;
  }
}));

vi.mock('../splat-layer/rad-selection', () => ({
  RADSelectionEngine: class {
    constructor(options: object) {
      workerMocks.configureSelection(options);
    }
    destroy = workerMocks.destroySelection;
    select = workerMocks.select;
    stage = workerMocks.stage;
    admit = workerMocks.admit;
    discard = workerMocks.discard;
    remove = workerMocks.remove;
  }
}));

const postMessage = vi.fn();
const workerScope: {
  onmessage: ((event: MessageEvent<RADWorkerRequest>) => Promise<void>) | null;
  postMessage: typeof postMessage;
} = {onmessage: null, postMessage};

async function send(message: RADWorkerRequest): Promise<void> {
  await workerScope.onmessage?.(new MessageEvent('message', {data: message}));
}

function makeSplats(overrides: Partial<RADSplats> = {}): RADSplats {
  return {
    format: 'rad',
    splatCount: 1,
    positions: new Float32Array([0, 0, 0]),
    scales: new Float32Array([0.1, 0.1, 0.1]),
    rotations: new Float32Array([1, 0, 0, 0]),
    colors: new Uint8Array([255, 128, 0]),
    opacities: new Float32Array([1]),
    loaderData: {
      base: 0,
      childCounts: new Uint16Array([0]),
      childStarts: new Uint32Array([0])
    },
    ...overrides
  } as RADSplats;
}

describe('RAD source worker', () => {
  beforeAll(async () => {
    vi.stubGlobal('self', workerScope);
    await import('../splat-layer/rad-source-worker');
  });

  beforeEach(() => {
    postMessage.mockReset();
    for (const mock of Object.values(workerMocks)) mock.mockReset();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('routes initialization, selection, and residency lifecycle messages', async () => {
    const metadata = {count: 8, chunkSize: 4, lodTree: {}};
    workerMocks.getMetadata.mockResolvedValue(metadata);
    await send({type: 'initialize', id: 0, data: 'scene.rad'});
    expect(workerMocks.constructSource).toHaveBeenCalledWith('scene.rad', {});
    expect(postMessage).toHaveBeenLastCalledWith(
      {type: 'metadata', id: 0, metadata},
      {transfer: []}
    );

    const options = {pageSize: 4, maxActiveSplats: 16};
    await send({type: 'configure', id: 1, options});
    expect(workerMocks.configureSelection).toHaveBeenCalledWith(options);
    expect(postMessage).toHaveBeenLastCalledWith({type: 'ack', id: 1}, {transfer: []});

    const rows = new Uint32Array([1, 2]);
    const selection = {
      version: 1,
      viewVersion: 3,
      frontier: [{id: 'rad:0', activeRows: rows}],
      protectedPageIds: ['rad:0'],
      requests: [],
      hasPendingTraversal: false,
      duration: 1
    };
    workerMocks.select.mockReturnValue(selection);
    const view = {
      cameraPosition: [0, 0, 2] as [number, number, number],
      viewportSize: [1000, 1000] as [number, number]
    };
    await send({type: 'select', id: 2, view, viewVersion: 3});
    expect(workerMocks.select).toHaveBeenCalledWith(view, 3);
    expect(postMessage).toHaveBeenLastCalledWith(
      {type: 'selection', id: 2, selection},
      {transfer: [rows.buffer]}
    );

    await send({type: 'admit', id: 3, requestId: 20});
    await send({type: 'discard', id: 4, requestId: 21});
    await send({type: 'remove', id: 5, pageId: 'rad:2'});
    expect(workerMocks.admit).toHaveBeenCalledWith(20);
    expect(workerMocks.discard).toHaveBeenCalledWith(21);
    expect(workerMocks.remove).toHaveBeenCalledWith('rad:2');
    expect(postMessage.mock.calls.slice(-3).map(call => call[0])).toEqual([
      {type: 'ack', id: 3},
      {type: 'ack', id: 4},
      {type: 'ack', id: 5}
    ]);
  });

  it('stages decoded pages with floating-point colors and unique transferable buffers', async () => {
    workerMocks.getMetadata.mockResolvedValue({count: 1});
    await send({type: 'initialize', id: 0, data: 'scene.rad'});
    await send({type: 'configure', id: 1, options: {pageSize: 1, maxActiveSplats: 1}});
    postMessage.mockClear();

    const sharedGeometry = new Float32Array([0, 0, 0, 0.1, 0.1, 0.1]);
    const splats = makeSplats({
      positions: sharedGeometry.subarray(0, 3),
      scales: sharedGeometry.subarray(3, 6)
    });
    workerMocks.getChunkSplats.mockResolvedValue(splats);
    await send({type: 'page', id: 2, pageIndex: 7});

    expect(workerMocks.getChunkSplats).toHaveBeenCalledWith(7, {
      signal: expect.any(AbortSignal),
      radChunk: {includeLoDTree: true, includeSphericalHarmonics: true}
    });
    expect(workerMocks.stage).toHaveBeenCalledWith(2, 7, splats);
    const [response, options] = postMessage.mock.calls.at(-1) as [
      Extract<RADWorkerResponse, {type: 'page'}>,
      {transfer: ArrayBuffer[]}
    ];
    expect(response.page.colors).toEqual(new Float32Array([1, 128 / 255, 0, 1]));
    expect(options.transfer.filter(buffer => buffer === sharedGeometry.buffer)).toHaveLength(1);
    expect(new Set(options.transfer).size).toBe(options.transfer.length);

    const harmonicSplats = makeSplats({
      sphericalHarmonicDcs: new Float32Array([1, 0, -1])
    });
    workerMocks.getChunkSplats.mockResolvedValue(harmonicSplats);
    await send({type: 'page', id: 3, pageIndex: 8});
    const harmonicResponse = postMessage.mock.calls.at(-1)?.[0] as Extract<
      RADWorkerResponse,
      {type: 'page'}
    >;
    expect(harmonicResponse.page.colors[0]).toBeCloseTo(0.5 + 0.28209479177387814);
    expect(harmonicResponse.page.colors[1]).toBe(0.5);
    expect(harmonicResponse.page.colors[2]).toBeCloseTo(0.5 - 0.28209479177387814);
    expect(harmonicResponse.page.colors[3]).toBe(1);
  });

  it('aborts in-flight decoding, discards staging, and serializes the abort error', async () => {
    workerMocks.getMetadata.mockResolvedValue({count: 1});
    await send({type: 'initialize', id: 0, data: 'scene.rad'});
    await send({type: 'configure', id: 1, options: {pageSize: 1, maxActiveSplats: 1}});
    postMessage.mockClear();

    let resolvePage: (splats: RADSplats) => void = () => {};
    let signal: AbortSignal | undefined;
    workerMocks.getChunkSplats.mockImplementation(
      (_pageIndex: number, options: {signal: AbortSignal}) =>
        new Promise<RADSplats>(resolve => {
          signal = options.signal;
          resolvePage = resolve;
        })
    );
    const pending = send({type: 'page', id: 9, pageIndex: 4});
    await Promise.resolve();
    await send({type: 'cancel', id: 9});
    expect(signal?.aborted).toBe(true);
    expect(workerMocks.discard).toHaveBeenCalledWith(9);
    resolvePage(makeSplats());
    await pending;

    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({type: 'error', id: 9, name: 'AbortError'}),
      {transfer: []}
    );
    expect(workerMocks.stage).not.toHaveBeenCalled();
  });
});
