// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {GPUPagedSplatRenderer, makeGPUSplatData, SplatResidencyManager} from '@luma.gl/splats';
import type {SplatHierarchyView, GPUPagedSplatPage} from '@luma.gl/splats';
import {PageScheduler} from './page-scheduler';
import {RADSourceClient, type RADPage} from './rad-source-client';
import type {RADSelection} from './rad-selection';

/** Loading diagnostics reported by the experimental SplatLayer. */
export type SplatLayerStatus = {
  /** Current loading/refinement state; ready means selection settled within configured budgets. */
  phase: 'loading' | 'refining' | 'ready' | 'budget-limited' | 'error';
  /** Human-readable progress or error description. */
  message: string;
  /** Number of original source rows in the displayed frontier. */
  activeSplats: number;
  /** Number of intact source pages currently admitted to GPU residency. */
  residentPages: number;
  /** Number of pages requested by the current selection, including pending admission. */
  pendingPages: number;
  /** Total original source rows reported by RAD metadata. */
  sourceSplats: number;
};

export type RADSceneOptions = {
  data: string | Blob;
  maxActiveSplats: number;
  maxResidentSplats: number;
  maxConcurrentLoads: number;
  onChange: () => void;
  onStatus: (status: SplatLayerStatus) => void;
  onError: (error: Error) => void;
};

/** Owns GPU pages and worker lifecycle, never the host canvas, animation loop, or device. */
export class RADScene {
  readonly renderer: GPUPagedSplatRenderer;
  readonly residency: SplatResidencyManager;
  readonly scheduler: PageScheduler;
  private readonly source: RADSourceClient;
  private readonly abortController = new AbortController();
  private destroyed = false;
  private rootReady = false;
  private sourceSplats = 0;
  private pageSize = 0;
  private currentView?: SplatHierarchyView;
  private viewVersion = 0;
  private appliedVersion = 0;
  private selecting = false;
  private selectionNeeded = true;
  private pendingSelection?: {result: RADSelection; leasedIds: Set<string>};
  private readonly pendingUploads: Array<() => void> = [];
  private uploadsSinceSelection = 0;
  private requests: RADSelection['requests'] = [];
  private presentedFrontier: readonly GPUPagedSplatPage[] = [];
  private lastStatus = '';
  private error?: Error;

  constructor(
    private readonly device: Device,
    private readonly options: RADSceneOptions
  ) {
    this.renderer = new GPUPagedSplatRenderer(device, {
      sortMode: 'global',
      alphaCutoff: 0.5 / 255,
      gaussianSupportRadius: Math.sqrt(8),
      kernel2DSize: Math.sqrt(0.3),
      maxScreenSpaceSplatSize: 512,
      toneMapping: 'none',
      lodOpacity: true
    });
    this.source = new RADSourceClient(options.data);
    this.residency = new SplatResidencyManager({
      // Bounded transition headroom covers old visible pages until a coherent replacement arrives.
      maxResidentSplats: options.maxResidentSplats + options.maxActiveSplats,
      ownsData: true,
      onEvict: chunk => {
        if (!this.destroyed) {
          this.selectionNeeded = true;
          void this.source.remove(chunk.id).catch(error => this.fail(error));
        }
      }
    });
    this.scheduler = new PageScheduler(
      options.maxConcurrentLoads,
      (request, signal) => this.loadPage(request.pageIndex, request.priority, signal),
      options.onChange,
      error => this.fail(error)
    );
    this.report('loading', 'Loading RAD metadata and root page…');
    void this.initialize().catch(error => this.fail(error));
  }

