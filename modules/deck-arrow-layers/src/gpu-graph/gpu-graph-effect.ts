// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Effect, EffectContext} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {GPUCommandGraph, type CompiledGPUCommandGraph} from '@luma.gl/gpgpu/gpu-core';
import {
  GPUGraph,
  GPUGraphBreadthFirstSearch,
  GPUGraphConnectedComponents,
  GPUGraphDegree,
  GPUGraphForceLayout,
  GPUGraphLabelPropagation,
  GPUGraphPageRank,
  GPUGraphSpatialForceLayout,
  GPUGraphTopology,
  type GPUGraphAdjacency
} from '@luma.gl/gpgpu/gpu-graph';
import {GPUData, GPUVector} from '@luma.gl/gpgpu/gpu-data';
/** Caller-owned graph input preserving original edge partitions and vertex allocations. */
export type GPUGraphDeckDataset = {
  /** Number of stable zero-based graph vertices. */
  vertexCount: number;
  /** Original directed source-edge batches, including any empty partitions. */
  sourceChunks: Uint32Array[];
  /** Original target-edge batches aligned with the source partitions. */
  targetChunks: Uint32Array[];
  /** Initial directly renderable two-component positions in source-vertex order. */
  positions: Float32Array;
  /** Initial progressive two-component velocities in source-vertex order. */
  velocities: Float32Array;
};

const SCALAR_BYTE_LENGTH = 4;
const MAXIMUM_NEIGHBORHOOD_DEPTH = 8;
const DEFAULT_NEIGHBORHOOD_DEPTH = 2;
const GPU_GRAPH_DECK_MAXIMUM_EXACT_VERTEX_COUNT = 512;
const GPU_GRAPH_DECK_LINEAR_LAYOUT_VERTEX_COUNT = 16_384;
const GPU_GRAPH_DECK_POINT_VERTEX_COUNT = 65_536;
const GPU_GRAPH_DECK_MAX_VISIBLE_EDGES = 65_536;
const GPU_GRAPH_DECK_SPATIAL_BOUNDS = [-2, -2, 2, 2] as const;
const SPATIAL_DRAG_MARGIN = 0.1;

type ScalarFormat = 'uint32' | 'float32';

/** Selects exact forces, a flat spatial grid, or a caller-provided sampled layout. */
export type GPUGraphDeckLayoutMode = 'auto' | 'exact' | 'spatial' | 'sampled';

/** Immediately available encoding, memory, and frame measurements; no graph data is read. */
export type GPUGraphDeckEffectStats = {
  vertexCount: number;
  edgeCount: number;
  renderedVertexCount: number;
  renderedEdgeCount: number;
  frameCount: number;
  layoutMode: 'exact' | 'spatial' | 'sampled';
  renderMode: 'circles' | 'points';
  gridCellCount: number;
  residentBufferBytes: number;
  transientBufferBytes: number;
  spatialIndexBytes: number;
  analysisNodeCount: number;
  frameNodeCount: number;
  analysisEncodeMilliseconds: number;
  frameEncodeMilliseconds: number;
  framesPerSecond: number;
  completedAnalysisStages: number;
  totalAnalysisStages: number;
  pageRankIterations: number;
  componentIterations: number;
  communityIterations: number;
};

/** Optional bounded layout selection and CPU-only diagnostic callback. */
export type GPUGraphDeckEffectOptions = {
  layoutMode?: GPUGraphDeckLayoutMode;
  pointMode?: boolean;
  maxVisibleEdges?: number;
  onStats?: (stats: GPUGraphDeckEffectStats) => void;
  /** Adds an explicitly provided O(E + 4V) contributor without importing application code. */
  addSampledLayoutToGraph?: (
    commandGraph: GPUCommandGraph<void>,
    layout: GPUGraphForceLayout
  ) => void;
};

/**
 * Declares resident GPU Graph analytics and progressive layout inside deck.gl's own render encoder.
 *
 * Construction compiles persistent graphs but never submits commands or reads a buffer. Original
 * source edge batches, including their empty middle partition, remain directly available to Deck
 * edge layers. The first ordinary frame encodes topology, PageRank, and weak components once;
 * every ordinary frame then encodes bounded neighborhood search and force integration.
 */
