// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  GPU_TRACE_LINK_RECORD_WORD_LENGTH,
  GPU_TRACE_SPAN_RECORD_WORD_LENGTH
} from '@luma.gl/experimental/gpu-trace';

/** Reference duration for the smallest interactive demonstration. */
export const TRACE_DURATION = 1000;
export const TRACE_BASE_SPAN_CAPACITY = 250_000;
export const TRACE_GROUPS = ['compute', 'network', 'storage'] as const;
export const TRACE_PROCESS_COUNT = 16;
export const TRACE_THREADS_PER_PROCESS = 4;
export const TRACE_LANES_PER_THREAD = 4;
export const TRACE_THREAD_COUNT = TRACE_PROCESS_COUNT * TRACE_THREADS_PER_PROCESS;
export const TRACE_LANE_COUNT = TRACE_THREAD_COUNT * TRACE_LANES_PER_THREAD;
/** Empty display rows retained after every visible thread to separate thread groups. */
export const TRACE_THREAD_GAP_LANE_COUNT = 1;
/** Additional empty display rows inserted between process groups. */
export const TRACE_PROCESS_GAP_LANE_COUNT = 2;
/** Fixed density/output capacity for the fully expanded hierarchy including visual gaps. */
export const TRACE_DISPLAY_LANE_CAPACITY =
  TRACE_LANE_COUNT +
  TRACE_THREAD_COUNT * TRACE_THREAD_GAP_LANE_COUNT +
  (TRACE_PROCESS_COUNT - 1) * TRACE_PROCESS_GAP_LANE_COUNT;
export const TRACE_SPAN_RECORD_WORD_LENGTH = GPU_TRACE_SPAN_RECORD_WORD_LENGTH;
export const TRACE_DEPENDENCY_RECORD_WORD_LENGTH = GPU_TRACE_LINK_RECORD_WORD_LENGTH;
export const TRACE_SPAN_BATCH_RECORD_WORD_LENGTH = 9;
export const TRACE_TEMPORAL_INDEX_RECORD_WORD_LENGTH = 8;
export const TRACE_TEMPORAL_INDEX_FANOUT = 4;
export const TRACE_TEMPORAL_INDEX_MAXIMUM_BATCH_COUNT = 256;
export const TRACE_TEMPORAL_INDEX_TARGET_PIXEL_WIDTH = 48;
export const TRACE_DEPENDENCY_BATCH_RECORD_WORD_LENGTH = 6;
// One span batch maps to one portable WebGPU workgroup for candidate-driven local compaction.
export const TRACE_SPAN_BATCH_CAPACITY = 256;
/** Keeps each chunk comfortably below portable storage-binding and allocation ceilings. */
export const TRACE_SPAN_CHUNK_TARGET_BYTE_LENGTH = 64 * 1024 * 1024;
// One dependency batch maps to one portable WebGPU workgroup for candidate-driven compaction.
export const TRACE_DEPENDENCY_BATCH_CAPACITY = 128;
/** Maximum dependency batches admitted to expensive visibility and endpoint work per frame. */
export const TRACE_DEPENDENCY_FRAME_BATCH_BUDGET = 4096;
/** Default number of viewport-intersecting dependency lines retained for display. */
export const TRACE_DEPENDENCY_DISPLAY_BUDGET = 2048;
/** User-selectable dependency display budgets, from sparse overview to dense inspection. */
export const TRACE_DEPENDENCY_DISPLAY_BUDGET_OPTIONS = [512, 2048, 8192] as const;
/** Overview views retain this fraction of the selected maximum dependency density. */
export const TRACE_DEPENDENCY_OVERVIEW_DENSITY_FRACTION = 1 / 32;
/** Reaching this zoom ratio admits the selected maximum dependency density. */
export const TRACE_DEPENDENCY_FULL_DENSITY_ZOOM = 32;
/** Keeps dependency records below the same conservative storage-binding target as spans. */
export const TRACE_DEPENDENCY_CHUNK_TARGET_BYTE_LENGTH = 64 * 1024 * 1024;
/** Keeps sparse adjacency topology and neighbor bindings independently bounded. */
export const TRACE_ADJACENCY_CHUNK_TARGET_BYTE_LENGTH = 64 * 1024 * 1024;
/** Bounds each compact focus frontier while reporting discoveries that exceed the allocation. */
export const TRACE_FOCUS_FRONTIER_MAXIMUM_CAPACITY = 1_048_576;
const TRACE_DEMONSTRATION_CAPACITIES = [250_000, 1_000_000, 4_000_000, 10_000_000, 25_000_000];
// Keep density scrolling visually continuous at common viewport widths while retaining a fixed,
// allocation-stable aggregation target for the compiled GPU command graph.
export const TRACE_DENSITY_BIN_COUNT = 512;
/** Exact spans are fully readable below this trace-time-per-pixel scale. */
export const TRACE_DENSITY_BLEND_START_TIME_PER_PIXEL = 0.025;
/** Density bins fully replace individual spans above this trace-time-per-pixel scale. */
export const TRACE_DENSITY_BLEND_END_TIME_PER_PIXEL = 0.055;
/** Spans that remain this wide in the current view bypass density aggregation. */
export const TRACE_EXACT_SPAN_MINIMUM_PIXEL_WIDTH = 6;
export const TRACE_STATUS_COUNT = 4;
/** Small operation-name dictionary shared by every generated span label. */
export const TRACE_LABEL_DICTIONARY = [
  'kernel',
  'barrier',
  'matrix multiply',
  'kernel retry',
  'send',
  'receive wait',
  'all-reduce',
  'network error',
  'read',
  'I/O wait',
  'write',
  'I/O error'
] as const;
/** Bounded transient glyph occurrences; source strings and glyph layouts remain dictionary-shared. */
export const TRACE_LABEL_GLYPH_CAPACITY = 1_000_000;
export const TRACE_LABEL_GLYPH_RECORD_WORD_LENGTH = 6;
/** Screen-space label size shared by dictionary measurement and span-local placement. */
export const TRACE_LABEL_FONT_SIZE = 16;
export const TRACE_SAME_PROCESS_DEPENDENCY = 0;
export const TRACE_CROSS_PROCESS_DEPENDENCY = 1;
export const TRACE_PARENT_DEPENDENCY_FLAG = 1;
export const TRACE_DEPENDENCY_PROCESS_MASK = 0xff;
export const TRACE_DEPENDENCY_SOURCE_PROCESS_SHIFT = 8;
export const TRACE_DEPENDENCY_DESTINATION_PROCESS_SHIFT = 16;
export const TRACE_RUNTIME_SPAN_FLAG = 1 << 8;
export const TRACE_ERROR_SPAN_FLAG = 1 << 9;
export const TRACE_OVERLAPPING_CHILD_FLAG = 1 << 10;
export const TRACE_SIMILAR_DURATION_PARENT_FLAG = 1 << 11;
/** Active filtering policy bits uploaded independently from immutable source span flags. */
export const TRACE_FILTER_HIDE_RUNTIME_SPANS = 1 << 0;
export const TRACE_FILTER_ERRORS_ONLY = 1 << 1;
export const TRACE_FILTER_HIDE_OVERLAPPING_CHILDREN = 1 << 2;
export const TRACE_FILTER_HIDE_SIMILAR_DURATION_PARENTS = 1 << 3;
export const TRACE_MAXIMUM_OVERLAPPING_CHILD_DURATION = 1;
export const TRACE_MAXIMUM_RELATIVE_PARENT_DURATION_DELTA = 0.25;
export const TRACE_COLLAPSED_STATE = 0;
export const TRACE_EXPANDED_STATE = 1;
export const TRACE_INVALID_SPAN_INDEX = 0xffffffff;

