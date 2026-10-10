// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Effect, EffectContext} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import {
  DrawCommandBuffer,
  GPUCommandGraph,
  GPUCompaction,
  GPUTextSelection,
  type CompiledGPUCommandGraph
} from '@luma.gl/gpgpu/gpu-core';
import type {DeckTraceData} from './trace-data';
import {GPUCulledArrowTextLayer, type GPUCulledTextSource} from './gpu-culled-arrow-text-layer';

const UINT32_BYTE_LENGTH = Uint32Array.BYTES_PER_ELEMENT;
const MINIMUM_BLOCK_PIXELS = 1;

type EffectResources = {
  spans: Buffer;
  visibleIds: Buffer;
  rowFlags: Buffer;
  cullingCounts: Buffer;
  viewUniforms: Buffer;
  blockDrawCommands: DrawCommandBuffer;
};

type TextSelectionResources = {
  source: GPUCulledTextSource;
  selectedGlyphIds: Buffer;
  selectedGlyphRecords: Buffer;
  drawCommands: DrawCommandBuffer;
};

export type GPUTraceCullingStats = {
  totalBlocks: number;
  visibleBlocks: number;
  outsideBlocks: number;
  smallBlocks: number;
  totalGlyphs: number;
  visibleGlyphs: number;
  encodeTimeMilliseconds: number;
  graphNodeCount: number;
  logicalTransientBytes: number;
  physicalTransientBytes: number;
  transientReusePercentage: number;
  labelStatus: string;
};

/** Coordinates one culling graph shared by the deck block and Arrow label layers. */
export class GPUTraceCullingEffect implements Effect {
  readonly id = 'gpu-trace-culling-effect';
  readonly props = {};
  readonly useInPicking = true;
  readonly resources: EffectResources;

  private readonly device: Device;
  private readonly count: number;
  private compiled: CompiledGPUCommandGraph<void> | null = null;
  private textSelection: TextSelectionResources | null = null;
  private textLayer: GPUCulledArrowTextLayer | null = null;
  private labelStatus = 'Waiting for label layer';
  private readonly onStats?: (stats: GPUTraceCullingStats) => void;
  private visibleBlocks = 0;
  private outsideBlocks = 0;
  private smallBlocks = 0;
  private visibleGlyphs = 0;
  private encodeTimeMilliseconds = 0;
  private frameIndex = 0;
  private statsReadPending = false;

  constructor(
    device: Device,
    data: DeckTraceData,
    options: {onStats?: (stats: GPUTraceCullingStats) => void} = {}
  ) {
    if (device.type !== 'webgpu') throw new Error('GPUTraceCullingEffect requires WebGPU');
    this.device = device;
    this.count = data.count;
    this.onStats = options.onStats;
    this.resources = {
      spans: device.createBuffer({
        id: 'deck-gpu-trace-spans',
        data: data.spans,
        usage: Buffer.STORAGE | Buffer.COPY_DST
      }),
      visibleIds: device.createBuffer({
        id: 'deck-gpu-trace-visible-ids',
        byteLength: data.count * UINT32_BYTE_LENGTH,
        usage: Buffer.STORAGE | Buffer.COPY_SRC
      }),
      rowFlags: device.createBuffer({
        id: 'deck-gpu-trace-row-flags',
        byteLength: data.count * UINT32_BYTE_LENGTH,
        usage: Buffer.STORAGE | Buffer.COPY_SRC
      }),
      cullingCounts: device.createBuffer({
        id: 'deck-gpu-trace-culling-counts',
        byteLength: UINT32_BYTE_LENGTH * 2,
        usage: Buffer.STORAGE | Buffer.COPY_DST | Buffer.COPY_SRC
      }),
      viewUniforms: device.createBuffer({
        id: 'deck-gpu-trace-view-uniforms',
        byteLength: 32,
        usage: Buffer.UNIFORM | Buffer.COPY_DST
      }),
      blockDrawCommands: new DrawCommandBuffer(device, {
        id: 'deck-gpu-trace-block-draw',
        type: 'draw',
        commands: [{vertexCount: 6, instanceCount: 0}]
      })
    };
    this.rebuildGraph();
  }

  setup(_context: EffectContext): void {}

  setTextLayer(textLayer: GPUCulledArrowTextLayer): void {
    this.textLayer = textLayer;
    this.labelStatus = 'Preparing Arrow text renderer';
    this.publishStats();
  }

  setLabelError(error: unknown): void {
    this.labelStatus = error instanceof Error ? error.message : String(error);
    this.publishStats();
  }