export class GPUGraphDeckEffect implements Effect {
  readonly id = 'gpu-graph-deck-effect';
  readonly props = {};
  readonly useInPicking = false;
  readonly device: Device;
  readonly dataset: GPUGraphDeckDataset;
  readonly graph: GPUGraph;
  readonly topology: GPUGraphTopology;
  readonly degree: GPUGraphDegree;
  readonly pageRank: GPUGraphPageRank;
  readonly components: GPUGraphConnectedComponents;
  readonly communities: GPUGraphLabelPropagation;
  readonly search: GPUGraphBreadthFirstSearch;
  readonly layout: GPUGraphForceLayout;
  readonly spatialLayout?: GPUGraphSpatialForceLayout;
  readonly activeLayoutMode: 'exact' | 'spatial' | 'sampled';
  readonly renderMode: 'circles' | 'points';
  readonly renderedVertexCount: number;
  readonly renderedEdgeCount: number;
  readonly analysisGraph: CompiledGPUCommandGraph<void>;
  readonly searchGraph?: CompiledGPUCommandGraph<void>;
  readonly frameGraph: CompiledGPUCommandGraph<void>;

  private readonly buffers: Buffer[] = [];
  private readonly vectors: GPUVector[] = [];
  private readonly seeds: GPUVector<'uint32'>;
  private readonly seedCount: GPUVector<'uint32'>;
  private readonly activeDepth: GPUVector<'uint32'>;
  private readonly pinned: GPUVector<'uint32'>;
  private readonly reset: GPUVector<'uint32'>;
  private readonly pinnedVertices = new Set<number>();
  private readonly onStats?: (stats: GPUGraphDeckEffectStats) => void;
  private readonly analysisStages: CompiledGPUCommandGraph<void>[];
  private selectedVertex: number | null = 0;
  private neighborhoodDepth = DEFAULT_NEIGHBORHOOD_DEPTH;
  private completedAnalysisStages = 0;
  private searchPending = true;
  private frameCount = 0;
  private previousFrameTime = 0;
  private analysisEncodeMilliseconds = 0;
  private smoothedFramesPerSecond = 0;
  private destroyed = false;