const TRACE_BASE_SLOT_COUNT = Math.ceil(TRACE_BASE_SPAN_CAPACITY / TRACE_LANE_COUNT);
const TRACE_SLOT_DURATION = TRACE_DURATION / TRACE_BASE_SLOT_COUNT;
const TRACE_LANE_ROTATION = 73;
const TRACE_DURATION_SCALE = 0.9;
const TRACE_GROUP_PHASE_SLOT_COUNT = 24;
const TRACE_GROUP_PHASE_CYCLE_LENGTH = 8;
const TRACE_FOCUSED_GROUP_PHASE_COUNT = 6;
const TRACE_MAXIMUM_DURATION_SLOT_COUNT = 30;
const TRACE_EXTRA_WIDE_SPAN_INTERVAL = 4093;
const TRACE_EXTRA_WIDE_SPAN_MINIMUM_SLOT_COUNT = 120;
const TRACE_EXTRA_WIDE_SPAN_SLOT_COUNT_RANGE = 180;
/** Largest useful minimum-duration filter value for the generated span distribution. */
export const TRACE_DURATION_FILTER_MAXIMUM =
  Math.floor(TRACE_MAXIMUM_DURATION_SLOT_COUNT * TRACE_DURATION_SCALE * TRACE_SLOT_DURATION * 100) /
  100;

/** Scales the timeline so larger datasets add time instead of adding pixel overdraw. */
export function getTraceDuration(spanCount: number): number {
  if (!Number.isSafeInteger(spanCount) || spanCount < 0 || spanCount > 0xffffffff) {
    throw new RangeError('Trace span count must be a nonnegative uint32');
  }
  return Math.max(Math.ceil(spanCount / TRACE_LANE_COUNT), 1) * TRACE_SLOT_DURATION;
}

/** Returns useful demonstration sizes when one portable span batch fits in a storage chunk. */
export function getTraceCapacityOptions(
  maxStorageBufferBindingSize: number,
  maxBufferSize: number
): number[] {
  const spanRecordByteLength = TRACE_SPAN_RECORD_WORD_LENGTH * Uint32Array.BYTES_PER_ELEMENT;
  const maximumChunkSpanCount = Math.floor(
    Math.min(maxStorageBufferBindingSize, maxBufferSize, TRACE_SPAN_CHUNK_TARGET_BYTE_LENGTH) /
      spanRecordByteLength
  );
  return maximumChunkSpanCount >= TRACE_SPAN_BATCH_CAPACITY
    ? [...TRACE_DEMONSTRATION_CAPACITIES]
    : TRACE_DEMONSTRATION_CAPACITIES.filter(capacity => capacity <= maximumChunkSpanCount);
}

/** Returns useful dependency limits that fit in one dependency storage-buffer binding. */
export function getTraceDependencyCapacityOptions(
  maxStorageBufferBindingSize: number,
  maxBufferSize: number
): number[] {
  const dependencyRecordByteLength =
    TRACE_DEPENDENCY_RECORD_WORD_LENGTH * Uint32Array.BYTES_PER_ELEMENT;
  const maximumChunkDependencyCount = Math.floor(
    Math.min(
      maxStorageBufferBindingSize,
      maxBufferSize,
      TRACE_DEPENDENCY_CHUNK_TARGET_BYTE_LENGTH
    ) / dependencyRecordByteLength
  );
  return maximumChunkDependencyCount >= TRACE_DEPENDENCY_BATCH_CAPACITY
    ? [0, ...TRACE_DEMONSTRATION_CAPACITIES]
    : [
        0,
        ...TRACE_DEMONSTRATION_CAPACITIES.filter(
          capacity => capacity <= maximumChunkDependencyCount
        )
      ];
}

/** Upper bound for the example's generated dependency topology. */
export function getMaximumGeneratedTraceDependencyCount(spanCount: number): number {
  return spanCount > 1 ? spanCount : 0;
}

/**
 * Returns the maximum number of unique spans that one dependency traversal can discover.
 *
 * Every reached span after the seed requires at least one dependency, so sparse traces do not
 * need span-sized frontier allocations. One word is retained for an empty trace because WebGPU
 * buffers cannot be empty.
 */
export function getTraceFocusFrontierCapacity(
  spanCount: number,
  dependencyCount: number,
  maximumCapacity = TRACE_FOCUS_FRONTIER_MAXIMUM_CAPACITY
): number {
  return Math.max(Math.min(spanCount, dependencyCount + 1, maximumCapacity), 1);
}

/** Matches the GPU's exact-span versus density-rendering blend. */
export function getTraceDensityBlend(
  timeMin: number,
  timeMax: number,
  viewportWidth: number,
  smoothTransition = true
): number {
  const timePerPixel = (timeMax - timeMin) / Math.max(viewportWidth, 1);
  const blendRange =
    TRACE_DENSITY_BLEND_END_TIME_PER_PIXEL - TRACE_DENSITY_BLEND_START_TIME_PER_PIXEL;
  const linearBlend = Math.max(
    0,
    Math.min(1, (timePerPixel - TRACE_DENSITY_BLEND_START_TIME_PER_PIXEL) / blendRange)
  );
  const smoothBlend = linearBlend * linearBlend * (3 - 2 * linearBlend);
  return smoothTransition ? smoothBlend : Number(smoothBlend >= 0.5);
}

/** User-selected policy for the trace overview representation. */
export type TraceOverviewMode = 'auto' | 'density' | 'representative';

/** Effective representation dispatched for the current trace-time scale. */
export type TraceOverviewRenderer = 'exact' | 'density' | 'representative';

/** User-selected dependency routing policy for semantic zoom. */
export type TraceDependencyRouting = 'auto' | 'exact' | 'bundled';

/** Resolves the requested overview policy to the renderer active at this zoom. */
export function getTraceOverviewRenderer(
  timeMin: number,
  timeMax: number,
  viewportWidth: number,
  overviewMode: TraceOverviewMode,
  smoothTransition = true
): TraceOverviewRenderer {
  const densityBlend = getTraceDensityBlend(timeMin, timeMax, viewportWidth, smoothTransition);
  if (densityBlend <= 0) {
    return 'exact';
  }
  if (overviewMode === 'density') {
    return 'density';
  }
  const timePerPixel = (timeMax - timeMin) / Math.max(viewportWidth, 1);
  return overviewMode === 'representative' ||
    timePerPixel < TRACE_DENSITY_BLEND_END_TIME_PER_PIXEL * 4
    ? 'representative'
    : 'density';
}

/** Resolves whether visible dependencies should share quantized screen-space corridors. */
export function isTraceDependencyBundlingEnabled(
  timeMin: number,
  timeMax: number,
  viewportWidth: number,
  routing: TraceDependencyRouting
): boolean {
  if (routing === 'exact') {
    return false;
  }
  if (routing === 'bundled') {
    return true;
  }
  const timePerPixel = (timeMax - timeMin) / Math.max(viewportWidth, 1);
  // Start sharing corridors before the span LOD handoff. A few thousand straight edges can
  // already obscure otherwise exact spans at this scale; the closest detail views remain exact.
  return timePerPixel >= TRACE_DENSITY_BLEND_START_TIME_PER_PIXEL * 0.1;
}

/**
 * Returns a perceptually smooth dependency-line budget for the current zoom.
 *
 * Equal multiplicative zoom steps advance equally through the ramp. The maximum budget remains a
 * user-selected density ceiling rather than a fixed amount of work dispatched at every scale.
 */
export function getTraceDependencyDisplayBudget(
  maximumBudget: number,
  timeMin: number,
  timeMax: number,
  traceDuration: number
): number {
  if (maximumBudget <= 0) {
    return 0;
  }
  const visibleDuration = Math.max(timeMax - timeMin, Number.EPSILON);
  const zoomRatio = Math.max(traceDuration / visibleDuration, 1);
  const linearProgress = Math.max(
    0,
    Math.min(1, Math.log2(zoomRatio) / Math.log2(TRACE_DEPENDENCY_FULL_DENSITY_ZOOM))
  );
  const smoothProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);
  const densityFraction =
    TRACE_DEPENDENCY_OVERVIEW_DENSITY_FRACTION +
    (1 - TRACE_DEPENDENCY_OVERVIEW_DENSITY_FRACTION) * smoothProgress;
  return Math.min(maximumBudget, Math.max(1, Math.round(maximumBudget * densityFraction)));
}

