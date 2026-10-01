// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device, QuerySet} from '@luma.gl/core';

/** Timings of one deck.gl draw operation, reported by `Deck.props._onFrameTimings` */
export type FrameTimings = {
  /** CPU time, in milliseconds, around layer rendering, including effects but excluding readback */
  cpuMs: number;
  /**
   * GPU time, in milliseconds, from the start of the draw operation's first layers render pass
   * to the end of its last one.
   * Omitted when timestamp queries are unavailable, disabled, exhausted or fail.
   */
  gpuMs?: number;
};

/** Upper bound on frames whose GPU timestamps are awaiting readback */
const MAX_PENDING_QUERY_SETS = 4;

/**
 * Measures CPU and GPU time of a frame.
 * GPU time is measured with the begin/end timestamps of a render pass when the device
 * supports `'timestamp-query'`.
 */
export class FrameTimer {
  readonly device: Device;

  private freeQuerySets: QuerySet[] = [];
  private querySetCount = 0;
  private frameQuerySet: QuerySet | null = null;
  private frameStartTime = 0;
  private isDestroyed = false;

  constructor(device: Device) {
    this.device = device;
  }

  /**
   * Starts timing a frame. Should be followed by `endFrame`.
   * @param options.measureGpuTime - set to false if the frame's render passes cannot write timestamps
   * @returns a query set whose timestamps 0 and 1 must be written by the timed render passes,
   * or null if GPU time is not measured for this frame
   */
  beginFrame({measureGpuTime = true}: {measureGpuTime?: boolean} = {}): QuerySet | null {
    // Never reuse an incomplete measurement from an interrupted draw.
    this.abortFrame();
    this.frameStartTime = performance.now();
    this.frameQuerySet = measureGpuTime ? this._getQuerySet() : null;
    return this.frameQuerySet;
  }

  /**
   * Finishes timing a frame. The timed render pass must have been submitted.
   * `onFrameTimings` is called synchronously when no GPU query is used,
   * otherwise after readback settles, including failures reported without `gpuMs`.
   */
  endFrame(onFrameTimings: (timings: FrameTimings) => void): void {
    if (this.isDestroyed) return;
    const cpuMs = performance.now() - this.frameStartTime;
    const querySet = this.frameQuerySet;
    this.frameQuerySet = null;

    if (!querySet) {
      onFrameTimings({cpuMs});
      return;
    }

    querySet
      .readTimestampDuration(0, 1)
      .then(
        gpuMs => {
          if (!this.isDestroyed) {
            onFrameTimings({cpuMs, gpuMs});
          }
        },
        () => {
          // e.g. a WebGL disjoint event invalidated the query
          if (!this.isDestroyed) {
            onFrameTimings({cpuMs});
          }
        }
      )
      .finally(() => this._releaseQuerySet(querySet));
  }

  /** Discards an interrupted measurement. The rendering pass must first close any active query. */
  abortFrame(): void {
    if (this.frameQuerySet) {
      this.frameQuerySet.destroy();
      this.frameQuerySet = null;
      this.querySetCount--;
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    this.abortFrame();
    for (const querySet of this.freeQuerySets) {
      querySet.destroy();
    }
    this.freeQuerySets = [];
  }

  /** Returns a query set for this frame, or null if GPU time cannot be measured */
  private _getQuerySet(): QuerySet | null {
    if (
      this.isDestroyed ||
      !this.device.features.has('timestamp-query') ||
      // WebGL elapsed-time queries cannot nest with luma's automatic pass profiling.
      (this.device.type === 'webgl' && this.device._isDebugGPUTimeEnabled())
    ) {
      return null;
    }
    const querySet = this.freeQuerySets.pop();
    if (querySet) {
      return querySet;
    }
    if (this.querySetCount >= MAX_PENDING_QUERY_SETS) {
      return null;
    }
    const newQuerySet = this.device.createQuerySet({
      id: 'deck-frame-timer',
      type: 'timestamp',
      count: 2
    });
    this.querySetCount++;
    return newQuerySet;
  }

  private _releaseQuerySet(querySet: QuerySet): void {
    if (this.isDestroyed) {
      querySet.destroy();
    } else {
      this.freeQuerySets.push(querySet);
    }
  }
}