  constructor(
    device: Device,
    dataset: GPUGraphDeckDataset,
    options: GPUGraphDeckEffectOptions = {}
  ) {
    if (device.type !== 'webgpu') throw new Error('GPUGraphDeckEffect requires WebGPU');
    this.device = device;
    this.dataset = dataset;
    this.onStats = options.onStats;
    const edgeCount = dataset.sourceChunks.reduce((total, chunk) => total + chunk.length, 0);
    const largestBufferBytes = Math.max(dataset.vertexCount * 8, edgeCount * SCALAR_BYTE_LENGTH);
    if (
      largestBufferBytes > device.limits.maxStorageBufferBindingSize ||
      largestBufferBytes > device.limits.maxBufferSize
    ) {
      throw new Error('Graph population exceeds the current WebGPU adapter buffer limits');
    }
    const massiveGraph = dataset.vertexCount >= GPU_GRAPH_DECK_LINEAR_LAYOUT_VERTEX_COUNT;
    this.activeLayoutMode =
      options.layoutMode === 'sampled' || massiveGraph
        ? 'sampled'
        : options.layoutMode === 'spatial' ||
            dataset.vertexCount > GPU_GRAPH_DECK_MAXIMUM_EXACT_VERTEX_COUNT
          ? 'spatial'
          : 'exact';
    if (this.activeLayoutMode === 'sampled' && !options.addSampledLayoutToGraph) {
      throw new Error('Sampled graph layout requires a caller-provided GPU contributor');
    }
    this.renderMode =
      (options.pointMode ?? dataset.vertexCount >= GPU_GRAPH_DECK_POINT_VERTEX_COUNT)
        ? 'points'
        : 'circles';
    this.renderedVertexCount = dataset.vertexCount;
    const visibleEdgeCapacity = Math.max(
      0,
      Math.floor(options.maxVisibleEdges ?? GPU_GRAPH_DECK_MAX_VISIBLE_EDGES)
    );

    this.graph = new GPUGraph({
      vertexCount: dataset.vertexCount,
      directed: true,
      sourceVertices: this.createChunkedVector('source-vertices', dataset.sourceChunks),
      targetVertices: this.createChunkedVector('target-vertices', dataset.targetChunks)
    });
    this.renderedEdgeCount = Math.min(this.graph.edgeCount, visibleEdgeCapacity);
    this.topology = new GPUGraphTopology({
      id: 'gpu-graph-deck-topology',
      graph: this.graph,
      forward: this.createAdjacency('forward', dataset.vertexCount, this.graph.edgeCount),
      reverse: this.createAdjacency('reverse', dataset.vertexCount, this.graph.edgeCount),
      invalidEdgeCount: this.createScalarVector('invalid-edges', 'uint32', 1)
    });
    this.degree = new GPUGraphDegree({
      id: 'gpu-graph-deck-degree',
      topology: this.topology,
      output: this.createScalarVector('degrees', 'uint32', dataset.vertexCount)
    });
    this.pageRank = new GPUGraphPageRank({
      id: 'gpu-graph-deck-page-rank',
      topology: this.topology,
      output: this.createScalarVector('importance', 'float32', dataset.vertexCount),
      iterations: massiveGraph ? 2 : 12
    });
    this.components = new GPUGraphConnectedComponents({
      id: 'gpu-graph-deck-components',
      topology: this.topology,
      output: this.createScalarVector('components', 'uint32', dataset.vertexCount),
      iterations: massiveGraph ? 2 : 16
    });
    this.communities = new GPUGraphLabelPropagation({
      id: 'gpu-graph-deck-communities',
      topology: this.topology,
      output: this.createScalarVector('communities', 'uint32', dataset.vertexCount),
      iterations: massiveGraph ? 2 : 8
    });

    this.seeds = this.createScalarVector('seeds', 'uint32', 1, Uint32Array.of(0));
    this.seedCount = this.createScalarVector('seed-count', 'uint32', 1, Uint32Array.of(1));
    this.activeDepth = this.createScalarVector(
      'active-depth',
      'uint32',
      1,
      Uint32Array.of(DEFAULT_NEIGHBORHOOD_DEPTH)
    );
    this.search = new GPUGraphBreadthFirstSearch({
      id: 'gpu-graph-deck-neighborhood',
      topology: this.topology,
      seeds: this.seeds,
      seedCount: this.seedCount,
      distances: this.createScalarVector('distances', 'uint32', dataset.vertexCount),
      predecessors: this.createScalarVector('predecessors', 'uint32', dataset.vertexCount),
      mask: this.createScalarVector('selection-mask', 'uint32', dataset.vertexCount),
      maxDepth: MAXIMUM_NEIGHBORHOOD_DEPTH,
      activeDepth: this.activeDepth,
      direction: 'both'
    });

    this.pinned = this.createScalarVector('pinned', 'uint32', dataset.vertexCount);
    this.reset = this.createScalarVector('reset', 'uint32', 1, Uint32Array.of(0));
    this.layout = new GPUGraphForceLayout({
      id: 'gpu-graph-deck-force-layout',
      topology: this.topology,
      positions: this.createCoordinateVector('positions', dataset.positions, Buffer.VERTEX),
      velocities: this.createCoordinateVector('velocities', dataset.velocities),
      pinned: this.pinned,
      reset: this.reset,
      seed: 0x1a2b3c4d,
      iterationsPerFrame: this.activeLayoutMode === 'exact' ? 2 : 1,
      // Four sampled repulsion evaluations remain constant-cost as population grows; applying
      // the exact all-pairs 1/V normalization would collapse every million-row cloud to a dot.
      repulsion:
        this.activeLayoutMode === 'sampled'
          ? 0.0015
          : 0.005 * Math.min(1, 128 / dataset.vertexCount),
      attraction: this.activeLayoutMode === 'sampled' ? 0.04 : 0.045,
      gravity: this.activeLayoutMode === 'sampled' ? 0.005 : 0.025,
      damping: this.activeLayoutMode === 'sampled' ? 0.9 : 0.85,
      maxVelocity:
        this.activeLayoutMode === 'sampled'
          ? 0.02
          : this.activeLayoutMode === 'spatial'
            ? 0.025
            : 0.045
    });
    if (this.activeLayoutMode === 'spatial') {
      const gridSize = getGPUGraphDeckGridSize(dataset.vertexCount);
      const cellCount = gridSize[0] * gridSize[1];
      this.spatialLayout = new GPUGraphSpatialForceLayout({
        id: 'gpu-graph-deck-spatial-layout',
        layout: this.layout,
        gridSize,
        bounds: GPU_GRAPH_DECK_SPATIAL_BOUNDS,
        theta: 0.65,
        nearCellRadius: 1,
        cellOffsets: this.createScalarVector('spatial-cell-offsets', 'uint32', cellCount + 1),
        vertexIds: this.createScalarVector('spatial-vertex-ids', 'uint32', dataset.vertexCount),
        cellCenters: this.createCoordinateVector(
          'spatial-cell-centers',
          new Float32Array(cellCount * 2)
        ),
        count: this.createScalarVector('spatial-count', 'uint32', 1),
        overflow: this.createScalarVector('spatial-overflow', 'uint32', 1)
      });
    }

    const analysis = new GPUCommandGraph<void>(device, {id: 'gpu-graph-deck-analysis'});
    this.topology.addToGraph(analysis);
    this.degree.addToGraph(analysis);
    if (!massiveGraph) {
      this.components.addToGraph(analysis);
      this.communities.addToGraph(analysis);
      this.pageRank.addToGraph(analysis);
    }
    this.analysisGraph = analysis.compile();
    this.analysisStages = [this.analysisGraph];
    if (massiveGraph) {
      for (const [name, contributor] of [
        ['components', this.components],
        ['communities', this.communities],
        ['page-rank', this.pageRank]
      ] as const) {
        const stage = new GPUCommandGraph<void>(device, {id: `gpu-graph-deck-${name}-analysis`});
        contributor.addToGraph(stage);
        this.analysisStages.push(stage.compile());
      }
    }

    const frame = new GPUCommandGraph<void>(device, {id: 'gpu-graph-deck-frame'});
    if (this.activeLayoutMode === 'sampled') {
      const search = new GPUCommandGraph<void>(device, {id: 'gpu-graph-deck-selection'});
      this.search.addToGraph(search);
      this.searchGraph = search.compile();
      options.addSampledLayoutToGraph!(frame, this.layout);
    } else {
      this.search.addToGraph(frame);
      if (this.spatialLayout) this.spatialLayout.addToGraph(frame);
      else this.layout.addToGraph(frame);
    }
    this.frameGraph = frame.compile();
  }