  /** Camera updates are immediate; CPU traversal never executes on the host rendering thread. */
  update(view: SplatHierarchyView, opacity: number, _now: number): void {
    if (this.destroyed || !this.rootReady || this.error) return;
    if (!this.currentView || !sameView(this.currentView, view)) {
      this.currentView = view;
      this.viewVersion++;
      this.selectionNeeded = true;
      this.scheduler.invalidate();
      this.renderer.setProps(view);
    }
    this.renderer.setProps({alphaScale: opacity});
    this.applySelection();
    // Upload only while no worker owns a residency lease. Yield between pages, so decode
    // completions cannot enqueue an unbounded run of GPU allocation work ahead of input.
    if (!this.selecting && this.pendingUploads.length) {
      this.uploadsSinceSelection++;
      this.pendingUploads.shift()!();
    }
    this.scheduler.update(this.requests);
    if (
      !this.selecting &&
      this.selectionNeeded &&
      (!this.pendingUploads.length || this.uploadsSinceSelection >= 4)
    ) {
      this.uploadsSinceSelection = 0;
      this.select();
    }
    if (!this.selecting && this.pendingUploads.length) this.options.onChange();
    const runnable = this.requests.some(request => !this.scheduler.rejected.has(request.pageIndex));
    const refining = this.selecting || this.selectionNeeded || Boolean(this.scheduler.active.size);
    this.report(
      refining || runnable ? 'refining' : this.requests.length ? 'budget-limited' : 'ready',
      refining || runnable
        ? 'Refining off-thread; camera and visible detail remain live.'
        : this.requests.length
          ? 'Resident budget reached; visible detail remains available.'
          : 'Current view resolved.'
    );
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.abortController.abort();
    this.scheduler.destroy();
    this.source.destroy();
    for (const upload of this.pendingUploads.splice(0)) upload();
    this.pendingSelection = undefined;
    this.renderer.destroy();
    this.residency.destroy();
  }

  private async initialize(): Promise<void> {
    const metadata = await this.source.getMetadata();
    if (this.destroyed) return;
    if (!metadata.lodTree || !metadata.chunkSize) {
      throw new Error('SplatLayer requires a RAD hierarchy with a declared chunkSize.');
    }
    this.sourceSplats = metadata.count;
    this.pageSize = metadata.chunkSize;
    await this.source.configure({
      pageSize: this.pageSize,
      maxActiveSplats: this.options.maxActiveSplats,
      // The selector spends the base page budget, not the old/new-view transition headroom.
      maxResidentSplats: this.options.maxResidentSplats,
      maxConcurrentLoads: this.options.maxConcurrentLoads
    });
    if (this.destroyed) return;
    const accepted = await this.loadPage(0, Number.MAX_SAFE_INTEGER, this.abortController.signal);
    if (this.destroyed) return;
    if (!accepted) throw new Error('The RAD root page exceeds maxResidentSplats.');
    this.rootReady = true;
    this.options.onChange();
  }

  private select(): void {
    if (!this.currentView) return;
    this.selecting = true;
    this.selectionNeeded = false;
    // Lease all possible traversal inputs until the worker returns its exact protected set.
    // Pages admitted after dispatch retain their admission pins until a subsequent selection.
    const leasedIds = new Set(this.residency.residentChunks.map(chunk => chunk.id));
    for (const id of leasedIds) this.residency.pin(id);
    void this.source
      .select(this.currentView, this.viewVersion)
      .then(result => {
        if (this.destroyed) return;
        this.pendingSelection = {result, leasedIds};
        this.options.onChange();
      })
      .catch(error => this.fail(error));
  }

  private applySelection(): void {
    const pending = this.pendingSelection;
    if (!pending) return;
    this.pendingSelection = undefined;
    this.selecting = false;
    const {result, leasedIds} = pending;
    if (result.version <= this.appliedVersion) {
      this.selectionNeeded = true;
      return;
    }
    if (result.frontier) {
      const nextFrontier = result.frontier.map(entry => {
        const chunk = this.residency.getChunk(entry.id);
        if (!chunk) throw new Error('RAD selection referenced a page outside its residency lease.');
        return {...entry, data: chunk.data};
      });
      this.renderer.setFrontier(nextFrontier);
      this.presentedFrontier = nextFrontier;
    }
    this.appliedVersion = result.version;
    this.requests = result.requests;
    this.selectionNeeded ||= result.hasPendingTraversal || result.viewVersion !== this.viewVersion;
    const protectedIds = new Set([
      'rad:0',
      ...result.protectedPageIds,
      ...this.presentedFrontier.map(entry => entry.id)
    ]);
    for (const id of protectedIds) this.residency.pin(id);
    for (const id of leasedIds) {
      if (!protectedIds.has(id)) this.residency.unpin(id);
    }
    for (const id of leasedIds) {
      // Off-frontier, unprotected pages must not retain their old download importance forever.
      if (!protectedIds.has(id)) this.residency.setPriority(id, 0);
    }
    this.scheduler.invalidate();
    if (
      typeof location !== 'undefined' &&
      new URLSearchParams(location.search).get('diagnostic') === 'worker'
    ) {
      console.debug(
        'COIT_SLICE',
        JSON.stringify({
          duration: result.duration,
          viewVersion: result.viewVersion,
          requestedViewVersion: this.viewVersion,
          pending: result.hasPendingTraversal,
          published: Boolean(result.frontier),
          requests: result.requests.length,
          activeSplats: this.presentedFrontier.reduce(
            (count, entry) => count + (entry.activeRows?.length ?? 0),
            0
          ),
          residentPages: this.residency.stats.residentChunkCount,
          protectedPages: protectedIds.size,
          evictedPages: this.residency.stats.evictedChunkCount
        })
      );
    }
  }