/** Reports the dominant LOD while both renderers overlap through the transition band. */
export function isTraceDensityMode(
  timeMin: number,
  timeMax: number,
  viewportWidth: number
): boolean {
  return getTraceDensityBlend(timeMin, timeMax, viewportWidth) >= 0.5;
}

/** Returns scroll-stable, absolute trace-time bins for the current zoom level. */
export function getTraceDensityBinParameters(
  timeMin: number,
  timeMax: number
): {origin: number; duration: number} {
  const timeRange = Math.max(timeMax - timeMin, Number.EPSILON);
  // Reserve one bin on each side so the anchored range covers the viewport at every alignment.
  const targetDuration = timeRange / (TRACE_DENSITY_BIN_COUNT - 2);
  const duration = 2 ** Math.ceil(Math.log2(targetDuration));
  const origin = Math.floor(timeMin / duration) * duration - duration;
  return Object.freeze({origin, duration});
}

export type TraceGroupName = (typeof TRACE_GROUPS)[number];

/** Stable source range for one indirect trace-span draw group. */
export type TraceGroupData = {
  name: TraceGroupName;
  groupIndex: number;
  count: number;
  firstSpanIndex: number;
  /** Borrowed source-aligned view into the canonical span allocation. */
  data: Uint32Array;
};

/** Stable source partition and coarse bounds used for GPU candidate-batch selection. */
export type TraceSpanBatchData = {
  batchIndex: number;
  groupIndex: number;
  name: TraceGroupName;
  count: number;
  firstSpanIndex: number;
  timeMin: number;
  timeMax: number;
  laneMin: number;
  laneMax: number;
  maximumDuration: number;
  /** Borrowed source-aligned view into the canonical span allocation. */
  data: Uint32Array;
};

/** One source-ordered hierarchy level over contiguous span-batch ranges. */
export type TraceTemporalIndexLevelData = {
  firstNodeIndex: number;
  nodeCount: number;
  maximumBatchCount: number;
  averageTimeSpan: number;
};

/** Packed persistent hierarchy summaries uploaded once with a trace dataset. */
export type TraceTemporalIndexData = {
  data: Uint32Array;
  levels: TraceTemporalIndexLevelData[];
  partitionBatchCount: number;
  partitionCount: number;
};

/** Borrowed contiguous span rows grouped on complete candidate-batch boundaries. */
export type TraceSpanChunkData = {
  chunkIndex: number;
  firstSpanIndex: number;
  spanCount: number;
  firstBatchIndex: number;
  batchCount: number;
  data: Uint32Array;
};

/** Borrowed contiguous dependency rows grouped on complete candidate-batch boundaries. */
export type TraceDependencyChunkData = {
  chunkIndex: number;
  firstDependencyIndex: number;
  dependencyCount: number;
  firstBatchIndex: number;
  batchCount: number;
  data: Uint32Array;
};

/** Stable dependency range with a conservative endpoint and ancestor time envelope. */
export type TraceDependencyBatchData = {
  batchIndex: number;
  count: number;
  firstDependencyIndex: number;
  timeMin: number;
  timeMax: number;
  familyMask: number;
};

/** Compact forward or reverse adjacency containing rows only for nodes that own edges. */
export type TraceAdjacencyData = {
  /** Sorted stable global span IDs for rows that own at least one edge. */
  nodes: Uint32Array;
  /** One stable offset per sparse row plus the final edge count. */
  offsets: Uint32Array;
  /** Stable destination span indices in source edge order. */
  neighbors: Uint32Array;
};

/** One independently bindable sparse adjacency partition with local CSR offsets. */
export type TraceAdjacencyChunkData = {
  chunkIndex: number;
  firstNodeIndex: number;
  nodeCount: number;
  firstNeighborIndex: number;
  neighborCount: number;
  /** Packed global node IDs followed by partition-local CSR offsets. */
  topology: Uint32Array;
  /** Borrowed consecutive neighbor rows from the canonical adjacency. */
  neighbors: Uint32Array;
};

/** Worst-case storage for both sparse adjacency directions at a dependency capacity. */
export function getMaximumTraceAdjacencyByteLength(dependencyCount: number): number {
  const maximumWordCount = dependencyCount * 6 + 2;
  return maximumWordCount * Uint32Array.BYTES_PER_ELEMENT;
}

/** Partitions sparse CSR rows so neither the topology nor neighbor binding exceeds a byte limit. */
export function makeTraceAdjacencyChunks(
  adjacency: TraceAdjacencyData,
  maximumChunkByteLength = TRACE_ADJACENCY_CHUNK_TARGET_BYTE_LENGTH
): TraceAdjacencyChunkData[] {
  if (!Number.isSafeInteger(maximumChunkByteLength) || maximumChunkByteLength < 1) {
    throw new RangeError('Trace adjacency chunk byte length must be a positive safe integer');
  }
  if (adjacency.nodes.length === 0) {
    return [];
  }
  const maximumWordCount = Math.floor(maximumChunkByteLength / Uint32Array.BYTES_PER_ELEMENT);
  const chunks: TraceAdjacencyChunkData[] = [];
  let firstNodeIndex = 0;
  while (firstNodeIndex < adjacency.nodes.length) {
    const firstNeighborIndex = adjacency.offsets[firstNodeIndex];
    let lastNodeIndex = firstNodeIndex;
    while (lastNodeIndex < adjacency.nodes.length) {
      const nodeCount = lastNodeIndex - firstNodeIndex + 1;
      const neighborCount = adjacency.offsets[lastNodeIndex + 1] - firstNeighborIndex;
      if (nodeCount * 2 + 1 > maximumWordCount || neighborCount > maximumWordCount) {
        break;
      }
      lastNodeIndex++;
    }
    if (lastNodeIndex === firstNodeIndex) {
      throw new RangeError('Trace adjacency row exceeds the requested chunk byte length');
    }
    const nodeCount = lastNodeIndex - firstNodeIndex;
    const lastNeighborIndex = adjacency.offsets[lastNodeIndex];
    const neighborCount = lastNeighborIndex - firstNeighborIndex;
    const topology = new Uint32Array(nodeCount * 2 + 1);
    topology.set(adjacency.nodes.subarray(firstNodeIndex, lastNodeIndex));
    for (let localNodeIndex = 0; localNodeIndex <= nodeCount; localNodeIndex++) {
      topology[nodeCount + localNodeIndex] =
        adjacency.offsets[firstNodeIndex + localNodeIndex] - firstNeighborIndex;
    }
    chunks.push({
      chunkIndex: chunks.length,
      firstNodeIndex,
      nodeCount,
      firstNeighborIndex,
      neighborCount,
      topology,
      neighbors: adjacency.neighbors.subarray(firstNeighborIndex, lastNeighborIndex)
    });
    firstNodeIndex = lastNodeIndex;
  }
  return chunks;
}

/** GPU-upload-ready trace source data and hierarchy-preserving graph topology. */
export type TraceDatasetData = {
  /** One canonical 32-byte record per span. */
  spans: Uint32Array;
  /** Original stable group ranges into the canonical span allocation. */
  groups: TraceGroupData[];
  /** Group-aligned source partitions small enough for independent GPU processing. */
  spanBatches: TraceSpanBatchData[];
  /** Packed batch first/count, temporal bounds, lane bounds, group, and stable batch ID records. */
  spanBatchIndex: Uint32Array;
  /** Persistent multi-level temporal summaries over canonical span batches. */
  temporalIndex: TraceTemporalIndexData;
  /** Packed 16-byte dependency source, destination, family, and endpoint metadata records. */
  dependencies: Uint32Array;
  /** Stable dependency partitions small enough for one GPU workgroup. */
  dependencyBatches: TraceDependencyBatchData[];
  /** Borrowed chunk views that keep complete dependency batches below binding limits. */
  dependencyChunks: TraceDependencyChunkData[];
  /** Packed dependency first/count, conservative time bounds, family mask, and batch ID. */
  dependencyBatchIndex: Uint32Array;
  /** One cross-process-prioritized canonical parent or invalid sentinel per span. */
  parentSpans: Uint32Array;
  /** Forward source-to-destination CSR adjacency. */
  outgoing: TraceAdjacencyData;
  /** Reverse destination-to-source CSR adjacency. */
  incoming: TraceAdjacencyData;
  /** Total generated timeline extent. */
  duration: number;
  spanCount: number;
  dependencyCount: number;
  processCount: number;
  threadCount: number;
};

