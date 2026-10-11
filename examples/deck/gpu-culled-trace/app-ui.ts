// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {PickingInfo} from '@deck.gl/core';
import {ArrowExamplePanelManager} from '../../arrow/arrow-example-panels';
import {makeHtmlCustomPanel} from '../../example-panels';
import type {GPUTraceCullingStats} from './gpu-trace-culling-effect';
import {getTraceRow, type makeDeckTraceData} from './trace-data';

type TraceData = ReturnType<typeof makeDeckTraceData>;

/** Owns the explanatory panels and tooltip for the GPU-culled trace example. */
export class GPUCulledTraceUserInterface {
  readonly panelManager: ArrowExamplePanelManager;

  private readonly traceData: TraceData;
  private statsElement: HTMLElement | null = null;
  private cullingStats: GPUTraceCullingStats;

  constructor(traceData: TraceData, initialStats: GPUTraceCullingStats) {
    this.traceData = traceData;
    this.cullingStats = initialStats;
    this.panelManager = new ArrowExamplePanelManager({
      descriptionHtml:
        '<p style="margin:0;line-height:1.45">One WebGPU command graph culls trace blocks and row-indexed Arrow glyph records before deck.gl draws both layers indirectly.</p>',
      settingsPanel: () =>
        makeHtmlCustomPanel({
          id: 'gpu-culled-trace-culling',
          title: 'Culling',
          html: '<div data-gpu-trace-culling-stats></div>',
          onRender: root => {
            this.statsElement = root.querySelector('[data-gpu-trace-culling-stats]');
            renderCullingStats(this.statsElement, this.cullingStats);
            return () => {
              this.statsElement = null;
            };
          }
        })
    });
    this.panelManager.setTableEntries([
      {id: 'gpu-trace-text', label: 'Trace text', kind: 'source', table: traceData.textTable}
    ]);
  }

  mount(): void {
    this.panelManager.mount();
  }

  finalize(): void {
    this.panelManager.finalize();
  }

  updateCullingStats(stats: GPUTraceCullingStats): void {
    this.cullingStats = stats;
    renderCullingStats(this.statsElement, stats);
  }

  getTooltip(info: PickingInfo): {html: string} | null {
    const row = getTraceRow(this.traceData, info.index);
    if (!row) return null;
    return {
      html: `<div><strong>${escapeHtml(row.name)}</strong></div>
        <div>group: ${row.group}</div>
        <div>start: ${row.start.toFixed(3)}</div>
        <div>duration: ${row.duration.toFixed(3)}</div>
        <div>lane: ${row.lane}</div>`
    };
  }
}

function renderCullingStats(element: HTMLElement | null, stats: GPUTraceCullingStats): void {
  if (!element) return;
  const glyphCounts = stats.totalGlyphs
    ? `${formatCount(stats.visibleGlyphs)} / ${formatCount(stats.totalGlyphs)}`
    : escapeHtml(stats.labelStatus);
  element.innerHTML = `<div style="display:grid;grid-template-columns:1fr auto;gap:5px 16px;font:12px/1.45 system-ui,sans-serif;font-variant-numeric:tabular-nums">
    <span>Visible blocks</span><strong>${formatCount(stats.visibleBlocks)} / ${formatCount(stats.totalBlocks)}</strong>
    <span>Outside view</span><strong>${formatCount(stats.outsideBlocks)}</strong>
    <span>Too small (&lt;1 px)</span><strong>${formatCount(stats.smallBlocks)}</strong>
    <span>Visible glyphs</span><strong>${glyphCounts}</strong>
    <span>Graph nodes</span><strong>${stats.graphNodeCount}</strong>
    <span>CPU graph encode</span><strong>${stats.encodeTimeMilliseconds.toFixed(2)} ms</strong>
    <span>Logical scratch</span><strong>${formatBytes(stats.logicalTransientBytes)}</strong>
    <span>Physical scratch</span><strong>${formatBytes(stats.physicalTransientBytes)}</strong>
    <span>Transient reuse</span><strong>${stats.transientReusePercentage.toFixed(0)}%</strong>
  </div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return entities[character]!;
  });
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US', {notation: 'compact', maximumFractionDigits: 1}).format(
    value
  );
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`;
  return `${(value / 1024 / 1024).toFixed(1)} MiB`;
}