  /** Supplies the exact progressive allocation also bound as a Deck instance vertex attribute. */
  get positions(): Buffer {
    return this.getVectorBuffer(this.layout.positions);
  }

  get importance(): Buffer {
    return this.getVectorBuffer(this.pageRank.output);
  }

  get componentLabels(): Buffer {
    return this.getVectorBuffer(this.components.output);
  }

  get communityLabels(): Buffer {
    return this.getVectorBuffer(this.communities.output);
  }

  get degreeValues(): Buffer {
    return this.getVectorBuffer(this.degree.output);
  }

  get distances(): Buffer {
    return this.getVectorBuffer(this.search.distances);
  }

  get selectionMask(): Buffer {
    return this.getVectorBuffer(this.search.mask!);
  }

  get currentSelection(): number | null {
    return this.selectedVertex;
  }

  get currentNeighborhoodDepth(): number {
    return this.neighborhoodDepth;
  }

  setup(_context: EffectContext): void {}

  /** Appends compute to Deck's current frame; Deck remains the sole queue submission owner. */
  preRender(options: Parameters<Effect['preRender']>[0]): void {
    if (this.destroyed || !options.viewports[0]) return;
    let advancedAnalysis = false;
    if (this.completedAnalysisStages < this.analysisStages.length) {
      const stage = this.analysisStages[this.completedAnalysisStages];
      const encoding = stage.encode(this.device.commandEncoder, {
        parameters: undefined
      });
      this.analysisEncodeMilliseconds += encoding.stats.cpuEncodeTimeMilliseconds;
      this.completedAnalysisStages++;
      advancedAnalysis = true;
    }
    if (this.searchGraph && this.searchPending && this.completedAnalysisStages > 0) {
      this.searchGraph.encode(this.device.commandEncoder, {parameters: undefined});
      this.searchPending = false;
    }
    const encoding = this.frameGraph.encode(this.device.commandEncoder, {parameters: undefined});
    this.frameCount++;
    const frameTime = performance.now();
    if (this.previousFrameTime > 0 && frameTime > this.previousFrameTime) {
      const framesPerSecond = 1_000 / (frameTime - this.previousFrameTime);
      this.smoothedFramesPerSecond =
        this.smoothedFramesPerSecond === 0
          ? framesPerSecond
          : this.smoothedFramesPerSecond * 0.85 + framesPerSecond * 0.15;
    }
    this.previousFrameTime = frameTime;
    if (this.frameCount === 1 || advancedAnalysis || this.frameCount % 10 === 0) {
      this.publishStats(encoding.stats.cpuEncodeTimeMilliseconds);
    }
  }