  preRender(opts: Parameters<Effect['preRender']>[0]): void {
    const viewport = opts.viewports[0];
    if (!viewport) return;
    const topLeft = viewport.unproject([0, 0]);
    const bottomRight = viewport.unproject([viewport.width, viewport.height]);
    const timeMinimum = Math.min(topLeft[0]!, bottomRight[0]!);
    const timeMaximum = Math.max(topLeft[0]!, bottomRight[0]!);
    const laneMinimum = Math.min(topLeft[1]!, bottomRight[1]!);
    const laneMaximum = Math.max(topLeft[1]!, bottomRight[1]!);
    this.resources.viewUniforms.write(
      new Float32Array([
        timeMinimum,
        timeMaximum,
        laneMinimum,
        laneMaximum,
        (timeMaximum - timeMinimum) / viewport.width,
        (laneMaximum - laneMinimum) / viewport.height,
        MINIMUM_BLOCK_PIXELS,
        0
      ])
    );

    const textLayer = this.textLayer;
    const preparation = textLayer?.getSelectionPreparation();
    const source = preparation?.source ?? null;
    this.labelStatus = preparation?.status ?? this.labelStatus;
    if (source && source.glyphRecords !== this.textSelection?.source.glyphRecords) {
      this.createTextSelection(source);
    }
    textLayer?.setCulledDraw(
      this.textSelection
        ? {
            selectedGlyphRecords: this.textSelection.selectedGlyphRecords,
            drawCommands: this.textSelection.drawCommands
          }
        : null
    );

    const encodeStart = performance.now();
    this.resources.cullingCounts.write(new Uint32Array(2));
    this.compiled?.encode(this.device.commandEncoder, {parameters: undefined});
    this.encodeTimeMilliseconds = performance.now() - encodeStart;
    this.frameIndex++;
    if (this.frameIndex % 30 === 0) void this.sampleStats();
  }

  cleanup(_context: EffectContext): void {
    this.compiled?.destroy();
    this.destroyTextSelection();
    this.resources.blockDrawCommands.destroy();
    this.resources.spans.destroy();
    this.resources.visibleIds.destroy();
    this.resources.rowFlags.destroy();
    this.resources.cullingCounts.destroy();
    this.resources.viewUniforms.destroy();
    this.textLayer = null;
  }

  private createTextSelection(source: GPUCulledTextSource): void {
    this.destroyTextSelection();
    const recordByteLength = source.recordWordLength * UINT32_BYTE_LENGTH;
    this.textSelection = {
      source,
      selectedGlyphIds: this.device.createBuffer({
        id: 'deck-gpu-trace-selected-glyph-ids',
        byteLength: Math.max(source.glyphCount * UINT32_BYTE_LENGTH, UINT32_BYTE_LENGTH),
        usage: Buffer.STORAGE | Buffer.COPY_SRC
      }),
      selectedGlyphRecords: this.device.createBuffer({
        id: 'deck-gpu-trace-selected-glyph-records',
        byteLength: Math.max(source.glyphCount * recordByteLength, recordByteLength),
        usage: Buffer.STORAGE | Buffer.VERTEX | Buffer.COPY_SRC
      }),
      drawCommands: new DrawCommandBuffer(this.device, {
        id: 'deck-gpu-trace-label-draw',
        type: 'draw',
        commands: [{vertexCount: 6, instanceCount: 0}]
      })
    };
    this.rebuildGraph();
  }