export type TraceDatasetGenerationPhase =
  | 'spans'
  | 'dependencies'
  | 'indexes'
  | 'adjacency'
  | 'complete';

/** Lists each unique owned allocation so a worker can transfer a dataset without copying it. */
export function getTraceDatasetTransferables(dataset: TraceDatasetData): ArrayBuffer[] {
  const getOwnedBuffer = (array: Uint32Array): ArrayBuffer => {
    const buffer = array.buffer;
    // Generated datasets always own ordinary transferable ArrayBuffers.
    if (!(buffer instanceof ArrayBuffer)) {
      throw new TypeError();
    }
    return buffer;
  };
  return [
    getOwnedBuffer(dataset.spans),
    getOwnedBuffer(dataset.spanBatchIndex),
    getOwnedBuffer(dataset.temporalIndex.data),
    getOwnedBuffer(dataset.dependencies),
    getOwnedBuffer(dataset.dependencyBatchIndex),
    getOwnedBuffer(dataset.parentSpans),
    getOwnedBuffer(dataset.outgoing.nodes),
    getOwnedBuffer(dataset.outgoing.offsets),
    getOwnedBuffer(dataset.outgoing.neighbors),
    getOwnedBuffer(dataset.incoming.nodes),
    getOwnedBuffer(dataset.incoming.offsets),
    getOwnedBuffer(dataset.incoming.neighbors)
  ];
}

/**
 * Creates deterministic, storage-ready hierarchical spans and dependency adjacency.
 *
 * Source identity is the canonical span row index. Groups borrow contiguous views of that same
 * source allocation rather than creating independently numbered records.
 */
export function makeTraceDataset(
  totalSpanCount: number,
  maximumDependencyCount = 0xffffffff,
  onProgress?: (phase: TraceDatasetGenerationPhase) => void
): TraceDatasetData {
  if (!Number.isSafeInteger(totalSpanCount) || totalSpanCount < 0 || totalSpanCount > 0xffffffff) {
    throw new RangeError('Trace span count must be a nonnegative uint32');
  }
  if (
    !Number.isSafeInteger(maximumDependencyCount) ||
    maximumDependencyCount < 0 ||
    maximumDependencyCount > 0xffffffff
  ) {
    throw new RangeError('Trace dependency count must be a nonnegative uint32');
  }

  const spans = new Uint32Array(totalSpanCount * TRACE_SPAN_RECORD_WORD_LENGTH);
  const spanFloats = new Float32Array(spans.buffer);
  const groups: TraceGroupData[] = [];
  const baseGroupSpanCount = Math.floor(totalSpanCount / TRACE_GROUPS.length);
  const extraGroupSpanCount = totalSpanCount % TRACE_GROUPS.length;
  let firstSpanIndex = 0;

  for (const [groupIndex, name] of TRACE_GROUPS.entries()) {
    const count = baseGroupSpanCount + Number(groupIndex < extraGroupSpanCount);
    groups.push({
      name,
      groupIndex,
      count,
      firstSpanIndex,
      data: spans.subarray(
        firstSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH,
        (firstSpanIndex + count) * TRACE_SPAN_RECORD_WORD_LENGTH
      )
    });
    firstSpanIndex += count;
  }

  const generatedDuration = fillTraceSpans(spans, spanFloats, groups, totalSpanCount);
  onProgress?.('spans');

  const topology = makeTraceDependencies(spans, totalSpanCount, maximumDependencyCount);
  onProgress?.('dependencies');
  const dependencyCount = topology.dependencies.length / TRACE_DEPENDENCY_RECORD_WORD_LENGTH;
  const {spanBatches, spanBatchIndex} = makeTraceSpanBatches(spans, groups);
  const temporalIndex = makeTraceTemporalIndexTopology(spanBatches);
  const outgoingCursors = new Uint32Array(totalSpanCount);
  const incomingCursors = new Uint32Array(totalSpanCount);
  const {dependencyBatches, dependencyBatchIndex} = makeTraceDependencyBatchesWithScratch(
    spans,
    topology.dependencies,
    topology.parentSpans,
    TRACE_DEPENDENCY_BATCH_CAPACITY,
    new Float32Array(outgoingCursors.buffer),
    new Float32Array(incomingCursors.buffer)
  );
  onProgress?.('indexes');
  const dependencyChunks = makeTraceDependencyChunks(
    topology.dependencies,
    dependencyBatches,
    TRACE_DEPENDENCY_CHUNK_TARGET_BYTE_LENGTH
  );
  const adjacency = buildTraceAdjacencies(
    topology.dependencies,
    totalSpanCount,
    outgoingCursors,
    incomingCursors
  );
  onProgress?.('adjacency');
  const dataset = {
    spans,
    groups,
    spanBatches,
    spanBatchIndex,
    temporalIndex,
    dependencies: topology.dependencies,
    dependencyBatches,
    dependencyChunks,
    dependencyBatchIndex,
    parentSpans: topology.parentSpans,
    outgoing: adjacency.outgoing,
    incoming: adjacency.incoming,
    duration: Math.max(getTraceDuration(totalSpanCount), generatedDuration),
    spanCount: totalSpanCount,
    dependencyCount,
    processCount: TRACE_PROCESS_COUNT,
    threadCount: TRACE_THREAD_COUNT
  };
  onProgress?.('complete');
  return dataset;
}

/** Drops source-array references after their staged GPU uploads have completed. */
export function releaseTraceDatasetStorage(dataset: TraceDatasetData): void {
  const empty = new Uint32Array(0);
  dataset.spans = empty;
  dataset.spanBatchIndex = empty;
  dataset.temporalIndex.data = empty;
  dataset.dependencies = empty;
  dataset.dependencyBatchIndex = empty;
  dataset.parentSpans = empty;
  dataset.outgoing = {nodes: empty, offsets: empty, neighbors: empty};
  dataset.incoming = {nodes: empty, offsets: empty, neighbors: empty};
  for (const group of dataset.groups) group.data = empty;
  for (const batch of dataset.spanBatches) batch.data = empty;
  for (const chunk of dataset.dependencyChunks) chunk.data = empty;
}

/**
 * Partitions canonical dependencies and publishes conservative time bounds for GPU selection.
 *
 * Each endpoint contributes its full ancestor envelope. This keeps selection conservative when a
 * filtered endpoint is projected to a visible ancestor or a collapsed process uses the source row.
 */
export function makeTraceDependencyBatches(
  spans: Uint32Array,
  dependencies: Uint32Array,
  parentSpans: Uint32Array,
  batchCapacity = TRACE_DEPENDENCY_BATCH_CAPACITY
): {
  dependencyBatches: TraceDependencyBatchData[];
  dependencyBatchIndex: Uint32Array;
} {
  const spanCount = spans.length / TRACE_SPAN_RECORD_WORD_LENGTH;
  return makeTraceDependencyBatchesWithScratch(
    spans,
    dependencies,
    parentSpans,
    batchCapacity,
    new Float32Array(spanCount),
    new Float32Array(spanCount)
  );
}

