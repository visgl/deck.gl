// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device, QuerySet, RenderPassProps} from '@luma.gl/core';

/** Timings of one deck.gl draw operation, reported by `Deck.props._onFrameTimings` */
export type FrameTimings = {
  /** CPU time, in milliseconds, spent rendering layers, including effects but excluding readback */
  cpuTime: number;
  /**
   * Sum of the GPU durations, in milliseconds, of the draw operation's layers render passes.
   * Omitted when timestamp queries are unavailable, disabled, exhausted or fail.
   */
  gpuTime?: number;
};

/** Render pass props that make a render pass write its begin and end timestamps */
export type RenderPassTimestamps = Required<
  Pick<RenderPassProps, 'timestampQuerySet' | 'beginTimestampIndex' | 'endTimestampIndex'>
>;

/** Upper bound on timed render passes per draw. Each pass uses two query slots. */
const MAX_TIMED_RENDER_PASSES = 32;
/** Upper bound on draws whose GPU timestamps are awaiting readback */
const MAX_PENDING_QUERY_SETS = 4;

/**
 * Measures the CPU time of a draw operation and, when the device supports `'timestamp-query'`,
 * the summed GPU time of its render passes.
 */
export class FrameTimer {
  readonly device: Device;

  /** Receives completed samples. Called synchronously for CPU-only draws. */
  private onFrameTimings: (timings: FrameTimings) => void;
  private freeQuerySets: QuerySet[] = [];
  private querySetCount = 0;
  private frameQuerySet: QuerySet | null = null;
  private frameRenderPassCount = 0;
  private frameStartTime = 0;
  private isDestroyed = false;

  constructor(device: Device, onFrameTimings: (timings: FrameTimings) => void) {
    this.device = device;
    this.onFrameTimings = onFrameTimings;
  }

  /** Starts timing a draw operation. Should be followed by `endFrame` or `abortFrame`. */
  beginFrame(): void {
    // Never reuse an incomplete measurement from an interrupted draw.
    this.abortFrame();
    this.frameStartTime = performance.now();
    this.frameQuerySet = this._getQuerySet();
    this.frameRenderPassCount = 0;
  }

  /**
   * Returns props that time the next render pass of this draw,
   * or null if GPU time is not measured.
   */
  getRenderPassTimestamps(): RenderPassTimestamps | null {
    if (!this.frameQuerySet) {
      return null;
    }
    const beginTimestampIndex = this.frameRenderPassCount * 2;
    this.frameRenderPassCount++;
    if (this.frameRenderPassCount > MAX_TIMED_RENDER_PASSES) {
      // A partial sum would under-report, so this draw is not GPU timed.
      return null;
    }
    return {
      timestampQuerySet: this.frameQuerySet,
      beginTimestampIndex,
      endTimestampIndex: beginTimestampIndex + 1
    };
  }

  /**
   * Finishes timing a draw operation. All timed render passes must have ended.
   * The sample is delivered synchronously when no GPU time is read back,
   * otherwise after readback settles, without `gpuTime` if it failed.
   */
  endFrame(): void {
    if (this.isDestroyed) return;
    const cpuTime = performance.now() - this.frameStartTime;
    const querySet = this.frameQuerySet;
    const renderPassCount = this.frameRenderPassCount;

    if (!querySet || renderPassCount === 0 || renderPassCount > MAX_TIMED_RENDER_PASSES) {
      this.abortFrame();
      this.onFrameTimings({cpuTime});
      return;
    }
    this.frameQuerySet = null;

    const durations: Promise<number>[] = [];
    for (let passIndex = 0; passIndex < renderPassCount; passIndex++) {
      durations.push(querySet.readTimestampDuration(passIndex * 2, passIndex * 2 + 1));
    }
    Promise.all(durations).then(
      passDurations => {
        this._releaseQuerySet(querySet);
        if (!this.isDestroyed) {
          const gpuTime = passDurations.reduce((sum, duration) => sum + duration, 0);
          this.onFrameTimings({cpuTime, gpuTime});
        }
      },
      () => {
        // e.g. a WebGL disjoint event invalidated a query. Unread results may remain queued
        // in the query set, so it is not reused.
        this._destroyQuerySet(querySet);
        if (!this.isDestroyed) {
          this.onFrameTimings({cpuTime});
        }
      }
    );
  }

  /** Discards an interrupted measurement */
  abortFrame(): void {
    if (this.frameQuerySet) {
      this._destroyQuerySet(this.frameQuerySet);
      this.frameQuerySet = null;
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

  /** Returns a query set for this draw, or null if GPU time cannot be measured */
  private _getQuerySet(): QuerySet | null {
    if (
      this.isDestroyed ||
      !this.device.features.has('timestamp-query') ||
      // luma's debug GPU timer owns pass timestamps: on WebGL its elapsed-time queries cannot
      // nest with ours, and on WebGPU it skips passes that already write timestamps.
      this.device._isDebugGPUTimeEnabled()
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
    this.querySetCount++;
    return this.device.createQuerySet({
      id: 'deck-frame-timer',
      type: 'timestamp',
      count: MAX_TIMED_RENDER_PASSES * 2
    });
  }

  private _releaseQuerySet(querySet: QuerySet): void {
    if (this.isDestroyed) {
      this._destroyQuerySet(querySet);
    } else {
      this.freeQuerySets.push(querySet);
    }
  }

  private _destroyQuerySet(querySet: QuerySet): void {
    querySet.destroy();
    this.querySetCount--;
  }
}