  private rebuildGraph(): void {
    this.compiled?.destroy();
    const graph = new GPUCommandGraph<void>(this.device, {id: 'deck-gpu-trace-graph'});
    const spans = importBuffer(graph, 'spans', this.resources.spans);
    const visibleIds = importBuffer(graph, 'visible-ids', this.resources.visibleIds);
    const rowFlags = importBuffer(graph, 'row-flags', this.resources.rowFlags);
    const cullingCounts = importBuffer(graph, 'culling-counts', this.resources.cullingCounts);
    const viewUniforms = importBuffer(graph, 'view-uniforms', this.resources.viewUniforms);
    const blockCommands = importBuffer(
      graph,
      'block-draw-commands',
      this.resources.blockDrawCommands.buffer
    );
    const sourceIdsBuffer = graph.createTransientBuffer({
      id: 'source-ids',
      byteLength: this.count * UINT32_BYTE_LENGTH,
      usage: Buffer.STORAGE
    });
    const sourceIds = graph.createDataView(sourceIdsBuffer, {
      format: 'uint32',
      length: this.count
    });
    const rowFlagView = graph.createDataView(rowFlags, {format: 'uint32', length: this.count});
    const visibleIdView = graph.createDataView(visibleIds, {
      format: 'uint32',
      length: this.count
    });
    const blockCount = graph.createDataView(blockCommands, {
      format: 'uint32',
      length: 1,
      byteOffset: this.resources.blockDrawCommands.getInstanceCountByteOffset(0)
    });

    addVisibilityPass(graph, {
      count: this.count,
      spans,
      viewUniforms,
      sourceIds,
      rowFlags: rowFlagView,
      cullingCounts
    });
    graph.add(
      new GPUCompaction({
        id: 'visible-block-compaction',
        input: sourceIds,
        flags: rowFlagView,
        output: visibleIdView,
        count: blockCount
      })
    );

    if (this.textSelection) {
      const {source, selectedGlyphIds, selectedGlyphRecords, drawCommands} = this.textSelection;
      const glyphRecords = importBuffer(graph, 'glyph-records', source.glyphRecords);
      const selectedIds = importBuffer(graph, 'selected-glyph-ids', selectedGlyphIds);
      const selectedRecords = importBuffer(graph, 'selected-glyph-records', selectedGlyphRecords);
      const textCommands = importBuffer(graph, 'text-draw-commands', drawCommands.buffer);
      const glyphRows = graph.createDataView(glyphRecords, {
        format: 'uint32',
        length: source.glyphCount,
        byteOffset: UINT32_BYTE_LENGTH * 2,
        byteStride: source.recordWordLength * UINT32_BYTE_LENGTH
      });
      graph.add(
        new GPUTextSelection({
          id: 'visible-text-selection',
          glyphRows,
          rowFlags: rowFlagView,
          output: graph.createDataView(selectedIds, {
            format: 'uint32',
            length: source.glyphCount
          }),
          count: graph.createDataView(textCommands, {
            format: 'uint32',
            length: 1,
            byteOffset: drawCommands.getInstanceCountByteOffset(0)
          }),
          sourceRecords: graph.createDataView(glyphRecords, {
            format: 'uint32',
            length: source.glyphCount * source.recordWordLength
          }),
          outputRecords: graph.createDataView(selectedRecords, {
            format: 'uint32',
            length: source.glyphCount * source.recordWordLength
          }),
          recordWordLength: source.recordWordLength
        })
      );
    }
    this.compiled = graph.compile();
    this.publishStats();
  }

  private async sampleStats(): Promise<void> {
    if (this.statsReadPending) return;
    this.statsReadPending = true;
    const textSelection = this.textSelection;
    try {
      const blockBytes = await this.resources.blockDrawCommands.buffer.readAsync(
        this.resources.blockDrawCommands.getInstanceCountByteOffset(0),
        UINT32_BYTE_LENGTH
      );
      this.visibleBlocks = new Uint32Array(blockBytes.buffer, blockBytes.byteOffset, 1)[0]!;
      const cullingCountBytes = await this.resources.cullingCounts.readAsync(
        0,
        UINT32_BYTE_LENGTH * 2
      );
      const cullingCounts = new Uint32Array(
        cullingCountBytes.buffer,
        cullingCountBytes.byteOffset,
        2
      );
      this.outsideBlocks = cullingCounts[0]!;
      this.smallBlocks = cullingCounts[1]!;
      if (textSelection) {
        const glyphBytes = await textSelection.drawCommands.buffer.readAsync(
          textSelection.drawCommands.getInstanceCountByteOffset(0),
          UINT32_BYTE_LENGTH
        );
        if (this.textSelection === textSelection) {
          this.visibleGlyphs = new Uint32Array(glyphBytes.buffer, glyphBytes.byteOffset, 1)[0]!;
        }
      }
      this.publishStats();
    } finally {
      this.statsReadPending = false;
    }
  }

  private publishStats(): void {
    const graphStats = this.compiled?.stats;
    this.onStats?.({
      totalBlocks: this.count,
      visibleBlocks: this.visibleBlocks,
      outsideBlocks: this.outsideBlocks,
      smallBlocks: this.smallBlocks,
      totalGlyphs: this.textSelection?.source.glyphCount ?? 0,
      visibleGlyphs: this.visibleGlyphs,
      encodeTimeMilliseconds: this.encodeTimeMilliseconds,
      graphNodeCount: graphStats?.nodeOrder.length ?? 0,
      logicalTransientBytes: graphStats?.logicalTransientBytes ?? 0,
      physicalTransientBytes: graphStats?.physicalTransientBytes ?? 0,
      transientReusePercentage: graphStats?.reusePercentage ?? 0,
      labelStatus: this.labelStatus
    });
  }