/** Builds dependency bounds into caller-owned scratch that can subsequently become CSR cursors. */
function makeTraceDependencyBatchesWithScratch(
  spans: Uint32Array,
  dependencies: Uint32Array,
  parentSpans: Uint32Array,
  batchCapacity: number,
  envelopeTimeMin: Float32Array,
  envelopeTimeMax: Float32Array
): {
  dependencyBatches: TraceDependencyBatchData[];
  dependencyBatchIndex: Uint32Array;
} {
  if (!Number.isSafeInteger(batchCapacity) || batchCapacity < 1) {
    throw new RangeError('Trace dependency batch capacity must be a positive safe integer');
  }
  const spanCount = spans.length / TRACE_SPAN_RECORD_WORD_LENGTH;
  const dependencyCount = dependencies.length / TRACE_DEPENDENCY_RECORD_WORD_LENGTH;
  const spanFloats = new Float32Array(spans.buffer, spans.byteOffset, spans.length);
  if (envelopeTimeMin.length < spanCount || envelopeTimeMax.length < spanCount) {
    throw new RangeError('Trace dependency scratch storage is smaller than the span count');
  }
  for (let spanIndex = 0; spanIndex < spanCount; spanIndex++) {
    const wordOffset = spanIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
    const start = spanFloats[wordOffset];
    const end = start + spanFloats[wordOffset + 1];
    const parentSpanIndex = parentSpans[spanIndex];
    envelopeTimeMin[spanIndex] =
      parentSpanIndex === TRACE_INVALID_SPAN_INDEX
        ? start
        : Math.min(start, envelopeTimeMin[parentSpanIndex]);
    envelopeTimeMax[spanIndex] =
      parentSpanIndex === TRACE_INVALID_SPAN_INDEX
        ? end
        : Math.max(end, envelopeTimeMax[parentSpanIndex]);
  }

  const dependencyBatches: TraceDependencyBatchData[] = [];
  for (
    let firstDependencyIndex = 0;
    firstDependencyIndex < dependencyCount;
    firstDependencyIndex += batchCapacity
  ) {
    const count = Math.min(batchCapacity, dependencyCount - firstDependencyIndex);
    let timeMin = Number.POSITIVE_INFINITY;
    let timeMax = Number.NEGATIVE_INFINITY;
    let familyMask = 0;
    for (let rowIndex = 0; rowIndex < count; rowIndex++) {
      const wordOffset = (firstDependencyIndex + rowIndex) * TRACE_DEPENDENCY_RECORD_WORD_LENGTH;
      const sourceSpanIndex = dependencies[wordOffset];
      const destinationSpanIndex = dependencies[wordOffset + 1];
      timeMin = Math.min(
        timeMin,
        envelopeTimeMin[sourceSpanIndex],
        envelopeTimeMin[destinationSpanIndex]
      );
      timeMax = Math.max(
        timeMax,
        envelopeTimeMax[sourceSpanIndex],
        envelopeTimeMax[destinationSpanIndex]
      );
      familyMask |= 1 << dependencies[wordOffset + 2];
    }
    dependencyBatches.push({
      batchIndex: dependencyBatches.length,
      count,
      firstDependencyIndex,
      timeMin,
      timeMax,
      familyMask
    });
  }

  const dependencyBatchIndex = new Uint32Array(
    dependencyBatches.length * TRACE_DEPENDENCY_BATCH_RECORD_WORD_LENGTH
  );
  const dependencyBatchIndexFloats = new Float32Array(dependencyBatchIndex.buffer);
  for (const batch of dependencyBatches) {
    const wordOffset = batch.batchIndex * TRACE_DEPENDENCY_BATCH_RECORD_WORD_LENGTH;
    dependencyBatchIndex[wordOffset] = batch.firstDependencyIndex;
    dependencyBatchIndex[wordOffset + 1] = batch.count;
    dependencyBatchIndexFloats[wordOffset + 2] = batch.timeMin;
    dependencyBatchIndexFloats[wordOffset + 3] = batch.timeMax;
    dependencyBatchIndex[wordOffset + 4] = batch.familyMask;
    dependencyBatchIndex[wordOffset + 5] = batch.batchIndex;
  }
  return {dependencyBatches, dependencyBatchIndex};
}

/** Partitions canonical group ranges and builds coarse GPU-readable batch bounds. */
export function makeTraceSpanBatches(
  spans: Uint32Array,
  groups: readonly TraceGroupData[],
  batchCapacity = TRACE_SPAN_BATCH_CAPACITY
): {spanBatches: TraceSpanBatchData[]; spanBatchIndex: Uint32Array} {
  if (!Number.isSafeInteger(batchCapacity) || batchCapacity < 1) {
    throw new RangeError('Trace span batch capacity must be a positive safe integer');
  }
  const spanFloats = new Float32Array(spans.buffer, spans.byteOffset, spans.length);
  const spanBatches: TraceSpanBatchData[] = [];

  for (const group of groups) {
    for (let groupOffset = 0; groupOffset < group.count; groupOffset += batchCapacity) {
      const count = Math.min(batchCapacity, group.count - groupOffset);
      const firstSpanIndex = group.firstSpanIndex + groupOffset;
      let timeMin = Number.POSITIVE_INFINITY;
      let timeMax = Number.NEGATIVE_INFINITY;
      let laneMin = TRACE_LANE_COUNT;
      let laneMax = 0;
      let maximumDuration = 0;
      for (let rowIndex = 0; rowIndex < count; rowIndex++) {
        const wordOffset = (firstSpanIndex + rowIndex) * TRACE_SPAN_RECORD_WORD_LENGTH;
        const start = spanFloats[wordOffset];
        const duration = spanFloats[wordOffset + 1];
        const end = start + duration;
        const lane = spans[wordOffset + 2];
        timeMin = Math.min(timeMin, start);
        timeMax = Math.max(timeMax, end);
        laneMin = Math.min(laneMin, lane);
        laneMax = Math.max(laneMax, lane + 1);
        maximumDuration = Math.max(maximumDuration, duration);
      }
      spanBatches.push({
        batchIndex: spanBatches.length,
        groupIndex: group.groupIndex,
        name: group.name,
        count,
        firstSpanIndex,
        timeMin,
        timeMax,
        laneMin,
        laneMax,
        maximumDuration,
        data: spans.subarray(
          firstSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH,
          (firstSpanIndex + count) * TRACE_SPAN_RECORD_WORD_LENGTH
        )
      });
    }
  }

  const spanBatchIndex = new Uint32Array(spanBatches.length * TRACE_SPAN_BATCH_RECORD_WORD_LENGTH);
  const spanBatchIndexFloats = new Float32Array(spanBatchIndex.buffer);
  for (const batch of spanBatches) {
    const wordOffset = batch.batchIndex * TRACE_SPAN_BATCH_RECORD_WORD_LENGTH;
    spanBatchIndex[wordOffset] = batch.firstSpanIndex;
    spanBatchIndex[wordOffset + 1] = batch.count;
    spanBatchIndexFloats[wordOffset + 2] = batch.timeMin;
    spanBatchIndexFloats[wordOffset + 3] = batch.timeMax;
    spanBatchIndex[wordOffset + 4] = batch.laneMin;
    spanBatchIndex[wordOffset + 5] = batch.laneMax;
    spanBatchIndex[wordOffset + 6] = batch.groupIndex;
    spanBatchIndex[wordOffset + 7] = batch.batchIndex;
    spanBatchIndexFloats[wordOffset + 8] = batch.maximumDuration;
  }
  return {spanBatches, spanBatchIndex};
}

/** Builds compact source-ordered temporal summaries without touching canonical span rows. */
export function makeTraceTemporalIndex(
  spanBatches: readonly TraceSpanBatchData[],
  fanout = TRACE_TEMPORAL_INDEX_FANOUT,
  maximumBatchCount = TRACE_TEMPORAL_INDEX_MAXIMUM_BATCH_COUNT
): TraceTemporalIndexData {
  return makeTraceTemporalIndexData(spanBatches, fanout, maximumBatchCount, true);
}

/** Builds stable hierarchy topology while leaving summary fields for GPU construction. */
export function makeTraceTemporalIndexTopology(
  spanBatches: readonly TraceSpanBatchData[],
  fanout = TRACE_TEMPORAL_INDEX_FANOUT,
  maximumBatchCount = TRACE_TEMPORAL_INDEX_MAXIMUM_BATCH_COUNT
): TraceTemporalIndexData {
  return makeTraceTemporalIndexData(spanBatches, fanout, maximumBatchCount, false);
}