  private async loadPage(
    pageIndex: number,
    priority: number,
    signal: AbortSignal
  ): Promise<boolean> {
    if (this.destroyed || signal.aborted) return false;
    let page: RADPage | undefined;
    const pageId = `rad:${pageIndex}`;
    try {
      page = await this.source.getPage(pageIndex, signal);
      const decoded = page;
      const accepted = await new Promise<boolean>((resolve, reject) => {
        const upload = () => {
          if (this.destroyed || signal.aborted) {
            resolve(false);
            return;
          }
          try {
            const {splats, colors} = decoded;
            void this.residency
              .load(
                pageId,
                () => {
                  signal.throwIfAborted();
                  if (this.destroyed) throw new DOMException('RAD scene destroyed.', 'AbortError');
                  return makeGPUSplatData(this.device, {
                    positions: splats.positions,
                    scales: splats.scales,
                    rotations: splats.rotations,
                    colors,
                    opacities: splats.opacities,
                    sphericalHarmonics: splats.sphericalHarmonics,
                    sourceBatchIndex: pageIndex,
                    rowIndexBase: Number(splats.loaderData?.base)
                  });
                },
                {priority, pinned: true, estimatedSplatCount: splats.splatCount}
              )
              .then(async chunk => {
                if (!chunk || this.destroyed) {
                  resolve(false);
                  return;
                }
                await this.source.admit(decoded.requestId);
                if (!this.destroyed) {
                  this.selectionNeeded = true;
                  this.options.onChange();
                }
                resolve(true);
              })
              .catch(reject);
          } catch (error) {
            reject(error);
          }
        };
        if (this.rootReady) {
          this.pendingUploads.push(upload);
          this.options.onChange();
        } else {
          upload();
        }
      });
      if (!accepted || this.destroyed) {
        if (page && !this.destroyed) await this.source.discard(page.requestId);
        return false;
      }
      // Once admitted, finish the transaction even if the old camera's request was cancelled.
      this.selectionNeeded = true;
      this.options.onChange();
      return true;
    } catch (error) {
      if (page && !this.destroyed) {
        this.residency.remove(pageId);
        await this.source.discard(page.requestId);
      }
      throw error;
    }
  }

  private fail(error: Error): void {
    if (this.destroyed) return;
    this.error = error;
    this.report('error', error.message);
    this.options.onError(error);
  }

  private report(phase: SplatLayerStatus['phase'], message: string): void {
    const status: SplatLayerStatus = {
      phase,
      message,
      activeSplats: this.presentedFrontier.reduce(
        (total, entry) => total + (entry.activeRows?.length ?? entry.data.length),
        0
      ),
      residentPages: this.residency.stats.residentChunkCount,
      pendingPages: this.requests.length,
      sourceSplats: this.sourceSplats
    };
    const serialized = JSON.stringify(status);
    if (serialized !== this.lastStatus) {
      this.lastStatus = serialized;
      this.options.onStatus(status);
    }
  }
}

function sameView(left: SplatHierarchyView, right: SplatHierarchyView): boolean {
  return (
    left.viewportSize[0] === right.viewportSize[0] &&
    left.viewportSize[1] === right.viewportSize[1] &&
    Boolean(
      left.modelViewProjectionMatrix?.every(
        (value, index) => value === right.modelViewProjectionMatrix?.[index]
      )
    )
  );
}
