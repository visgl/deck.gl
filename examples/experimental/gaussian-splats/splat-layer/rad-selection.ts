// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {SplatRADHierarchyManager} from '@luma.gl/splats';
import type {
  SplatHierarchyView,
  SplatRADHierarchyData,
  SplatRADHierarchyPage,
  SplatRADHierarchyFrontierEntry,
  SplatRADHierarchyRequest
} from '@luma.gl/splats';
import type {RADSplats} from './rad-source-client';

export type RADSelectionOptions = {
  pageSize: number;
  maxActiveSplats: number;
  maxResidentSplats?: number;
  maxConcurrentLoads?: number;
};
const SELECTION_ROWS_PER_SLICE = 65_536;
export type RADSelection = {
  version: number;
  viewVersion: number;
  frontier?: Array<{id: string; activeRows: Uint32Array}>;
  protectedPageIds: string[];
  requests: SplatRADHierarchyRequest[];
  hasPendingTraversal: boolean;
  duration: number;
};

/** Worker-only geometry. No colors, SH, GPU buffers, or rendering device are retained here. */
class RADGeometry implements SplatRADHierarchyData {
  readonly revision = 0;
  destroyed = false;
  readonly length: number;
  readonly rowIndexBase: number;
  readonly byteLength: number;
  readonly source: SplatRADHierarchyData['source'];

  constructor(
    readonly sourceBatchIndex: number,
    splats: RADSplats
  ) {
    this.length = splats.splatCount;
    this.rowIndexBase = Number(splats.loaderData?.base);
    this.source = {
      positions: splats.positions.slice(),
      scales: splats.scales.slice(),
      opacities: splats.opacities.slice()
    };
    this.byteLength = Object.values(this.source).reduce(
      (total, column) => total + column.byteLength,
      0
    );
  }

  destroy(): void {
    this.destroyed = true;
  }
}

/** Reuses luma's coherent RAD traversal with CPU columns instead of a fabricated GPU device. */
export class RADSelectionEngine {
  readonly hierarchy: SplatRADHierarchyManager<RADGeometry>;
  private readonly pending = new Map<number, SplatRADHierarchyPage<RADGeometry>>();
  private publishedFrontier?: readonly SplatRADHierarchyFrontierEntry<RADGeometry>[];
  private viewVersion = -1;
  private sourceChanged = true;
  private version = 0;

  constructor(options: RADSelectionOptions) {
    this.hierarchy = new SplatRADHierarchyManager<RADGeometry>({
      pageSize: options.pageSize,
      maximumActiveRows: options.maxActiveSplats,
      frustumCulling: false,
      maximumPendingPages: options.maxConcurrentLoads ?? 8,
      maximumResidentPages:
        options.maxResidentSplats === undefined
          ? undefined
          : Math.max(1, Math.floor(options.maxResidentSplats / options.pageSize)),
      lodOpacity: true,
      lodSplatScale: 1.5,
      lodRenderScale: 1.5,
      // The view supplies viewport-relative foveation. Do not penalize visible foreground
      // again with a narrow angular cone; keep only a separate behind-camera reduction.
      coneFov0: 180,
      coneFov: 180,
      coneFoveate: 1,
      behindFoveate: 0.05,
      refinementHysteresis: 0.15
    });
  }

  /** Retains only traversal columns until the host acknowledges GPU admission. */
  stage(requestId: number, pageIndex: number, splats: RADSplats): void {
    const {childCounts, childStarts, base} = splats.loaderData || {};
    if (
      !(childCounts instanceof Uint16Array) ||
      !(childStarts instanceof Uint32Array) ||
      !Number.isSafeInteger(base)
    ) {
      throw new Error(`RAD page ${pageIndex} is missing hierarchy metadata.`);
    }
    this.pending.set(requestId, {
      id: `rad:${pageIndex}`,
      data: new RADGeometry(pageIndex, splats),
      childCounts: childCounts.slice(),
      childStarts: childStarts.slice(),
      ownsData: true
    });
  }

  admit(requestId: number): void {
    const page = this.pending.get(requestId);
    if (!page) throw new Error('RAD page admission has no staged geometry.');
    this.pending.delete(requestId);
    this.hierarchy.registerPage(page);
    this.sourceChanged = true;
  }

  discard(requestId: number): void {
    this.pending.delete(requestId);
  }

  remove(pageId: string): void {
    // Pruning at the next explicit traversal avoids publishing intermediate root-only snapshots.
    this.hierarchy.residencyManager.remove(pageId);
    this.sourceChanged = true;
  }

  select(view: SplatHierarchyView, viewVersion: number): RADSelection {
    const start = performance.now();
    if (viewVersion !== this.viewVersion) {
      this.hierarchy.refineView(view, SELECTION_ROWS_PER_SLICE);
      this.viewVersion = viewVersion;
    } else if (this.sourceChanged || this.hierarchy.hasPendingTraversal) {
      // Admission wakes blocked parents, exchanging lower-value sibling groups when needed.
      // Do not restart a multi-million-row cut for each newly decoded page.
      this.hierarchy.continueTraversal(SELECTION_ROWS_PER_SLICE);
    }
    this.sourceChanged = false;
    const frontier = this.hierarchy.frontier;
    const selection: RADSelection = {
      version: ++this.version,
      viewVersion: this.viewVersion,
      protectedPageIds: this.hierarchy.residencyManager.residentChunks
        .filter(chunk => chunk.pinned)
        .map(chunk => chunk.id),
      requests: this.hierarchy.requests,
      hasPendingTraversal: this.hierarchy.hasPendingTraversal,
      duration: performance.now() - start
    };
    if (frontier !== this.publishedFrontier) {
      selection.frontier = frontier.map(entry => ({
        id: entry.id,
        activeRows: entry.activeRows.slice()
      }));
      this.publishedFrontier = frontier;
    }
    return selection;
  }

  destroy(): void {
    this.pending.clear();
    this.hierarchy.destroy();
  }
}