function makeTraceTemporalIndexData(
  spanBatches: readonly TraceSpanBatchData[],
  fanout: number,
  maximumBatchCount: number,
  includeSummaries: boolean
): TraceTemporalIndexData {
  if (!Number.isSafeInteger(fanout) || fanout < 2) {
    throw new RangeError('Trace temporal index fanout must be at least two');
  }
  if (!Number.isSafeInteger(maximumBatchCount) || maximumBatchCount < fanout) {
    throw new RangeError('Trace temporal index maximum batch count must cover one fanout');
  }
  type Node = {
    timeMin: number;
    timeMax: number;
    maximumDuration: number;
    groupIndex: number;
    firstBatchIndex: number;
    batchCount: number;
    laneMin: number;
    laneMax: number;
  };
  let sourceNodes: Node[] = spanBatches.map(batch => ({
    timeMin: Math.fround(batch.timeMin),
    timeMax: Math.fround(batch.timeMax),
    maximumDuration: Math.fround(batch.maximumDuration),
    groupIndex: batch.groupIndex,
    firstBatchIndex: batch.batchIndex,
    batchCount: 1,
    laneMin: batch.laneMin,
    laneMax: batch.laneMax
  }));
  const nodes: Node[] = [];
  const levels: TraceTemporalIndexLevelData[] = [];

  while (sourceNodes.length > 0) {
    const levelNodes: Node[] = [];
    let sourceIndex = 0;
    while (sourceIndex < sourceNodes.length) {
      const first = sourceNodes[sourceIndex];
      let nodeCount = 1;
      let batchCount = first.batchCount;
      while (sourceIndex + nodeCount < sourceNodes.length && nodeCount < fanout) {
        const candidate = sourceNodes[sourceIndex + nodeCount];
        if (
          candidate.groupIndex !== first.groupIndex ||
          Math.floor(candidate.firstBatchIndex / maximumBatchCount) !==
            Math.floor(first.firstBatchIndex / maximumBatchCount) ||
          batchCount + candidate.batchCount > maximumBatchCount
        ) {
          break;
        }
        batchCount += candidate.batchCount;
        nodeCount++;
      }
      let timeMin = first.timeMin;
      let timeMax = first.timeMax;
      let maximumDuration = first.maximumDuration;
      let laneMin = first.laneMin;
      let laneMax = first.laneMax;
      for (let childOffset = 1; childOffset < nodeCount; childOffset++) {
        const child = sourceNodes[sourceIndex + childOffset];
        timeMin = Math.min(timeMin, child.timeMin);
        timeMax = Math.max(timeMax, child.timeMax);
        maximumDuration = Math.max(maximumDuration, child.maximumDuration);
        laneMin = Math.min(laneMin, child.laneMin);
        laneMax = Math.max(laneMax, child.laneMax);
      }
      levelNodes.push({
        timeMin,
        timeMax,
        maximumDuration,
        groupIndex: first.groupIndex,
        firstBatchIndex: first.firstBatchIndex,
        batchCount,
        laneMin,
        laneMax
      });
      sourceIndex += nodeCount;
    }
    if (levelNodes.length >= sourceNodes.length) break;
    const firstNodeIndex = nodes.length;
    nodes.push(...levelNodes);
    levels.push({
      firstNodeIndex,
      nodeCount: levelNodes.length,
      maximumBatchCount: Math.max(...levelNodes.map(node => node.batchCount)),
      averageTimeSpan:
        levelNodes.reduce((sum, node) => sum + node.timeMax - node.timeMin, 0) / levelNodes.length
    });
    sourceNodes = levelNodes;
  }

  const data = new Uint32Array(nodes.length * TRACE_TEMPORAL_INDEX_RECORD_WORD_LENGTH);
  const floats = new Float32Array(data.buffer);
  for (const [nodeIndex, node] of nodes.entries()) {
    const wordOffset = nodeIndex * TRACE_TEMPORAL_INDEX_RECORD_WORD_LENGTH;
    floats[wordOffset] = includeSummaries ? node.timeMin : Number.POSITIVE_INFINITY;
    floats[wordOffset + 1] = includeSummaries ? node.timeMax : Number.NEGATIVE_INFINITY;
    floats[wordOffset + 2] = includeSummaries ? node.maximumDuration : 0;
    data[wordOffset + 3] = node.groupIndex;
    data[wordOffset + 4] = node.firstBatchIndex;
    data[wordOffset + 5] = node.batchCount;
    data[wordOffset + 6] = includeSummaries ? node.laneMin : 0xffffffff;
    data[wordOffset + 7] = includeSummaries ? node.laneMax : 0;
  }
  return {
    data,
    levels,
    partitionBatchCount: maximumBatchCount,
    partitionCount: Math.ceil(spanBatches.length / maximumBatchCount)
  };
}

/** Chooses the coarsest hierarchy whose mean node extent stays within a screen-space budget. */
export function getTraceTemporalIndexLevel(
  levels: readonly TraceTemporalIndexLevelData[],
  timePerPixel: number,
  targetPixelWidth = TRACE_TEMPORAL_INDEX_TARGET_PIXEL_WIDTH
): number {
  if (levels.length === 0) return 0;
  const safeTimePerPixel = Math.max(timePerPixel, Number.EPSILON);
  let selectedLevel = 0;
  for (let levelIndex = 1; levelIndex < levels.length; levelIndex++) {
    if (levels[levelIndex].averageTimeSpan / safeTimePerPixel > targetPixelWidth) break;
    selectedLevel = levelIndex;
  }
  return selectedLevel;
}

/** Splits canonical spans without repacking rows or cutting candidate batches. */
export function makeTraceSpanChunks(
  spans: Uint32Array,
  spanBatches: readonly TraceSpanBatchData[],
  maximumChunkByteLength: number
): TraceSpanChunkData[] {
  const spanRecordByteLength = TRACE_SPAN_RECORD_WORD_LENGTH * Uint32Array.BYTES_PER_ELEMENT;
  const maximumChunkSpanCount = Math.floor(maximumChunkByteLength / spanRecordByteLength);
  // Candidate shaders require every portable batch to remain wholly addressable in one chunk.
  if (maximumChunkSpanCount < TRACE_SPAN_BATCH_CAPACITY) {
    throw new RangeError();
  }
  const chunks: TraceSpanChunkData[] = [];
  let firstBatchIndex = 0;
  while (firstBatchIndex < spanBatches.length) {
    const firstBatch = spanBatches[firstBatchIndex];
    let batchCount = 0;
    let spanCount = 0;
    while (firstBatchIndex + batchCount < spanBatches.length) {
      const batch = spanBatches[firstBatchIndex + batchCount];
      if (batchCount > 0 && spanCount + batch.count > maximumChunkSpanCount) {
        break;
      }
      spanCount += batch.count;
      batchCount++;
    }
    const firstSpanIndex = firstBatch.firstSpanIndex;
    chunks.push({
      chunkIndex: chunks.length,
      firstSpanIndex,
      spanCount,
      firstBatchIndex,
      batchCount,
      data: spans.subarray(
        firstSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH,
        (firstSpanIndex + spanCount) * TRACE_SPAN_RECORD_WORD_LENGTH
      )
    });
    firstBatchIndex += batchCount;
  }
  return chunks;
}