  private destroyTextSelection(): void {
    if (!this.textSelection) return;
    this.textSelection.selectedGlyphIds.destroy();
    this.textSelection.selectedGlyphRecords.destroy();
    this.textSelection.drawCommands.destroy();
    this.textSelection = null;
  }
}

function importBuffer<Parameters>(graph: GPUCommandGraph<Parameters>, id: string, buffer: Buffer) {
  return graph.importBuffer({id, byteLength: buffer.byteLength, usage: buffer.usage}, buffer);
}

function addVisibilityPass(
  graph: GPUCommandGraph<void>,
  props: {
    count: number;
    spans: ReturnType<typeof importBuffer>;
    viewUniforms: ReturnType<typeof importBuffer>;
    sourceIds: ReturnType<GPUCommandGraph<void>['createDataView']>;
    rowFlags: ReturnType<GPUCommandGraph<void>['createDataView']>;
    cullingCounts: ReturnType<typeof importBuffer>;
  }
): void {
  const source = /* wgsl */ `
struct TraceSpan { start: f32, duration: f32, lane: u32, group: u32 };
struct ViewUniforms {
  timeMin: f32,
  timeMax: f32,
  laneMin: f32,
  laneMax: f32,
  timeUnitsPerPixel: f32,
  laneUnitsPerPixel: f32,
  minimumBlockPixels: f32,
  padding: f32
};
struct CullingCounts { outside: atomic<u32>, tooSmall: atomic<u32> };
const SPAN_COUNT: u32 = ${props.count}u;
@group(0) @binding(0) var<storage, read> spans: array<TraceSpan>;
@group(0) @binding(1) var<uniform> viewUniforms: ViewUniforms;
@group(0) @binding(2) var<storage, read_write> sourceIds: array<u32>;
@group(0) @binding(3) var<storage, read_write> rowFlags: array<u32>;
@group(0) @binding(4) var<storage, read_write> cullingCounts: CullingCounts;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let rowIndex = globalId.x;
  if (rowIndex >= SPAN_COUNT) { return; }
  let span = spans[rowIndex];
  let timeVisible = span.start + span.duration >= viewUniforms.timeMin &&
    span.start <= viewUniforms.timeMax;
  let lane = f32(span.lane);
  let laneVisible = lane + 1.0 >= viewUniforms.laneMin && lane <= viewUniforms.laneMax;
  let largeEnough = span.duration >=
      viewUniforms.timeUnitsPerPixel * viewUniforms.minimumBlockPixels &&
    1.0 >= viewUniforms.laneUnitsPerPixel * viewUniforms.minimumBlockPixels;
  let insideView = timeVisible && laneVisible;
  if (!insideView) {
    atomicAdd(&cullingCounts.outside, 1u);
  } else if (!largeEnough) {
    atomicAdd(&cullingCounts.tooSmall, 1u);
  }
  sourceIds[rowIndex] = rowIndex;
  rowFlags[rowIndex] = select(0u, 1u, insideView && largeEnough);
}`;
  graph.addComputePass({
    id: 'trace-visibility',
    resources: [
      {buffer: props.spans, usage: 'storage-read'},
      {buffer: props.viewUniforms, usage: 'uniform'},
      {buffer: props.sourceIds, usage: 'storage-write'},
      {buffer: props.rowFlags, usage: 'storage-write'},
      {buffer: props.cullingCounts, usage: 'storage-write'}
    ],
    compile: ({device}) => {
      const computation = new Computation(device, {
        id: 'trace-visibility',
        source,
        shaderLayout: {
          bindings: [
            {name: 'spans', type: 'storage', group: 0, location: 0},
            {name: 'viewUniforms', type: 'uniform', group: 0, location: 1},
            {name: 'sourceIds', type: 'storage', group: 0, location: 2},
            {name: 'rowFlags', type: 'storage', group: 0, location: 3},
            {name: 'cullingCounts', type: 'storage', group: 0, location: 4}
          ]
        }
      });
      return {
        encode: ({computePass, getBuffer}) => {
          computation.setBindings({
            spans: getBuffer(props.spans),
            viewUniforms: getBuffer(props.viewUniforms),
            sourceIds: getBuffer(props.sourceIds),
            rowFlags: getBuffer(props.rowFlags),
            cullingCounts: getBuffer(props.cullingCounts)
          });
          computation.dispatch(computePass, Math.ceil(props.count / 256));
        },
        destroy: () => computation.destroy()
      };
    }
  });
}
