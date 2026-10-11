// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {GPUCommandGraphInspectorSnapshot} from '@luma.gl/gpgpu/gpu-core';
import {CompactDropdown} from './compact-dropdown';

const STANDARD_COUNTER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1
});
const COMPACT_COUNTER_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export type GPUCommandGraphInspectorPanelProps = {
  /** Optional human-readable graph names keyed by compiled graph ID. */
  graphLabels?: Readonly<Record<string, string>>;
  /** Optional human-readable counter names keyed by application-defined counter ID. */
  counterLabels?: Readonly<Record<string, string>>;
};

/**
 * Small DOM renderer for the data-only `GPUCommandGraphInspector`.
 *
 * The panel deliberately lives with the examples rather than the graph runtime so applications can
 * render the same immutable snapshots in their own UI framework.
 */
export class GPUCommandGraphInspectorPanel {
  private readonly element: HTMLElement;
  private readonly graphLabels: Readonly<Record<string, string>>;
  private readonly counterLabels: Readonly<Record<string, string>>;
  private snapshot: GPUCommandGraphInspectorSnapshot = {graphs: []};
  private selectedGraphId: string | null = null;
  private selectionIsManual = false;
  private graphOptionsSignature = '';
  private readonly graphDropdown: CompactDropdown;

  constructor(element: HTMLElement, props: GPUCommandGraphInspectorPanelProps = {}) {
    this.element = element;
    this.graphLabels = props.graphLabels ?? {};
    this.counterLabels = props.counterLabels ?? {};
    this.element.innerHTML = `<div data-gpu-command-graph-inspector>
      <style>${GPU_COMMAND_GRAPH_INSPECTOR_CSS}</style>
      <span class="graph-inspector-empty" data-graph-inspector-empty>No graph activity recorded.</span>
      <div class="graph-inspector-content" data-graph-inspector-content hidden>
        <div class="graph-inspector-picker"><span>Graph</span><div data-graph-inspector-picker-host></div></div>
        <div class="graph-inspector-summary">
          ${makeMetric('encodings', '', 'encoding-count')}
          ${makeMetric('CPU p50 / p95', '', 'cpu-totals')}
          ${makeMetric('GPU p50 / p95', '', 'gpu-totals')}
          ${makeMetric('GPU samples', '', 'gpu-samples')}
        </div>
        <div class="graph-inspector-memory" data-graph-inspector-memory></div>
        <div class="graph-inspector-counters" data-graph-inspector-counters hidden>
          <div class="graph-inspector-counter graph-inspector-counter-header"><span>Sampled counter</span><strong>Latest</strong><strong>50/95</strong></div>
          <div class="graph-inspector-counter-rows" data-graph-inspector-counter-rows></div>
        </div>
        <div class="graph-inspector-node graph-inspector-node-header"><span>Node</span><strong>CPU 50/95</strong><strong>GPU 50/95</strong></div>
        <div class="graph-inspector-nodes" data-graph-inspector-nodes></div>
      </div>
    </div>`;
    const dropdownHost = this.element.querySelector<HTMLElement>(
      '[data-graph-inspector-picker-host]'
    )!;
    this.graphDropdown = new CompactDropdown(dropdownHost, {
      ariaLabel: 'Graph',
      options: [],
      onChange: value => {
        this.selectedGraphId = value;
        this.selectionIsManual = true;
        this.render();
      }
    });
  }

  /** Renders the latest immutable snapshot without resetting a user's graph selection. */
  update(snapshot: GPUCommandGraphInspectorSnapshot, preferredGraphId?: string): void {
    this.snapshot = snapshot;
    const hasSelectedGraph = snapshot.graphs.some(graph => graph.id === this.selectedGraphId);
    if (!hasSelectedGraph) {
      this.selectedGraphId = null;
      this.selectionIsManual = false;
    }
    if (!this.selectionIsManual && preferredGraphId) {
      const preferredGraph = snapshot.graphs.find(graph => graph.id === preferredGraphId);
      if (preferredGraph) this.selectedGraphId = preferredGraph.id;
    }
    this.selectedGraphId ??= snapshot.graphs[0]?.id ?? null;
    this.render();
  }

  /** Removes the panel DOM, portalled popup, and event listeners. */
  destroy(): void {
    this.graphDropdown.destroy();
    this.element.replaceChildren();
  }