/** Splits canonical dependencies without repacking rows or cutting candidate batches. */
export function makeTraceDependencyChunks(
  dependencies: Uint32Array,
  dependencyBatches: readonly TraceDependencyBatchData[],
  maximumChunkByteLength: number
): TraceDependencyChunkData[] {
  const dependencyRecordByteLength =
    TRACE_DEPENDENCY_RECORD_WORD_LENGTH * Uint32Array.BYTES_PER_ELEMENT;
  const maximumChunkDependencyCount = Math.floor(
    maximumChunkByteLength / dependencyRecordByteLength
  );
  if (maximumChunkDependencyCount < TRACE_DEPENDENCY_BATCH_CAPACITY) {
    throw new RangeError();
  }
  const chunks: TraceDependencyChunkData[] = [];
  let firstBatchIndex = 0;
  while (firstBatchIndex < dependencyBatches.length) {
    const firstBatch = dependencyBatches[firstBatchIndex];
    let batchCount = 0;
    let dependencyCount = 0;
    while (firstBatchIndex + batchCount < dependencyBatches.length) {
      const batch = dependencyBatches[firstBatchIndex + batchCount];
      if (batchCount > 0 && dependencyCount + batch.count > maximumChunkDependencyCount) {
        break;
      }
      dependencyCount += batch.count;
      batchCount++;
    }
    const firstDependencyIndex = firstBatch.firstDependencyIndex;
    chunks.push({
      chunkIndex: chunks.length,
      firstDependencyIndex,
      dependencyCount,
      firstBatchIndex,
      batchCount,
      data: dependencies.subarray(
        firstDependencyIndex * TRACE_DEPENDENCY_RECORD_WORD_LENGTH,
        (firstDependencyIndex + dependencyCount) * TRACE_DEPENDENCY_RECORD_WORD_LENGTH
      )
    });
    firstBatchIndex += batchCount;
  }
  return chunks;
}

/** Re-bases packed dependency ranges so one source chunk can be processed independently. */
export function makeTraceDependencyChunkBatchIndex(
  dependencyBatchIndex: Uint32Array,
  chunk: TraceDependencyChunkData
): Uint32Array {
  const firstWordOffset = chunk.firstBatchIndex * TRACE_DEPENDENCY_BATCH_RECORD_WORD_LENGTH;
  const localBatchIndex = dependencyBatchIndex.slice(
    firstWordOffset,
    firstWordOffset + chunk.batchCount * TRACE_DEPENDENCY_BATCH_RECORD_WORD_LENGTH
  );
  for (let batchIndex = 0; batchIndex < chunk.batchCount; batchIndex++) {
    const wordOffset = batchIndex * TRACE_DEPENDENCY_BATCH_RECORD_WORD_LENGTH;
    localBatchIndex[wordOffset] -= chunk.firstDependencyIndex;
    localBatchIndex[wordOffset + 5] = batchIndex;
  }
  return localBatchIndex;
}

/** Maintains the original example API while retaining canonical source references. */
export function makeTraceGroups(totalSpanCount: number): TraceGroupData[] {
  return makeTraceDataset(totalSpanCount).groups;
}

/** Fills stable group ranges with a deterministic, tightly packed heavy-tailed duration mix. */
function fillTraceSpans(
  spans: Uint32Array,
  spanFloats: Float32Array,
  groups: readonly TraceGroupData[],
  spanCount: number
): number {
  let randomState = 0x9e3779b9;
  const random = (): number => {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return (randomState >>> 0) / 0x100000000;
  };
  const nextStartByLane = new Float64Array(TRACE_LANE_COUNT);
  const groupRowCounts = new Uint32Array(groups.length);
  let maximumEnd = 0;

  for (let timelineIndex = 0; timelineIndex < spanCount; timelineIndex++) {
    const slotIndex = Math.floor(timelineIndex / TRACE_LANE_COUNT);
    const laneIndex = (timelineIndex + slotIndex * TRACE_LANE_ROTATION) % TRACE_LANE_COUNT;
    const threadIndex = Math.floor(laneIndex / TRACE_LANES_PER_THREAD);
    const processIndex = Math.floor(threadIndex / TRACE_THREADS_PER_PROCESS);
    const phaseIndex = Math.floor(slotIndex / TRACE_GROUP_PHASE_SLOT_COUNT);
    const localLaneIndex = laneIndex % TRACE_LANES_PER_THREAD;
    const focusedGroupIndex = (processIndex + localLaneIndex) % groups.length;
    const phaseCycleIndex = phaseIndex % TRACE_GROUP_PHASE_CYCLE_LENGTH;
    const preferredGroupIndex =
      phaseCycleIndex < TRACE_FOCUSED_GROUP_PHASE_COUNT
        ? focusedGroupIndex
        : (focusedGroupIndex + phaseCycleIndex - TRACE_FOCUSED_GROUP_PHASE_COUNT + 1) %
          groups.length;
    let groupIndex = preferredGroupIndex;
    for (let groupOffset = 0; groupOffset < groups.length; groupOffset++) {
      const candidateGroupIndex = (preferredGroupIndex + groupOffset) % groups.length;
      if (groupRowCounts[candidateGroupIndex] < groups[candidateGroupIndex].count) {
        groupIndex = candidateGroupIndex;
        break;
      }
    }
    const groupRowIndex = groupRowCounts[groupIndex]++;
    const spanIndex = groups[groupIndex].firstSpanIndex + groupRowIndex;
    const wordOffset = spanIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
    const gap = (0.02 + random() * 0.04) * TRACE_SLOT_DURATION;
    const durationClass = random();
    const durationVariation = random();
    const extraWideSpan = (timelineIndex + 1) % TRACE_EXTRA_WIDE_SPAN_INTERVAL === 0;
    const durationSlotCount = extraWideSpan
      ? TRACE_EXTRA_WIDE_SPAN_MINIMUM_SLOT_COUNT +
        durationVariation * TRACE_EXTRA_WIDE_SPAN_SLOT_COUNT_RANGE
      : durationClass < 0.58
        ? 0.04 + durationVariation * 0.21
        : durationClass < 0.89
          ? 0.35 + durationVariation * 0.85
          : durationClass < 0.98
            ? 1.5 + durationVariation * 4
            : 10 + durationVariation * 20;
    const start = nextStartByLane[laneIndex] + gap;
    const duration = durationSlotCount * TRACE_DURATION_SCALE * TRACE_SLOT_DURATION;
    const end = start + duration;
    nextStartByLane[laneIndex] = end;
    maximumEnd = Math.max(maximumEnd, end);
    const status = Math.floor(random() * TRACE_STATUS_COUNT);
    const runtimeFlag = spanIndex % 11 === 0 ? TRACE_RUNTIME_SPAN_FLAG : 0;
    const errorFlag = spanIndex % 37 === 0 ? TRACE_ERROR_SPAN_FLAG : 0;
    spanFloats[wordOffset] = start;
    spanFloats[wordOffset + 1] = duration;
    spans[wordOffset + 2] = laneIndex;
    spans[wordOffset + 3] = groupIndex;
    spans[wordOffset + 4] = processIndex;
    spans[wordOffset + 5] = threadIndex;
    spans[wordOffset + 6] = spanIndex;
    spans[wordOffset + 7] = status | runtimeFlag | errorFlag;
  }
  return maximumEnd;
}

