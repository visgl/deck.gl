// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {RequestScheduler} from '@loaders.gl/loader-utils';

export type PageRequest = {pageIndex: number; priority: number};

/** Current-view demand using the same bounded request scheduler as loaders.gl's 3D tilesets. */
export class PageScheduler {
  readonly active = new Map<number, AbortController>();
  readonly rejected = new Set<number>();
  private readonly queued = new Map<number, AbortController>();
  private readonly completed = new Set<number>();
  private readonly scheduler: RequestScheduler;
  private demanded = new Map<number, PageRequest>();
  private destroyed = false;

  constructor(
    concurrency: number,
    private readonly load: (request: PageRequest, signal: AbortSignal) => Promise<boolean>,
    private readonly onChange: () => void,
    private readonly onError: (error: Error) => void
  ) {
    this.scheduler = new RequestScheduler({maxRequests: concurrency});
  }

  invalidate(): void {
    this.rejected.clear();
  }

  update(requests: readonly PageRequest[], allowAdmission = true): void {
    if (this.destroyed) return;
    this.demanded = new Map(requests.map(request => [request.pageIndex, request]));
    for (const pageIndex of this.completed) {
      if (!this.demanded.has(pageIndex)) this.completed.delete(pageIndex);
    }
    for (const [pageIndex, controller] of this.queued) {
      if (!this.demanded.has(pageIndex)) controller.abort();
    }
    if (!allowAdmission) return;
    for (const request of requests) {
      const {pageIndex} = request;
      if (
        this.queued.has(pageIndex) ||
        this.rejected.has(pageIndex) ||
        this.completed.has(pageIndex)
      )
        continue;
      const controller = new AbortController();
      this.queued.set(pageIndex, controller);
      void this.scheduler
        .scheduleRequest(controller, () => {
          const current = this.demanded.get(pageIndex);
          if (this.destroyed || controller.signal.aborted || !current) return -1;
          // loaders.gl orders smaller nonnegative values first; RAD importance runs the other way.
          return 1 / (1 + Math.max(0, current.priority));
        })
        .then(async slot => {
          if (!slot) return;
          try {
            const current = this.demanded.get(pageIndex);
            if (this.destroyed || controller.signal.aborted || !current) return;
            this.active.set(pageIndex, controller);
            const accepted = await this.load(current, controller.signal);
            if (this.destroyed || controller.signal.aborted) return;
            if (accepted) {
              this.completed.add(pageIndex);
              this.invalidate();
            } else {
              this.rejected.add(pageIndex);
            }
          } finally {
            // Frees this individual slot; a slow sibling never holds back queued current-view work.
            slot.done();
          }
        })
        .catch(error => {
          if (this.destroyed || controller.signal.aborted) return;
          this.rejected.add(pageIndex);
          this.onError(error instanceof Error ? error : new Error(String(error)));
        })
        .finally(() => {
          this.active.delete(pageIndex);
          this.queued.delete(pageIndex);
          if (!this.destroyed) this.onChange();
        });
    }
  }

  destroy(): void {
    this.destroyed = true;
    for (const controller of this.queued.values()) controller.abort();
    this.active.clear();
    this.queued.clear();
    this.rejected.clear();
    this.completed.clear();
    this.demanded.clear();
  }
}