  /** Publishes a genuinely picked stable source vertex without reading any graph column. */
  setSelectedVertex(vertex: number | null): void {
    if (vertex !== null && !this.isValidVertex(vertex)) return;
    this.selectedVertex = vertex;
    if (vertex === null) {
      this.getVectorBuffer(this.seedCount).write(Uint32Array.of(0));
    } else {
      this.getVectorBuffer(this.seeds).write(Uint32Array.of(vertex));
      this.getVectorBuffer(this.seedCount).write(Uint32Array.of(1));
    }
    this.searchPending = true;
  }

  /** Updates the existing GPU-resident dynamic hop limit without recompiling traversal passes. */
  setNeighborhoodDepth(depth: number): void {
    this.neighborhoodDepth = Math.max(0, Math.min(MAXIMUM_NEIGHBORHOOD_DEPTH, Math.round(depth)));
    this.getVectorBuffer(this.activeDepth).write(Uint32Array.of(this.neighborhoodDepth));
    this.searchPending = true;
  }

  /** Pins or releases exactly one original source vertex; no other rows are repacked. */
  setPinnedVertex(vertex: number, pinned: boolean): void {
    if (!this.isValidVertex(vertex)) return;
    this.getVectorBuffer(this.pinned).write(
      Uint32Array.of(pinned ? 1 : 0),
      vertex * SCALAR_BYTE_LENGTH
    );
    if (pinned) this.pinnedVertices.add(vertex);
    else this.pinnedVertices.delete(vertex);
  }

  isVertexPinned(vertex: number): boolean {
    return this.pinnedVertices.has(vertex);
  }

  /** Moves the same physical vertex allocation consumed by the active Deck node model. */
  setVertexPosition(vertex: number, position: readonly [number, number]): void {
    if (!this.isValidVertex(vertex) || !position.every(Number.isFinite)) return;
    const boundedPosition = this.spatialLayout
      ? position.map((coordinate, dimension) =>
          Math.min(
            GPU_GRAPH_DECK_SPATIAL_BOUNDS[dimension + 2] - SPATIAL_DRAG_MARGIN,
            Math.max(GPU_GRAPH_DECK_SPATIAL_BOUNDS[dimension] + SPATIAL_DRAG_MARGIN, coordinate)
          )
        )
      : position;
    this.positions.write(Float32Array.from(boundedPosition), vertex * 2 * SCALAR_BYTE_LENGTH);
    this.getVectorBuffer(this.layout.velocities).write(
      Float32Array.of(0, 0),
      vertex * 2 * SCALAR_BYTE_LENGTH
    );
  }

  clearPins(): void {
    this.getVectorBuffer(this.pinned).write(new Uint32Array(this.graph.vertexCount));
    this.pinnedVertices.clear();
  }

  requestReset(): void {
    this.getVectorBuffer(this.reset).write(Uint32Array.of(1));
  }