/** Generates sparse same-thread parent chains and cross-process dependency edges. */
function makeTraceDependencies(
  spans: Uint32Array,
  spanCount: number,
  requestedMaximumDependencyCount: number
): {dependencies: Uint32Array; parentSpans: Uint32Array} {
  const generatedMaximumDependencyCount = getMaximumGeneratedTraceDependencyCount(spanCount);
  const maximumDependencyCount = Math.min(
    requestedMaximumDependencyCount,
    generatedMaximumDependencyCount
  );
  const data = new Uint32Array(maximumDependencyCount * TRACE_DEPENDENCY_RECORD_WORD_LENGTH);
  const spanFloats = new Float32Array(spans.buffer, spans.byteOffset, spans.length);
  const previousSpanByThread = new Uint32Array(TRACE_THREAD_COUNT);
  previousSpanByThread.fill(TRACE_INVALID_SPAN_INDEX);
  const parentSpans = new Uint32Array(spanCount);
  parentSpans.fill(TRACE_INVALID_SPAN_INDEX);
  let dependencyCount = 0;

  for (let spanIndex = 0; spanIndex < spanCount; spanIndex++) {
    const wordOffset = spanIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
    const threadIndex = spans[wordOffset + 5];
    const previousSpan = previousSpanByThread[threadIndex];
    if (
      dependencyCount < maximumDependencyCount &&
      spanIndex % 5 === 0 &&
      previousSpan !== TRACE_INVALID_SPAN_INDEX
    ) {
      writeTraceDependency(
        data,
        spans,
        dependencyCount++,
        previousSpan,
        spanIndex,
        TRACE_SAME_PROCESS_DEPENDENCY
      );
      parentSpans[spanIndex] = previousSpan;
      annotateTraceParentTopology(spans, spanFloats, previousSpan, spanIndex);
    }
    if (dependencyCount < maximumDependencyCount && spanIndex > 7 && spanIndex % 29 === 0) {
      const processIndex = spans[wordOffset + 4];
      let sourceIndex = spanIndex - 7;
      while (
        sourceIndex > 0 &&
        spans[sourceIndex * TRACE_SPAN_RECORD_WORD_LENGTH + 4] === processIndex
      ) {
        sourceIndex--;
      }
      if (spans[sourceIndex * TRACE_SPAN_RECORD_WORD_LENGTH + 4] !== processIndex) {
        writeTraceDependency(
          data,
          spans,
          dependencyCount++,
          sourceIndex,
          spanIndex,
          TRACE_CROSS_PROCESS_DEPENDENCY
        );
        parentSpans[spanIndex] = sourceIndex;
      }
    }
    previousSpanByThread[threadIndex] = spanIndex;
  }

  // Fill the requested dense demonstration capacity with deterministic causal-looking edges.
  // The initial sparse pass above still owns hierarchy parents; these additional links provide
  // realistic high-edge-count stress without changing parent projection semantics.
  for (
    let edgeOrdinal = 0;
    dependencyCount < maximumDependencyCount;
    edgeOrdinal++, dependencyCount++
  ) {
    const destinationSpanIndex = 1 + ((edgeOrdinal * 73) % (spanCount - 1));
    const maximumDistance = Math.min(destinationSpanIndex, TRACE_LANE_COUNT * 2);
    const distance = 1 + ((edgeOrdinal * 17) % maximumDistance);
    let sourceSpanIndex = destinationSpanIndex - distance;
    const destinationWordOffset = destinationSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
    let sourceWordOffset = sourceSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
    while (
      sourceSpanIndex > 0 &&
      spans[sourceWordOffset + 4] === spans[destinationWordOffset + 4] &&
      spans[sourceWordOffset + 5] !== spans[destinationWordOffset + 5]
    ) {
      sourceSpanIndex--;
      sourceWordOffset -= TRACE_SPAN_RECORD_WORD_LENGTH;
    }
    const family =
      spans[sourceWordOffset + 5] === spans[destinationWordOffset + 5]
        ? TRACE_SAME_PROCESS_DEPENDENCY
        : TRACE_CROSS_PROCESS_DEPENDENCY;
    writeTraceDependency(
      data,
      spans,
      dependencyCount,
      sourceSpanIndex,
      destinationSpanIndex,
      family
    );
  }

  return {
    dependencies: data.subarray(0, dependencyCount * TRACE_DEPENDENCY_RECORD_WORD_LENGTH),
    parentSpans
  };
}

/** Preclassifies source-to-child overlap and comparable parent durations at ingestion time. */
function annotateTraceParentTopology(
  spans: Uint32Array,
  spanFloats: Float32Array,
  parentSpanIndex: number,
  childSpanIndex: number
): void {
  const parentWordOffset = parentSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
  const childWordOffset = childSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH;
  const parentStart = spanFloats[parentWordOffset];
  const parentDuration = spanFloats[parentWordOffset + 1];
  const childStart = spanFloats[childWordOffset];
  const childDuration = spanFloats[childWordOffset + 1];
  if (
    childDuration <= TRACE_MAXIMUM_OVERLAPPING_CHILD_DURATION &&
    childStart >= parentStart &&
    childStart + childDuration <= parentStart + parentDuration
  ) {
    spans[childWordOffset + 7] |= TRACE_OVERLAPPING_CHILD_FLAG;
  }
  if (
    Math.abs(parentDuration - childDuration) <=
    Math.max(parentDuration, childDuration) * TRACE_MAXIMUM_RELATIVE_PARENT_DURATION_DELTA
  ) {
    spans[parentWordOffset + 7] |= TRACE_SIMILAR_DURATION_PARENT_FLAG;
  }
}

/** Writes one fixed-width dependency without allocating intermediate edge objects. */
function writeTraceDependency(
  dependencies: Uint32Array,
  spans: Uint32Array,
  dependencyIndex: number,
  sourceSpanIndex: number,
  destinationSpanIndex: number,
  family: number
): void {
  const wordOffset = dependencyIndex * TRACE_DEPENDENCY_RECORD_WORD_LENGTH;
  dependencies[wordOffset] = sourceSpanIndex;
  dependencies[wordOffset + 1] = destinationSpanIndex;
  dependencies[wordOffset + 2] = family;
  const sourceProcessIndex = spans[sourceSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH + 4];
  const destinationProcessIndex = spans[destinationSpanIndex * TRACE_SPAN_RECORD_WORD_LENGTH + 4];
  dependencies[wordOffset + 3] =
    TRACE_PARENT_DEPENDENCY_FLAG |
    (sourceProcessIndex << TRACE_DEPENDENCY_SOURCE_PROCESS_SHIFT) |
    (destinationProcessIndex << TRACE_DEPENDENCY_DESTINATION_PROCESS_SHIFT);
}

/** Builds both stable CSR directions with dense typed-array counters over canonical span IDs. */
function buildTraceAdjacencies(
  dependencies: Uint32Array,
  spanCount: number,
  outgoingCursors = new Uint32Array(spanCount),
  incomingCursors = new Uint32Array(spanCount)
): {outgoing: TraceAdjacencyData; incoming: TraceAdjacencyData} {
  const edgeCount = dependencies.length / TRACE_DEPENDENCY_RECORD_WORD_LENGTH;
  if (outgoingCursors.length < spanCount || incomingCursors.length < spanCount) {
    throw new RangeError('Trace adjacency scratch storage is smaller than the span count');
  }
  outgoingCursors.fill(0);
  incomingCursors.fill(0);
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const wordOffset = edgeIndex * TRACE_DEPENDENCY_RECORD_WORD_LENGTH;
    outgoingCursors[dependencies[wordOffset]]++;
    incomingCursors[dependencies[wordOffset + 1]]++;
  }
  const outgoing = makeTraceAdjacencyFromCounts(outgoingCursors, edgeCount);
  const incoming = makeTraceAdjacencyFromCounts(incomingCursors, edgeCount);
  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const wordOffset = edgeIndex * TRACE_DEPENDENCY_RECORD_WORD_LENGTH;
    const source = dependencies[wordOffset];
    const destination = dependencies[wordOffset + 1];
    outgoing.neighbors[outgoingCursors[source]++] = destination;
    incoming.neighbors[incomingCursors[destination]++] = source;
  }
  return {outgoing, incoming};
}

/** Converts dense per-span counts into sparse ordered rows and in-place neighbor write cursors. */
function makeTraceAdjacencyFromCounts(cursors: Uint32Array, edgeCount: number): TraceAdjacencyData {
  let nodeCount = 0;
  for (const count of cursors) {
    nodeCount += Number(count > 0);
  }
  const nodes = new Uint32Array(nodeCount);
  const offsets = new Uint32Array(nodeCount + 1);
  const neighbors = new Uint32Array(edgeCount);
  let rowIndex = 0;
  let edgeOffset = 0;
  for (let nodeIndex = 0; nodeIndex < cursors.length; nodeIndex++) {
    const count = cursors[nodeIndex];
    if (count === 0) continue;
    nodes[rowIndex] = nodeIndex;
    offsets[rowIndex] = edgeOffset;
    cursors[nodeIndex] = edgeOffset;
    edgeOffset += count;
    rowIndex++;
  }
  offsets[nodeCount] = edgeOffset;
  return {nodes, offsets, neighbors};
}