  private render(): void {
    const graph = this.snapshot.graphs.find(candidate => candidate.id === this.selectedGraphId);
    const emptyElement = this.element.querySelector<HTMLElement>('[data-graph-inspector-empty]')!;
    const contentElement = this.element.querySelector<HTMLElement>(
      '[data-graph-inspector-content]'
    )!;
    if (!graph) {
      emptyElement.hidden = false;
      contentElement.hidden = true;
      return;
    }

    emptyElement.hidden = true;
    contentElement.hidden = false;
    const graphOptionsSignature = this.snapshot.graphs
      .map(candidate => `${candidate.id}\u0000${this.getGraphLabel(candidate.id)}`)
      .join('\u0001');
    if (graphOptionsSignature !== this.graphOptionsSignature) {
      this.graphDropdown.setOptions(
        this.snapshot.graphs.map(candidate => ({
          value: candidate.id,
          label: this.getGraphLabel(candidate.id)
        }))
      );
      this.graphOptionsSignature = graphOptionsSignature;
    }
    if (this.graphDropdown.value !== graph.id) this.graphDropdown.value = graph.id;

    const logicalTransientResourceBytes =
      graph.stats.logicalTransientBytes + graph.stats.logicalTransientTextureBytes;
    const reusedTransientResourceBytes =
      graph.stats.reusedTransientBytes + graph.stats.reusedTransientTextureBytes;
    const reusePercentage = logicalTransientResourceBytes
      ? (reusedTransientResourceBytes / logicalTransientResourceBytes) * 100
      : 0;
    const gpuSampleCount = graph.totals.gpu.sampleCount;
    const rows = graph.nodes
      .map(
        node => `<div class="graph-inspector-node" data-full-name="${escapeHtml(node.id)}">
          <span><i>${escapeHtml(node.group ?? node.type)}</i>${escapeHtml(getShortNodeId(node.id, graph.id))}</span>
          <strong>${formatDurationPair(node.cpu)}</strong>
          <strong>${formatDurationPair(node.gpu)}</strong>
        </div>`
      )
      .join('');
    const counterRows = graph.counters
      .map(
        counter => `<div class="graph-inspector-counter" title="${escapeHtml(counter.id)} · ${counter.sampleCount} samples">
          <span>${escapeHtml(this.getCounterLabel(counter.id))}</span>
          <strong>${formatCounterValue(counter.latestValue)}</strong>
          <strong>${formatCounterValue(counter.p50Value)} / ${formatCounterValue(counter.p95Value)}</strong>
        </div>`
      )
      .join('');
    this.setText('encoding-count', String(graph.encodingCount));
    this.setText('cpu-totals', formatDurationPair(graph.totals.cpu));
    this.setText('gpu-totals', formatDurationPair(graph.totals.gpu));
    this.setText(
      'gpu-samples',
      `${gpuSampleCount}${graph.timingReadFailureCount ? ` · ${graph.timingReadFailureCount} failed` : ''}`
    );
    this.element.querySelector<HTMLElement>('[data-graph-inspector-memory]')!.innerHTML = `
      <span>${graph.stats.nodeOrder.length} nodes</span>
      <span>${formatBytes(graph.stats.logicalResourceBytes)} logical</span>
      <span>${formatBytes(graph.stats.physicalTransientResourceBytes)} scratch</span>
      ${graph.preflight?.annotatedNodeCount ? `<span>${graph.preflight.annotatedNodeCount}/${graph.stats.nodeOrder.length} costed nodes</span>` : ''}
      ${graph.preflight?.maximumInvocationCount ? `<span>${formatCount(graph.preflight.maximumInvocationCount)} max invocations</span>` : ''}
      ${graph.preflight?.readByteLength ? `<span>${formatBytes(graph.preflight.readByteLength)} max reads</span>` : ''}
      ${graph.preflight?.writeByteLength ? `<span>${formatBytes(graph.preflight.writeByteLength)} max writes</span>` : ''}
      <span>${reusePercentage ? `${reusePercentage.toFixed(0)}% reuse` : 'no reuse'}</span>
      <span>${gpuSampleCount ? 'GPU timings sampled' : 'CPU timings only'}</span>`;
    const countersElement = this.element.querySelector<HTMLElement>(
      '[data-graph-inspector-counters]'
    )!;
    countersElement.hidden = graph.counters.length === 0;
    this.element.querySelector<HTMLElement>('[data-graph-inspector-counter-rows]')!.innerHTML =
      counterRows;
    this.element.querySelector<HTMLElement>('[data-graph-inspector-nodes]')!.innerHTML = rows;
  }

  private setText(identifier: string, value: string): void {
    this.element.querySelector<HTMLElement>(`[data-graph-inspector-${identifier}]`)!.textContent =
      value;
  }

  private getGraphLabel(graphId: string): string {
    return getOwnLabel(this.graphLabels, graphId);
  }

  private getCounterLabel(counterId: string): string {
    return getOwnLabel(this.counterLabels, counterId);
  }
}

function formatCount(value: number): string {
  return COMPACT_COUNTER_FORMATTER.format(value);
}

