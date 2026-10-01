// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Layer} from '@deck.gl/core';

/** Shares a soft scenegraph creation budget across one tileset's sublayers. */
export default class TileProcessingScheduler {
  private timeUsed = 0;
  private frame: number | null = null;
  private pendingLayers = new Set<Layer>();

  constructor(public timeBudget: number) {}

  run(layer: Layer, task: () => void): boolean {
    if (this.timeBudget <= 0) {
      task();
      return true;
    }

    if (this.frame === null) {
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.timeUsed = 0;
        for (const pendingLayer of this.pendingLayers) {
          pendingLayer.getCurrentLayer()?.setNeedsUpdate();
        }
        this.pendingLayers.clear();
      });
    }

    // Always allow the first tile to make progress, even when one tile exceeds the budget.
    if (this.timeUsed >= this.timeBudget) {
      this.pendingLayers.add(layer);
      return false;
    }

    const startedAt = performance.now();
    try {
      task();
    } finally {
      this.timeUsed += performance.now() - startedAt;
    }
    return true;
  }

  destroy(): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.pendingLayers.clear();
    this.timeUsed = 0;
  }
}
