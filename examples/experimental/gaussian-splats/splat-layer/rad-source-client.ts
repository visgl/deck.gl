// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {RADSource} from '@loaders.gl/splats';
import type {SplatHierarchyView} from '@luma.gl/splats';
import type {RADSelection, RADSelectionOptions} from './rad-selection';

export type RADMetadata = Awaited<ReturnType<RADSource['getMetadata']>>;
export type RADSplats = Awaited<ReturnType<RADSource['getChunkSplats']>>;
export type RADPage = {requestId: number; splats: RADSplats; colors: Float32Array};
export type RADWorkerRequest =
  | {type: 'initialize'; id: number; data: string | Blob}
  | {type: 'page'; id: number; pageIndex: number}
  | {type: 'configure'; id: number; options: RADSelectionOptions}
  | {type: 'select'; id: number; view: SplatHierarchyView; viewVersion: number}
  | {type: 'admit' | 'discard'; id: number; requestId: number}
  | {type: 'remove'; id: number; pageId: string}
  | {type: 'cancel'; id: number};
export type RADWorkerResponse =
  | {type: 'metadata'; id: number; metadata: RADMetadata}
  | {type: 'page'; id: number; page: RADPage}
  | {type: 'selection'; id: number; selection: RADSelection}
  | {type: 'ack'; id: number}
  | {type: 'error'; id: number; message: string; name: string};

export type RADWorker = {
  onmessage: ((event: MessageEvent<RADWorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage: (message: RADWorkerRequest) => void;
  terminate: () => void;
};

/** Fetches and decodes pages off-thread, transferring ownership of their typed arrays. */
export class RADSourceClient {
  private nextId = 0;
  private failure?: Error;
  private readonly pending = new Map<
    number,
    {resolve: (response: RADWorkerResponse) => void; reject: (error: Error) => void}
  >();
  private readonly metadata: Promise<RADMetadata>;

  constructor(
    data: string | Blob,
    private readonly worker: RADWorker = new Worker(
      new URL('./rad-source-worker.ts', import.meta.url),
      {
        type: 'module'
      }
    )
  ) {
    worker.onmessage = ({data: response}) => {
      const pending = this.pending.get(response.id);
      if (!pending) return;
      if (response.type === 'error') {
        const error = new Error(response.message);
        error.name = response.name;
        pending.reject(error);
      } else {
        pending.resolve(response);
      }
    };
    worker.onerror = event => this.stop(new Error(event.message || 'RAD decoder worker failed.'));
    this.metadata = this.request({type: 'initialize', id: this.nextId++, data}).then(response => {
      if (response.type !== 'metadata') throw new Error('Expected RAD metadata.');
      return response.metadata;
    });
  }

  getMetadata(): Promise<RADMetadata> {
    return this.metadata;
  }

  async getPage(pageIndex: number, signal: AbortSignal): Promise<RADPage> {
    const response = await this.request({type: 'page', id: this.nextId++, pageIndex}, signal);
    if (response.type !== 'page') throw new Error('Expected a decoded RAD page.');
    return response.page;
  }

  async configure(options: RADSelectionOptions): Promise<void> {
    await this.request({type: 'configure', id: this.nextId++, options});
  }

  async select(view: SplatHierarchyView, viewVersion: number): Promise<RADSelection> {
    const response = await this.request({type: 'select', id: this.nextId++, view, viewVersion});
    if (response.type !== 'selection') throw new Error('Expected RAD selection.');
    return response.selection;
  }

  async admit(requestId: number): Promise<void> {
    await this.request({type: 'admit', id: this.nextId++, requestId});
  }

  async discard(requestId: number): Promise<void> {
    await this.request({type: 'discard', id: this.nextId++, requestId});
  }

  async remove(pageId: string): Promise<void> {
    await this.request({type: 'remove', id: this.nextId++, pageId});
  }

  destroy(): void {
    this.stop(new DOMException('RAD scene destroyed.', 'AbortError'));
  }

  private request(
    message: Exclude<RADWorkerRequest, {type: 'cancel'}>,
    signal?: AbortSignal
  ): Promise<RADWorkerResponse> {
    if (this.failure) return Promise.reject(this.failure);
    if (signal?.aborted) return Promise.reject(signal.reason);
    return new Promise((resolve, reject) => {
      const cleanUp = () => {
        this.pending.delete(message.id);
        signal?.removeEventListener('abort', abort);
      };
      const abort = () => {
        cleanUp();
        this.worker.postMessage({type: 'cancel', id: message.id});
        reject(signal?.reason);
      };
      this.pending.set(message.id, {
        resolve: response => {
          cleanUp();
          resolve(response);
        },
        reject: error => {
          cleanUp();
          reject(error);
        }
      });
      signal?.addEventListener('abort', abort, {once: true});
      try {
        this.worker.postMessage(message);
      } catch (error) {
        cleanUp();
        reject(error);
      }
    });
  }

  private stop(error: Error): void {
    if (this.failure) return;
    this.failure = error;
    for (const pending of this.pending.values()) pending.reject(error);
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate();
  }
}