  /** Releases only effect-owned graphs and buffers; aggregate vectors remain borrowing views. */
  cleanup(_context: EffectContext): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const stage of this.analysisStages) stage.destroy();
    this.searchGraph?.destroy();
    this.frameGraph.destroy();
    for (const vector of this.vectors.reverse()) vector.destroy();
    for (const buffer of this.buffers.reverse()) buffer.destroy();
  }

  private isValidVertex(vertex: number): boolean {
    return Number.isSafeInteger(vertex) && vertex >= 0 && vertex < this.graph.vertexCount;
  }

  /** Publishes real CPU encoding and allocation metadata without waiting on GPU work. */
  private publishStats(frameEncodeMilliseconds: number): void {
    if (!this.onStats) return;
    const spatial = this.spatialLayout;
    const spatialIndexBytes = spatial
      ? [
          spatial.cellOffsets,
          spatial.vertexIds,
          spatial.cellCenters,
          spatial.count,
          spatial.overflow
        ].reduce((total, vector) => total + this.getVectorBuffer(vector).byteLength, 0)
      : 0;
    this.onStats({
      vertexCount: this.graph.vertexCount,
      edgeCount: this.graph.edgeCount,
      renderedVertexCount: this.renderedVertexCount,
      renderedEdgeCount: this.renderedEdgeCount,
      frameCount: this.frameCount,
      layoutMode: this.activeLayoutMode,
      renderMode: this.renderMode,
      gridCellCount: spatial?.cellCount ?? 0,
      residentBufferBytes: this.buffers.reduce((total, buffer) => total + buffer.byteLength, 0),
      transientBufferBytes:
        this.analysisStages.reduce(
          (total, stage) => total + stage.stats.physicalTransientBytes,
          0
        ) +
        (this.searchGraph?.stats.physicalTransientBytes ?? 0) +
        this.frameGraph.stats.physicalTransientBytes,
      spatialIndexBytes,
      analysisNodeCount: this.analysisStages.reduce(
        (total, stage) => total + stage.stats.nodeOrder.length,
        0
      ),
      frameNodeCount: this.frameGraph.stats.nodeOrder.length,
      analysisEncodeMilliseconds: this.analysisEncodeMilliseconds,
      frameEncodeMilliseconds,
      framesPerSecond: this.smoothedFramesPerSecond,
      completedAnalysisStages: this.completedAnalysisStages,
      totalAnalysisStages: this.analysisStages.length,
      pageRankIterations: this.pageRank.iterations,
      componentIterations: this.components.iterations,
      communityIterations: this.communities.iterations
    });
  }

  /** Preserves all original aligned GPUData partitions, including zero-length source batches. */
  private createChunkedVector(name: string, chunks: Uint32Array[]): GPUVector<'uint32'> {
    const data = chunks.map((values, chunkIndex) => {
      const buffer = this.device.createBuffer({
        id: `gpu-graph-deck-${name}-${chunkIndex}`,
        data: values.length === 0 ? new Uint32Array(1) : values,
        usage: Buffer.STORAGE | Buffer.COPY_DST
      });
      this.buffers.push(buffer);
      return new GPUData<'uint32'>({
        buffer,
        format: 'uint32',
        length: values.length,
        ownsBuffer: false
      });
    });
    const vector = new GPUVector<'uint32'>({
      type: 'data',
      name,
      format: 'uint32',
      data,
      ownsData: false
    });
    this.vectors.push(vector);
    return vector;
  }

  private createScalarVector<Format extends ScalarFormat>(
    name: string,
    format: Format,
    length: number,
    values?: Uint32Array | Float32Array
  ): GPUVector<Format> {
    const buffer = this.device.createBuffer({
      id: `gpu-graph-deck-${name}`,
      byteLength: Math.max(length, 1) * SCALAR_BYTE_LENGTH,
      usage: Buffer.STORAGE | Buffer.COPY_SRC | Buffer.COPY_DST
    });
    if (values?.length) buffer.write(values);
    this.buffers.push(buffer);
    const vector = new GPUVector<Format>({
      type: 'buffer',
      name,
      format,
      buffer,
      length,
      ownsBuffer: false
    });
    this.vectors.push(vector);
    return vector;
  }

  private createCoordinateVector(
    name: string,
    values: Float32Array,
    additionalUsage = 0
  ): GPUVector<'float32x2'> {
    const buffer = this.device.createBuffer({
      id: `gpu-graph-deck-${name}`,
      data: values,
      usage: Buffer.STORAGE | Buffer.COPY_DST | Buffer.COPY_SRC | additionalUsage
    });
    this.buffers.push(buffer);
    const vector = new GPUVector<'float32x2'>({
      type: 'buffer',
      name,
      format: 'float32x2',
      buffer,
      length: values.length / 2,
      ownsBuffer: false
    });
    this.vectors.push(vector);
    return vector;
  }

  private createAdjacency(name: string, vertexCount: number, capacity: number): GPUGraphAdjacency {
    return {
      offsets: this.createScalarVector(`${name}-offsets`, 'uint32', vertexCount + 1),
      neighbors: this.createScalarVector(`${name}-neighbors`, 'uint32', capacity),
      edgeIds: this.createScalarVector(`${name}-edge-ids`, 'uint32', capacity),
      count: this.createScalarVector(`${name}-count`, 'uint32', 1),
      overflow: this.createScalarVector(`${name}-overflow`, 'uint32', 1)
    };
  }

  private getVectorBuffer(vector: GPUVector): Buffer {
    return vector.data[0].buffer as Buffer;
  }
}

/** Bounds the caller-owned spatial grid without depending on example fixtures. */
function getGPUGraphDeckGridSize(vertexCount: number): readonly [number, number] {
  const dimension = Math.max(4, Math.min(32, Math.ceil(Math.sqrt(3) * vertexCount ** 0.25)));
  return [dimension, dimension];
}
