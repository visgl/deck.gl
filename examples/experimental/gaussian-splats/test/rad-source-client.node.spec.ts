// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it, vi} from 'vitest';
import {
  RADSourceClient,
  type RADWorker,
  type RADWorkerResponse
} from '../splat-layer/rad-source-client';

function makeWorker() {
  const worker: RADWorker = {
    onmessage: null,
    onerror: null,
    postMessage: vi.fn(),
    terminate: vi.fn()
  };
  const respond = (response: RADWorkerResponse) =>
    worker.onmessage?.(new MessageEvent('message', {data: response}));
  const client = new RADSourceClient('https://example.com/scene.rad', worker);
  return {worker, client, respond};
}

describe('SplatLayer off-thread source', () => {
  it('round-trips metadata, pages, selection, and lifecycle acknowledgements', async () => {
    const {worker, client, respond} = makeWorker();
    const metadata = {count: 12, chunkSize: 4, lodTree: {}};
    const metadataPromise = client.getMetadata();
    respond({type: 'metadata', id: 0, metadata} as RADWorkerResponse);
    await expect(metadataPromise).resolves.toBe(metadata);

    const page = {
      requestId: 1,
      splats: {format: 'rad', splatCount: 0},
      colors: new Float32Array()
    };
    const pagePromise = client.getPage(3, new AbortController().signal);
    expect(worker.postMessage).toHaveBeenLastCalledWith({type: 'page', id: 1, pageIndex: 3});
    respond({type: 'page', id: 1, page} as RADWorkerResponse);
    await expect(pagePromise).resolves.toBe(page);

    const options = {pageSize: 4, maxActiveSplats: 16};
    const configured = client.configure(options);
    expect(worker.postMessage).toHaveBeenLastCalledWith({type: 'configure', id: 2, options});
    respond({type: 'ack', id: 2});
    await configured;

    const view = {
      cameraPosition: [0, 0, 2] as [number, number, number],
      viewportSize: [1000, 1000] as [number, number]
    };
    const selection = {
      version: 1,
      viewVersion: 7,
      protectedPageIds: ['rad:0'],
      requests: [],
      hasPendingTraversal: false,
      duration: 1
    };
    const selected = client.select(view, 7);
    expect(worker.postMessage).toHaveBeenLastCalledWith({
      type: 'select',
      id: 3,
      view,
      viewVersion: 7
    });
    respond({type: 'selection', id: 3, selection});
    await expect(selected).resolves.toBe(selection);

    for (const [id, operation] of [
      [4, client.admit(1)],
      [5, client.discard(2)],
      [6, client.remove('rad:2')]
    ] as const) {
      respond({type: 'ack', id});
      await operation;
    }
    expect(worker.postMessage).toHaveBeenNthCalledWith(5, {type: 'admit', id: 4, requestId: 1});
    expect(worker.postMessage).toHaveBeenNthCalledWith(6, {type: 'discard', id: 5, requestId: 2});
    expect(worker.postMessage).toHaveBeenNthCalledWith(7, {type: 'remove', id: 6, pageId: 'rad:2'});
    client.destroy();
  });

  it('dispatches decoding to the worker and does not resolve before its response', async () => {
    const {worker, client, respond} = makeWorker();
    const metadata = client.getMetadata();
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'initialize',
      id: 0,
      data: 'https://example.com/scene.rad'
    });
    respond({type: 'error', id: 0, name: 'Error', message: 'metadata unavailable'});
    await expect(metadata).rejects.toThrow('metadata unavailable');
    const page = client.getPage(3, new AbortController().signal);
    const settled = vi.fn();
    void page.catch(settled);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    expect(worker.postMessage).toHaveBeenLastCalledWith({type: 'page', id: 1, pageIndex: 3});
    respond({type: 'error', id: 1, name: 'Error', message: 'page unavailable'});
    await expect(page).rejects.toThrow('page unavailable');
    client.destroy();
  });

  it('cancels obsolete pages and ignores late worker replies', async () => {
    const {worker, client, respond} = makeWorker();
    const metadata = client.getMetadata().catch(() => {});
    const controller = new AbortController();
    const page = client.getPage(9, controller.signal);
    controller.abort();
    await expect(page).rejects.toMatchObject({name: 'AbortError'});
    expect(worker.postMessage).toHaveBeenLastCalledWith({type: 'cancel', id: 1});
    expect(() => respond({type: 'error', id: 1, name: 'Error', message: 'late'})).not.toThrow();
    client.destroy();
    await metadata;
  });

  it('terminates its worker and rejects in-flight work on destruction', async () => {
    const {worker, client} = makeWorker();
    const metadata = client.getMetadata();
    const page = client.getPage(5, new AbortController().signal);
    client.destroy();
    client.destroy();
    await expect(metadata).rejects.toMatchObject({name: 'AbortError'});
    await expect(page).rejects.toMatchObject({name: 'AbortError'});
    await expect(client.getPage(6, new AbortController().signal)).rejects.toMatchObject({
      name: 'AbortError'
    });
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(worker.onmessage).toBeNull();
  });

  it('fails outstanding requests if the worker crashes', async () => {
    const {worker, client} = makeWorker();
    const metadata = client.getMetadata();
    const page = client.getPage(2, new AbortController().signal);
    worker.onerror?.({message: 'decoder crashed'} as ErrorEvent);
    await expect(metadata).rejects.toThrow('decoder crashed');
    await expect(page).rejects.toThrow('decoder crashed');
    expect(worker.terminate).toHaveBeenCalledTimes(1);
  });

  it('rejects protocol response type mismatches', async () => {
    const {client, respond} = makeWorker();
    const metadata = client.getMetadata();
    respond({type: 'ack', id: 0});
    await expect(metadata).rejects.toThrow('Expected RAD metadata.');

    const page = client.getPage(2, new AbortController().signal);
    respond({type: 'ack', id: 1});
    await expect(page).rejects.toThrow('Expected a decoded RAD page.');

    const selected = client.select(
      {
        cameraPosition: [0, 0, 2] as [number, number, number],
        viewportSize: [1, 1] as [number, number]
      },
      1
    );
    respond({type: 'ack', id: 2});
    await expect(selected).rejects.toThrow('Expected RAD selection.');
    client.destroy();
  });

  it('does not dispatch a page request for an already-aborted signal', async () => {
    const {worker, client} = makeWorker();
    const metadata = client.getMetadata().catch(() => {});
    const controller = new AbortController();
    controller.abort(new DOMException('obsolete view', 'AbortError'));
    await expect(client.getPage(4, controller.signal)).rejects.toMatchObject({name: 'AbortError'});
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    client.destroy();
    await metadata;
  });

  it('cleans up a request when worker dispatch throws synchronously', async () => {
    const {worker, client, respond} = makeWorker();
    const metadata = client.getMetadata();
    respond({type: 'metadata', id: 0, metadata: {count: 1}} as RADWorkerResponse);
    await metadata;
    vi.mocked(worker.postMessage).mockImplementationOnce(() => {
      throw new Error('worker channel closed');
    });
    const page = client.getPage(1, new AbortController().signal);
    await expect(page).rejects.toThrow('worker channel closed');
    expect(client['pending'].size).toBe(0);
    client.destroy();
  });
});