const GPU_COMMAND_GRAPH_INSPECTOR_CSS = /* css */ `
  [data-gpu-command-graph-inspector] { min-width: 0; }
  [data-gpu-command-graph-inspector] * { box-sizing: border-box; }
  [data-gpu-command-graph-inspector] .graph-inspector-content { display: grid; gap: 7px; min-width: 0; }
  [data-gpu-command-graph-inspector] .graph-inspector-content[hidden] { display: none; }
  [data-gpu-command-graph-inspector] .graph-inspector-picker {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    color: #91a6c3;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .07em;
    text-transform: uppercase;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-metric {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
    min-width: 0;
    padding: 5px 6px;
    border: 1px solid rgb(137 166 211 / 14%);
    border-radius: 4px;
    background: rgb(15 24 38 / 54%);
    color: #8295af;
    font: 8px/1.2 system-ui, sans-serif;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-metric strong {
    overflow: hidden;
    color: #e8f1ff;
    font: 650 9px/1.2 ui-monospace, monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-memory {
    display: flex;
    flex-wrap: wrap;
    gap: 3px 8px;
    color: #7286a2;
    font: 8px/1.35 ui-monospace, monospace;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-counters[hidden] { display: none; }
  [data-gpu-command-graph-inspector] .graph-inspector-counter-rows {
    max-height: 110px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-counter {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 52px 66px;
    align-items: center;
    gap: 7px;
    min-height: 22px;
    border-bottom: 1px solid rgb(137 166 211 / 9%);
    color: #b9c8dc;
    font: 8px/1.25 ui-monospace, monospace;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-counter > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-counter strong {
    color: #dce8f7;
    font-weight: 600;
    text-align: right;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-counter-header {
    min-height: 17px;
    border-bottom-color: rgb(137 166 211 / 18%);
    color: #7186a3;
    font: 7px/1.2 system-ui, sans-serif;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-counter-header strong {
    color: #7186a3;
    font-weight: 600;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 66px 66px;
    align-items: center;
    gap: 7px;
    min-height: 22px;
    border-bottom: 1px solid rgb(137 166 211 / 9%);
    color: #b9c8dc;
    font: 8px/1.25 ui-monospace, monospace;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node:not(.graph-inspector-node-header)::after {
    position: absolute;
    z-index: 4;
    inset: 1px 0;
    display: flex;
    align-items: center;
    padding: 3px 6px;
    border: 1px solid rgb(114 158 212 / 30%);
    border-radius: 4px;
    background: rgb(8 16 27 / 98%);
    box-shadow: 0 5px 16px rgb(0 0 0 / 35%);
    color: #e4effc;
    content: attr(data-full-name);
    font: 8px/1.25 ui-monospace, monospace;
    opacity: 0;
    overflow-wrap: anywhere;
    pointer-events: none;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node:not(.graph-inspector-node-header):hover::after {
    opacity: 1;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node i {
    display: inline-block;
    min-width: 43px;
    margin-right: 5px;
    color: #729ed4;
    font-style: normal;
    text-transform: uppercase;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node strong {
    color: #dce8f7;
    font-weight: 600;
    text-align: right;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node-header {
    min-height: 17px;
    border-bottom-color: rgb(137 166 211 / 18%);
    color: #7186a3;
    font: 7px/1.2 system-ui, sans-serif;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-node-header strong {
    color: #7186a3;
    font-weight: 600;
  }
  [data-gpu-command-graph-inspector] .graph-inspector-nodes { max-height: 154px; overflow: auto; }
  [data-gpu-command-graph-inspector] .graph-inspector-empty { color: #8192aa; font-size: 9px; }
`;

function makeMetric(label: string, value: string, identifier: string): string {
  return `<span class="graph-inspector-metric"><span>${escapeHtml(label)}</span><strong data-graph-inspector-${identifier}>${escapeHtml(value)}</strong></span>`;
}

function getShortNodeId(nodeId: string, graphId: string): string {
  const commonPrefix = graphId.endsWith('-graph') ? graphId.slice(0, -'-graph'.length) : graphId;
  const shortIdentifier = nodeId.startsWith(`${commonPrefix}-`)
    ? nodeId.slice(commonPrefix.length + 1)
    : nodeId;
  return shortIdentifier.length > 32 ? `${shortIdentifier.slice(0, 30)}…` : shortIdentifier;
}

function formatDurationPair(summary: {p50Milliseconds?: number; p95Milliseconds?: number}): string {
  if (summary.p50Milliseconds === undefined) return '—';
  const p50 = formatCompactMilliseconds(summary.p50Milliseconds);
  const p95 = formatCompactMilliseconds(summary.p95Milliseconds ?? summary.p50Milliseconds);
  return `${p50} / ${p95}`;
}

function formatCompactMilliseconds(value: number): string {
  return value.toFixed(value < 1 ? 3 : 2);
}

function formatCounterValue(value: number): string {
  return (value >= 10_000 ? COMPACT_COUNTER_FORMATTER : STANDARD_COUNTER_FORMATTER).format(value);
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KiB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MiB`;
  return `${(value / 1024 ** 3).toFixed(1)} GiB`;
}

function getOwnLabel(labels: Readonly<Record<string, string>>, id: string): string {
  return Object.prototype.hasOwnProperty.call(labels, id) ? labels[id] : id;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
