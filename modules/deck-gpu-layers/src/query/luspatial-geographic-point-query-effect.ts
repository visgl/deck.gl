// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Effect, EffectContext} from '@deck.gl/core';
import {Buffer, type Device} from '@luma.gl/core';
import {
  type CompiledGPUCommandGraph,
  DrawCommandBuffer,
  GPUCommandGraph,
  GPUCommandGraphInspector,
  type GPUCommandGraphInspectorObservation,
  type GPUCommandGraphInspectorSnapshot
} from '@luma.gl/gpgpu/gpu-core';
import {
  GPUGridIndex,
  type GPUGridIndexBounds,
  type GPUGridIndexSize,
  GPUPointSpatialQuery
} from '@luma.gl/experimental/geospatial';
import {
  compileProjectionPlan,
  GPUProjection,
  type ProjectionBounds,
  type ProjectionPlan
} from '@luma.gl/experimental/gpu-project';

const UINT32_BYTE_LENGTH = Uint32Array.BYTES_PER_ELEMENT;
const STORAGE_BUFFER_OFFSET_ALIGNMENT = 256;
const DEFAULT_GRID_SIZE = [256, 256] as const;
const DEFAULT_SELECTION_RADIUS_RANGE_KILOMETRES = [0.001, Number.POSITIVE_INFINITY] as const;
const DEFAULT_VIEWPORT_PROJECTION_PADDING_KILOMETRES = 0.02;
const KILOMETRES_PER_DEGREE = 40_000 / 360;
const DEGREES_TO_RADIANS = Math.PI / 180;

/** Stable counter IDs recorded on the query graph inspector. */
export const LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS = {
  viewportIntersectedCells: 'viewport-intersected-cells',
  viewportCandidates: 'viewport-candidates',
  viewportMatches: 'viewport-matches',
  selectionIntersectedCells: 'selection-intersected-cells',
  selectionCandidates: 'selection-candidates',
  selectionMatches: 'selection-matches'
} as const;

/** Stable graph IDs used by inspector snapshots. */
export const LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS = {
  build: 'luspatial-geographic-point-query-build-graph',
  query: 'luspatial-geographic-point-query-graph'
} as const;

/** Aligned byte offsets used by the optional sparse query-counter readback. */
export const LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS = {
  viewportIntersectedCellCount: 0,
  viewportCandidateCount: STORAGE_BUFFER_OFFSET_ALIGNMENT,
  selectionIntersectedCellCount: STORAGE_BUFFER_OFFSET_ALIGNMENT * 2,
  selectionCandidateCount: STORAGE_BUFFER_OFFSET_ALIGNMENT * 3
} as const;

const QUERY_DIAGNOSTIC_BUFFER_BYTE_LENGTH =
  LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionCandidateCount +
  UINT32_BYTE_LENGTH;

type DestroyableResource = {destroy(): void};

/** Exact work and result counts sampled from the two GPU spatial queries. */
export type LuSpatialGeographicPointQueryCounters = {
  viewportIntersectedCellCount: number;
  viewportCandidateCount: number;
  visiblePointCount: number;
  selectionIntersectedCellCount: number;
  selectionCandidateCount: number;
  selectedPointCount: number;
};

/** One immutable telemetry snapshot from the build and frame query graphs. */
export type LuSpatialGeographicPointQueryStats = LuSpatialGeographicPointQueryCounters & {
  residentPointCount: number;
  graphNodeCount: number;
  buildEncodingMilliseconds: number;
  queryEncodingMilliseconds: number;
  inspectorSnapshot: GPUCommandGraphInspectorSnapshot;
};

/** Geographic center and local radius used by the selection query. */
export type LuSpatialGeographicPointSelection = {
  center: readonly [number, number];
  radiusKilometres: number;
};

/** One query result ready to bind to the package's `LuSpatialPointLayer`. */
export type LuSpatialGeographicPointQueryOutput = {
  readonly positions: Buffer;
  readonly pointIds: Buffer;
  readonly drawCommands: DrawCommandBuffer;
  readonly commandIndex: number;
};

/** Viewport and local-radius outputs produced by the effect. */
export type LuSpatialGeographicPointQueryOutputs = {
  readonly viewport: LuSpatialGeographicPointQueryOutput;
  readonly selection: LuSpatialGeographicPointQueryOutput;
};

/** Immutable construction properties for a geographic point-query effect. */
export type LuSpatialGeographicPointQueryEffectProps = {
  /** Stable effect identity for this resident data revision. */
  id?: string;
  /** Packed WGS84 longitude/latitude rows in degrees. */
  longitudeLatitudes: Float32Array;
  /** Inclusive WGS84 source bounds used to compile the adaptive luProj plan. */
  sourceBounds: ProjectionBounds;
  /** Inclusive bounds of the projected rows in local kilometres. */
  projectedBounds: Extract<GPUGridIndexBounds, readonly [number, number, number, number]>;
  /** Longitude/latitude origin used by the cuSpatial-compatible sinusoidal projection. */
  projectionOrigin: readonly [number, number];
  /** Two-dimensional index resolution. Defaults to `[256, 256]`. */
  gridSize?: Extract<GPUGridIndexSize, readonly [number, number]>;
  /** Initial local-radius query. Defaults to the projection origin and one kilometre. */
  initialSelection?: LuSpatialGeographicPointSelection;
  /** Inclusive radius range enforced by the selection mutators. */
  selectionRadiusRangeKilometres?: readonly [number, number];
  /** Deck viewport ID to query. The first viewport is used when omitted. */
  viewportId?: string;
  /** Conservative projected viewport expansion. Defaults to the documented 20 metre envelope. */
  viewportProjectionPaddingKilometres?: number;
  /** Receives bounded asynchronous diagnostics without blocking rendering. */
  onStats?: (stats: LuSpatialGeographicPointQueryStats) => void;
  /** Enables asynchronous counter and timing readbacks. Defaults to whether `onStats` is set. */
  enableDiagnostics?: boolean;
  /** Maximum inspector history retained per graph. Defaults to 120 samples. */
  maxInspectorSamples?: number;
};

/**
 * Deck effect that projects, indexes, and queries one resident geographic point window on WebGPU.
 *
 * Construction builds the index once. Each Deck frame updates mutable viewport and selection
 * inputs, writes both result counts into indirect draw records, and leaves rendering synchronized
 * entirely on the GPU.
 */
export class LuSpatialGeographicPointQueryEffect implements Effect {
  readonly id: string;
  readonly props: Readonly<LuSpatialGeographicPointQueryEffectProps>;
  readonly useInPicking = true;
  readonly longitudeLatitudes: Buffer;
  readonly outputs: LuSpatialGeographicPointQueryOutputs;
  readonly drawCommands: DrawCommandBuffer;
  readonly inspector: GPUCommandGraphInspector;

  private readonly device: Device;
  private readonly pointCount: number;
  private readonly projectionOrigin: readonly [number, number];
  private readonly projectionPlan: ProjectionPlan;
  private readonly projectionDestinationOrigin: readonly [number, number];
  private readonly projectedBounds: readonly [number, number, number, number];
  private readonly gridSize: readonly [number, number];
  private readonly selectionRadiusRangeKilometres: readonly [number, number];
  private readonly viewportProjectionPaddingKilometres: number;
  private readonly viewportId?: string;
  private readonly diagnosticsEnabled: boolean;
  private readonly projectedPositions: Buffer;
  private readonly cellOffsets: Buffer;
  private readonly indexRowIndices: Buffer;
  private readonly indexCount: Buffer;
  private readonly indexOverflow: Buffer;
  private readonly viewportIds: Buffer;
  private readonly selectedIds: Buffer;
  private readonly viewportQuery: Buffer;
  private readonly selectionLongitudeLatitude: Buffer;
  private readonly selectionQuery: Buffer;
  private readonly viewportTotalCount: Buffer;
  private readonly selectionTotalCount: Buffer;
  private readonly viewportOverflow: Buffer;
  private readonly selectionOverflow: Buffer;
  private readonly queryDiagnostics: Buffer;
  private readonly buildGraph: CompiledGPUCommandGraph<void>;
  private readonly queryGraph: CompiledGPUCommandGraph<void>;
  private readonly buildGraphObservation: GPUCommandGraphInspectorObservation<void>;
  private readonly queryGraphObservation: GPUCommandGraphInspectorObservation<void>;
  private readonly onStats?: (stats: LuSpatialGeographicPointQueryStats) => void;
  private deck: EffectContext['deck'] | null = null;
  private selectionCenter: readonly [number, number];
  private selectionRadiusKilometres: number;
  private visiblePointCount = 0;
  private selectedPointCount = 0;
  private viewportIntersectedCellCount = 0;
  private viewportCandidateCount = 0;
  private selectionIntersectedCellCount = 0;
  private selectionCandidateCount = 0;
  private buildEncodingMilliseconds = 0;
  private queryEncodingMilliseconds = 0;
  private frameIndex = 0;
  private countReadPending = false;
  private countSampleRequested = true;
  private countSampleTimer: ReturnType<typeof setTimeout> | null = null;
  private queryGeneration = 0;
  private queryInputsChanged = true;
  private outputsContainQueryResults = false;
  private lastViewportBounds: Float32Array | null = null;
  private destroyed = false;
  private readonly ownedResources: DestroyableResource[] = [];

  constructor(device: Device, props: LuSpatialGeographicPointQueryEffectProps) {
    if (device.type !== 'webgpu') {
      throw new Error('LuSpatialGeographicPointQueryEffect requires WebGPU');
    }
    validateProps(props);
    this.device = device;
    this.props = props;
    this.id = props.id ?? 'luspatial-geographic-point-query-effect';
    this.pointCount = props.longitudeLatitudes.length / 2;
    this.projectionOrigin = props.projectionOrigin;
    this.projectionPlan = compileProjectionPlan({
      projection: coordinates => {
        const projected = projectLongitudeLatitude(
          [coordinates[0], coordinates[1]],
          this.projectionOrigin
        );
        return [projected[0], projected[1]];
      },
      bounds: props.sourceBounds,
      degree: 2,
      tolerance: 0.0005,
      maxDepth: 4
    });
    this.projectionDestinationOrigin = this.projectionPlan.destinationOrigin;
    this.projectedBounds = [
      props.projectedBounds[0] - this.projectionDestinationOrigin[0],
      props.projectedBounds[1] - this.projectionDestinationOrigin[1],
      props.projectedBounds[2] - this.projectionDestinationOrigin[0],
      props.projectedBounds[3] - this.projectionDestinationOrigin[1]
    ];
    this.gridSize = props.gridSize ?? DEFAULT_GRID_SIZE;
    this.selectionRadiusRangeKilometres =
      props.selectionRadiusRangeKilometres ?? DEFAULT_SELECTION_RADIUS_RANGE_KILOMETRES;
    this.selectionCenter = props.initialSelection?.center ?? props.projectionOrigin;
    this.selectionRadiusKilometres = clamp(
      props.initialSelection?.radiusKilometres ?? 1,
      this.selectionRadiusRangeKilometres[0],
      this.selectionRadiusRangeKilometres[1]
    );
    this.viewportId = props.viewportId;
    this.viewportProjectionPaddingKilometres =
      props.viewportProjectionPaddingKilometres ?? DEFAULT_VIEWPORT_PROJECTION_PADDING_KILOMETRES;
    this.onStats = props.onStats;
    this.diagnosticsEnabled = props.enableDiagnostics ?? Boolean(props.onStats);
    this.inspector = new GPUCommandGraphInspector({
      maxSamples: props.maxInspectorSamples ?? 120,
      getNodeGroup: node => {
        if (node.id.includes('project')) return 'projection';
        if (node.id.includes('grid')) return 'index';
        if (node.id.includes('query')) return 'query';
        return undefined;
      }
    });

    try {
      const cellCount = this.gridSize[0] * this.gridSize[1];
      this.longitudeLatitudes = this.ownResource(
        device.createBuffer({
          id: `${this.id}-longitude-latitudes`,
          data: props.longitudeLatitudes,
          usage: Buffer.STORAGE
        })
      );
      this.projectedPositions = this.ownResource(
        device.createBuffer({
          id: `${this.id}-projected-positions`,
          byteLength: this.pointCount * 2 * Float32Array.BYTES_PER_ELEMENT,
          usage: Buffer.STORAGE
        })
      );
      this.cellOffsets = this.ownResource(
        device.createBuffer({
          id: `${this.id}-cell-offsets`,
          byteLength: (cellCount + 1) * UINT32_BYTE_LENGTH,
          usage: Buffer.STORAGE | Buffer.COPY_SRC
        })
      );
      this.indexRowIndices = this.ownResource(
        device.createBuffer({
          id: `${this.id}-index-row-indices`,
          byteLength: this.pointCount * UINT32_BYTE_LENGTH,
          usage: Buffer.STORAGE | Buffer.COPY_SRC
        })
      );
      this.indexCount = this.ownResource(createScalarBuffer(device, `${this.id}-index-count`));
      this.indexOverflow = this.ownResource(
        createScalarBuffer(device, `${this.id}-index-overflow`)
      );
      this.viewportIds = this.ownResource(
        device.createBuffer({
          id: `${this.id}-viewport-ids`,
          byteLength: this.pointCount * UINT32_BYTE_LENGTH,
          usage: Buffer.STORAGE | Buffer.COPY_SRC
        })
      );
      this.selectedIds = this.ownResource(
        device.createBuffer({
          id: `${this.id}-selected-ids`,
          byteLength: this.pointCount * UINT32_BYTE_LENGTH,
          usage: Buffer.STORAGE | Buffer.COPY_SRC
        })
      );
      this.viewportQuery = this.ownResource(
        device.createBuffer({
          id: `${this.id}-viewport-query`,
          byteLength: 4 * Float32Array.BYTES_PER_ELEMENT,
          usage: Buffer.STORAGE | Buffer.COPY_DST
        })
      );
      this.selectionLongitudeLatitude = this.ownResource(
        device.createBuffer({
          id: `${this.id}-selection-longitude-latitude`,
          byteLength: 2 * Float32Array.BYTES_PER_ELEMENT,
          usage: Buffer.STORAGE | Buffer.COPY_DST
        })
      );
      this.selectionQuery = this.ownResource(
        device.createBuffer({
          id: `${this.id}-selection-query`,
          byteLength: 3 * Float32Array.BYTES_PER_ELEMENT,
          usage: Buffer.STORAGE | Buffer.COPY_DST
        })
      );
      this.viewportTotalCount = this.ownResource(
        createScalarBuffer(device, `${this.id}-viewport-total-count`)
      );
      this.selectionTotalCount = this.ownResource(
        createScalarBuffer(device, `${this.id}-selection-total-count`)
      );
      this.viewportOverflow = this.ownResource(
        createScalarBuffer(device, `${this.id}-viewport-overflow`)
      );
      this.selectionOverflow = this.ownResource(
        createScalarBuffer(device, `${this.id}-selection-overflow`)
      );
      this.queryDiagnostics = this.ownResource(
        device.createBuffer({
          id: `${this.id}-query-diagnostics`,
          byteLength: QUERY_DIAGNOSTIC_BUFFER_BYTE_LENGTH,
          usage: Buffer.STORAGE | Buffer.COPY_SRC
        })
      );
      this.drawCommands = this.ownResource(
        new DrawCommandBuffer(device, {
          id: `${this.id}-draw-commands`,
          type: 'draw',
          capacity: 2,
          commands: [
            {vertexCount: 6, instanceCount: 0},
            {vertexCount: 6, instanceCount: 0}
          ]
        })
      );
      this.outputs = {
        viewport: {
          positions: this.longitudeLatitudes,
          pointIds: this.viewportIds,
          drawCommands: this.drawCommands,
          commandIndex: 0
        },
        selection: {
          positions: this.longitudeLatitudes,
          pointIds: this.selectedIds,
          drawCommands: this.drawCommands,
          commandIndex: 1
        }
      };

      this.buildGraph = this.ownResource(this.createBuildGraph());
      this.queryGraph = this.ownResource(this.createQueryGraph());
      this.buildGraphObservation = this.ownObservation(
        this.inspector.observeGraph(this.buildGraph)
      );
      this.queryGraphObservation = this.ownObservation(
        this.inspector.observeGraph(this.queryGraph)
      );
      const commandEncoder = device.createCommandEncoder({id: `${this.id}-index-build`});
      const encoding = this.buildGraphObservation.encode(commandEncoder, {parameters: undefined});
      this.buildEncodingMilliseconds = encoding.stats.cpuEncodeTimeMilliseconds;
      device.submit(commandEncoder.finish());
      this.publishStats();
      if (this.diagnosticsEnabled && encoding.canReadGPUTimings) {
        setTimeout(() => {
          if (!this.destroyed) {
            void this.buildGraphObservation.recordGPUTimings(encoding);
          }
        }, 0);
      }
    } catch (error) {
      this.destroyOwnedResources();
      throw error;
    }
  }

  setup(context: EffectContext): void {
    if (context.device !== this.device) {
      throw new Error(`${this.id} must be adopted by the device used during construction`);
    }
    this.deck = context.deck;
  }

  /** Moves the local radius query and optionally replaces its radius. */
  setSelection(center: readonly [number, number], radiusKilometres?: number): void {
    validateLongitudeLatitude(center, `${this.id} selection center`);
    this.selectionCenter = center;
    if (radiusKilometres !== undefined) {
      if (!Number.isFinite(radiusKilometres)) {
        throw new Error(`${this.id} selection radius must be finite`);
      }
      this.selectionRadiusKilometres = clamp(
        radiusKilometres,
        this.selectionRadiusRangeKilometres[0],
        this.selectionRadiusRangeKilometres[1]
      );
    }
    this.queryInputsChanged = true;
    this.deck?.redraw(`${this.id} selection changed`);
  }

  /** Replaces the local query radius within the configured inclusive range. */
  setSelectionRadius(radiusKilometres: number): void {
    if (!Number.isFinite(radiusKilometres)) {
      throw new Error(`${this.id} selection radius must be finite`);
    }
    this.selectionRadiusKilometres = clamp(
      radiusKilometres,
      this.selectionRadiusRangeKilometres[0],
      this.selectionRadiusRangeKilometres[1]
    );
    this.queryInputsChanged = true;
    this.deck?.redraw(`${this.id} selection radius changed`);
  }

  /** Returns the current geographic center and clamped local radius. */
  getSelection(): LuSpatialGeographicPointSelection {
    return {
      center: this.selectionCenter,
      radiusKilometres: this.selectionRadiusKilometres
    };
  }

  preRender(options: Parameters<Effect['preRender']>[0]): void {
    if (this.destroyed) return;
    const viewport = this.viewportId
      ? options.viewports.find(candidate => candidate.id === this.viewportId)
      : options.viewports[0];
    if (!viewport || viewport.width <= 0 || viewport.height <= 0) {
      this.clearQueryOutputs();
      return;
    }

    const projectedCorners = [
      viewport.unproject([0, 0]),
      viewport.unproject([viewport.width, 0]),
      viewport.unproject([0, viewport.height]),
      viewport.unproject([viewport.width, viewport.height])
    ].map(coordinate => {
      const projected = projectLongitudeLatitude(
        [coordinate[0], coordinate[1]],
        this.projectionOrigin
      );
      return [
        projected[0] - this.projectionDestinationOrigin[0],
        projected[1] - this.projectionDestinationOrigin[1]
      ] as const;
    });
    const viewportBounds = new Float32Array([
      Math.min(...projectedCorners.map(coordinate => coordinate[0])) -
        this.viewportProjectionPaddingKilometres,
      Math.min(...projectedCorners.map(coordinate => coordinate[1])) -
        this.viewportProjectionPaddingKilometres,
      Math.max(...projectedCorners.map(coordinate => coordinate[0])) +
        this.viewportProjectionPaddingKilometres,
      Math.max(...projectedCorners.map(coordinate => coordinate[1])) +
        this.viewportProjectionPaddingKilometres
    ]);
    const viewportBoundsChanged =
      !this.lastViewportBounds ||
      viewportBounds.some((value, index) => value !== this.lastViewportBounds?.[index]);
    if (!viewportBoundsChanged && !this.queryInputsChanged) return;

    this.lastViewportBounds = viewportBounds;
    const queryChanged = viewportBoundsChanged || this.queryInputsChanged;
    this.viewportQuery.write(viewportBounds);
    this.selectionLongitudeLatitude.write(new Float32Array(this.selectionCenter));
    this.selectionQuery.write(
      new Float32Array([this.selectionRadiusKilometres]),
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    const encoding = this.queryGraphObservation.encode(this.device.commandEncoder, {
      parameters: undefined
    });
    this.outputsContainQueryResults = true;
    this.queryEncodingMilliseconds = encoding.stats.cpuEncodeTimeMilliseconds;
    this.frameIndex++;
    if (queryChanged) {
      this.queryGeneration++;
      this.queryInputsChanged = false;
      if (this.diagnosticsEnabled) this.scheduleCountSample(80);
    }
    if (this.diagnosticsEnabled && (this.frameIndex === 1 || this.frameIndex % 30 === 0)) {
      this.scheduleCountSample(0);
      if (encoding.canReadGPUTimings) {
        setTimeout(() => {
          if (!this.destroyed) {
            void this.queryGraphObservation.recordGPUTimings(encoding);
          }
        }, 0);
      }
    }
    if (this.diagnosticsEnabled && (this.frameIndex === 1 || this.frameIndex % 15 === 0)) {
      this.publishStats();
    }
  }

  cleanup(_context: EffectContext): void {
    this.deck = null;
    this.destroy();
  }

  /** Releases GPU resources when a newly constructed effect cannot be adopted by deck.gl. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.deck = null;
    if (this.countSampleTimer !== null) clearTimeout(this.countSampleTimer);
    this.destroyOwnedResources();
  }

  private ownResource<T extends DestroyableResource>(resource: T): T {
    this.ownedResources.push(resource);
    return resource;
  }

  private ownObservation<T extends {detach: () => void}>(observation: T): T {
    this.ownedResources.push({destroy: () => observation.detach()});
    return observation;
  }

  private destroyOwnedResources(): void {
    for (let index = this.ownedResources.length - 1; index >= 0; index--) {
      try {
        this.ownedResources[index]?.destroy();
      } catch {
        // Continue releasing the remaining resources after device loss or partial construction.
      }
    }
    this.ownedResources.length = 0;
  }

  private clearQueryOutputs(): void {
    this.lastViewportBounds = null;
    this.queryGeneration++;
    this.queryInputsChanged = true;
    if (!this.outputsContainQueryResults) return;
    const zero = new Uint32Array(1);
    this.drawCommands.buffer.write(zero, this.drawCommands.getInstanceCountByteOffset(0));
    this.drawCommands.buffer.write(zero, this.drawCommands.getInstanceCountByteOffset(1));
    this.outputsContainQueryResults = false;
    this.viewportIntersectedCellCount = 0;
    this.viewportCandidateCount = 0;
    this.visiblePointCount = 0;
    this.selectionIntersectedCellCount = 0;
    this.selectionCandidateCount = 0;
    this.selectedPointCount = 0;
    this.queryGraphObservation.recordCounters(
      makeLuSpatialGeographicPointQueryInspectorCounters({
        viewportIntersectedCellCount: 0,
        viewportCandidateCount: 0,
        visiblePointCount: 0,
        selectionIntersectedCellCount: 0,
        selectionCandidateCount: 0,
        selectedPointCount: 0
      })
    );
    this.publishStats();
  }

  private createBuildGraph(): CompiledGPUCommandGraph<void> {
    const graph = new GPUCommandGraph<void>(this.device, {
      id: LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS.build
    });
    const sourceBuffer = importBuffer(graph, 'longitude-latitudes', this.longitudeLatitudes);
    const projectedBuffer = importBuffer(graph, 'projected-positions', this.projectedPositions);
    const cellOffsetsBuffer = importBuffer(graph, 'cell-offsets', this.cellOffsets);
    const rowIndicesBuffer = importBuffer(graph, 'index-row-indices', this.indexRowIndices);
    const countBuffer = importBuffer(graph, 'index-count', this.indexCount);
    const overflowBuffer = importBuffer(graph, 'index-overflow', this.indexOverflow);
    const source = graph.createDataView(sourceBuffer, {
      format: 'float32x2',
      length: this.pointCount
    });
    const projected = graph.createDataView(projectedBuffer, {
      format: 'float32x2',
      length: this.pointCount
    });
    const cellOffsets = graph.createDataView(cellOffsetsBuffer, {
      format: 'uint32',
      length: this.gridSize[0] * this.gridSize[1] + 1
    });
    const rowIndices = graph.createDataView(rowIndicesBuffer, {
      format: 'uint32',
      length: this.pointCount
    });
    const count = graph.createDataView(countBuffer, {format: 'uint32', length: 1});
    const overflow = graph.createDataView(overflowBuffer, {format: 'uint32', length: 1});

    const projection = this.ownResource(
      new GPUProjection({
        id: `${this.id}-project`,
        positions: source,
        output: projected,
        plan: this.projectionPlan
      })
    );
    projection.addToGraph(graph);
    graph.add(
      new GPUGridIndex({
        id: `${this.id}-grid`,
        positions: projected,
        gridSize: this.gridSize,
        bounds: this.projectedBounds,
        cellOffsets,
        objectIds: rowIndices,
        count,
        overflow
      })
    );
    return graph.compile();
  }

  private createQueryGraph(): CompiledGPUCommandGraph<void> {
    const graph = new GPUCommandGraph<void>(this.device, {
      id: LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_GRAPH_IDS.query
    });
    const projectedBuffer = importBuffer(graph, 'projected-positions', this.projectedPositions);
    const cellOffsetsBuffer = importBuffer(graph, 'cell-offsets', this.cellOffsets);
    const rowIndicesBuffer = importBuffer(graph, 'index-row-indices', this.indexRowIndices);
    const indexCountBuffer = importBuffer(graph, 'index-count', this.indexCount);
    const indexOverflowBuffer = importBuffer(graph, 'index-overflow', this.indexOverflow);
    const viewportIdsBuffer = importBuffer(graph, 'viewport-ids', this.viewportIds);
    const selectedIdsBuffer = importBuffer(graph, 'selected-ids', this.selectedIds);
    const viewportQueryBuffer = importBuffer(graph, 'viewport-query', this.viewportQuery);
    const selectionQueryBuffer = importBuffer(graph, 'selection-query', this.selectionQuery);
    const selectionLongitudeLatitudeBuffer = importBuffer(
      graph,
      'selection-longitude-latitude',
      this.selectionLongitudeLatitude
    );
    const viewportTotalCountBuffer = importBuffer(
      graph,
      'viewport-total-count',
      this.viewportTotalCount
    );
    const selectionTotalCountBuffer = importBuffer(
      graph,
      'selection-total-count',
      this.selectionTotalCount
    );
    const viewportOverflowBuffer = importBuffer(graph, 'viewport-overflow', this.viewportOverflow);
    const selectionOverflowBuffer = importBuffer(
      graph,
      'selection-overflow',
      this.selectionOverflow
    );
    const queryDiagnosticsBuffer = importBuffer(graph, 'query-diagnostics', this.queryDiagnostics);
    const drawCommandBuffer = importBuffer(graph, 'draw-commands', this.drawCommands.buffer);

    const selectionProjection = this.ownResource(
      new GPUProjection({
        id: `${this.id}-selection-project`,
        positions: graph.createDataView(selectionLongitudeLatitudeBuffer, {
          format: 'float32x2',
          length: 1
        }),
        output: graph.createDataView(selectionQueryBuffer, {
          format: 'float32x2',
          length: 1
        }),
        plan: this.projectionPlan
      })
    );
    selectionProjection.addToGraph(graph);

    const positions = graph.createDataView(projectedBuffer, {
      format: 'float32x2',
      length: this.pointCount
    });
    const cellOffsets = graph.createDataView(cellOffsetsBuffer, {
      format: 'uint32',
      length: this.gridSize[0] * this.gridSize[1] + 1
    });
    const rowIndices = graph.createDataView(rowIndicesBuffer, {
      format: 'uint32',
      length: this.pointCount
    });
    const index = {
      gridSize: this.gridSize,
      bounds: this.projectedBounds,
      cellOffsets,
      rowIndices,
      count: graph.createDataView(indexCountBuffer, {format: 'uint32', length: 1}),
      overflow: graph.createDataView(indexOverflowBuffer, {format: 'uint32', length: 1})
    };
    const viewportIntersectedCellCount = graph.createDataView(queryDiagnosticsBuffer, {
      format: 'uint32',
      length: 1,
      byteOffset:
        LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.viewportIntersectedCellCount
    });
    const viewportCandidateCount = graph.createDataView(queryDiagnosticsBuffer, {
      format: 'uint32',
      length: 1,
      byteOffset: LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.viewportCandidateCount
    });
    const selectionIntersectedCellCount = graph.createDataView(queryDiagnosticsBuffer, {
      format: 'uint32',
      length: 1,
      byteOffset:
        LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionIntersectedCellCount
    });
    const selectionCandidateCount = graph.createDataView(queryDiagnosticsBuffer, {
      format: 'uint32',
      length: 1,
      byteOffset: LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionCandidateCount
    });

    new GPUPointSpatialQuery({
      id: `${this.id}-viewport-query`,
      positions,
      index,
      kind: 'bounds',
      query: graph.createDataView(viewportQueryBuffer, {format: 'float32', length: 4}),
      intersectedCellCount: viewportIntersectedCellCount,
      candidateCount: viewportCandidateCount,
      output: {
        ids: graph.createDataView(viewportIdsBuffer, {
          format: 'uint32',
          length: this.pointCount
        }),
        count: graph.createDataView(drawCommandBuffer, {
          format: 'uint32',
          length: 1,
          byteOffset: this.drawCommands.getInstanceCountByteOffset(0)
        }),
        overflow: graph.createDataView(viewportOverflowBuffer, {format: 'uint32', length: 1}),
        totalCount: graph.createDataView(viewportTotalCountBuffer, {
          format: 'uint32',
          length: 1
        })
      }
    }).addToGraph(graph);

    new GPUPointSpatialQuery({
      id: `${this.id}-radius-query`,
      positions,
      index,
      kind: 'radius',
      query: graph.createDataView(selectionQueryBuffer, {format: 'float32', length: 3}),
      intersectedCellCount: selectionIntersectedCellCount,
      candidateCount: selectionCandidateCount,
      output: {
        ids: graph.createDataView(selectedIdsBuffer, {
          format: 'uint32',
          length: this.pointCount
        }),
        count: graph.createDataView(drawCommandBuffer, {
          format: 'uint32',
          length: 1,
          byteOffset: this.drawCommands.getInstanceCountByteOffset(1)
        }),
        overflow: graph.createDataView(selectionOverflowBuffer, {format: 'uint32', length: 1}),
        totalCount: graph.createDataView(selectionTotalCountBuffer, {
          format: 'uint32',
          length: 1
        })
      }
    }).addToGraph(graph);
    return graph.compile();
  }

  private async sampleCounts(): Promise<void> {
    if (this.destroyed) return;
    if (this.countReadPending) {
      this.countSampleRequested = true;
      return;
    }
    this.countReadPending = true;
    const queryGeneration = this.queryGeneration;
    try {
      const [drawCommandBytes, queryDiagnosticBytes] = await Promise.all([
        this.drawCommands.buffer.readAsync(),
        this.queryDiagnostics.readAsync()
      ]);
      if (this.destroyed || queryGeneration !== this.queryGeneration) return;
      const counters = decodeLuSpatialGeographicPointQueryCounters(
        drawCommandBytes,
        queryDiagnosticBytes,
        {
          viewportInstanceCountByteOffset: this.drawCommands.getInstanceCountByteOffset(0),
          selectionInstanceCountByteOffset: this.drawCommands.getInstanceCountByteOffset(1)
        }
      );
      this.viewportIntersectedCellCount = counters.viewportIntersectedCellCount;
      this.viewportCandidateCount = counters.viewportCandidateCount;
      this.visiblePointCount = counters.visiblePointCount;
      this.selectionIntersectedCellCount = counters.selectionIntersectedCellCount;
      this.selectionCandidateCount = counters.selectionCandidateCount;
      this.selectedPointCount = counters.selectedPointCount;
      this.queryGraphObservation.recordCounters(
        makeLuSpatialGeographicPointQueryInspectorCounters(counters)
      );
      this.publishStats();
    } catch {
      // Device loss or teardown can reject optional diagnostics after the render path has ended.
      // Rendering stays entirely GPU-driven, so the next requested sample can retry safely.
    } finally {
      this.countReadPending = false;
      if (this.countSampleRequested && !this.destroyed) {
        this.countSampleRequested = false;
        this.scheduleCountSample(0);
      }
    }
  }

  private scheduleCountSample(delayMilliseconds: number): void {
    if (this.destroyed) return;
    this.countSampleRequested = false;
    if (this.countSampleTimer !== null) clearTimeout(this.countSampleTimer);
    this.countSampleTimer = setTimeout(() => {
      this.countSampleTimer = null;
      void this.sampleCounts();
    }, delayMilliseconds);
  }

  private publishStats(): void {
    this.onStats?.({
      residentPointCount: this.pointCount,
      viewportIntersectedCellCount: this.viewportIntersectedCellCount,
      viewportCandidateCount: this.viewportCandidateCount,
      visiblePointCount: this.visiblePointCount,
      selectionIntersectedCellCount: this.selectionIntersectedCellCount,
      selectionCandidateCount: this.selectionCandidateCount,
      selectedPointCount: this.selectedPointCount,
      graphNodeCount:
        this.buildGraph.stats.nodeOrder.length + this.queryGraph.stats.nodeOrder.length,
      buildEncodingMilliseconds: this.buildEncodingMilliseconds,
      queryEncodingMilliseconds: this.queryEncodingMilliseconds,
      inspectorSnapshot: this.inspector.getSnapshot()
    });
  }
}

/** Decodes one pair of sparse GPU query-counter and indirect-draw readbacks. */
export function decodeLuSpatialGeographicPointQueryCounters(
  drawCommandBytes: Uint8Array,
  queryDiagnosticBytes: Uint8Array,
  drawCommandLayout: {
    viewportInstanceCountByteOffset: number;
    selectionInstanceCountByteOffset: number;
  }
): LuSpatialGeographicPointQueryCounters {
  return {
    viewportIntersectedCellCount: readUint32AtByteOffset(
      queryDiagnosticBytes,
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.viewportIntersectedCellCount
    ),
    viewportCandidateCount: readUint32AtByteOffset(
      queryDiagnosticBytes,
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.viewportCandidateCount
    ),
    visiblePointCount: readUint32AtByteOffset(
      drawCommandBytes,
      drawCommandLayout.viewportInstanceCountByteOffset
    ),
    selectionIntersectedCellCount: readUint32AtByteOffset(
      queryDiagnosticBytes,
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionIntersectedCellCount
    ),
    selectionCandidateCount: readUint32AtByteOffset(
      queryDiagnosticBytes,
      LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_DIAGNOSTIC_BYTE_OFFSETS.selectionCandidateCount
    ),
    selectedPointCount: readUint32AtByteOffset(
      drawCommandBytes,
      drawCommandLayout.selectionInstanceCountByteOffset
    )
  };
}

/** Maps an exact query sample onto stable inspector counter identifiers. */
export function makeLuSpatialGeographicPointQueryInspectorCounters(
  counters: LuSpatialGeographicPointQueryCounters
): Readonly<Record<string, number>> {
  return {
    [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportIntersectedCells]:
      counters.viewportIntersectedCellCount,
    [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportCandidates]:
      counters.viewportCandidateCount,
    [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.viewportMatches]: counters.visiblePointCount,
    [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionIntersectedCells]:
      counters.selectionIntersectedCellCount,
    [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionCandidates]:
      counters.selectionCandidateCount,
    [LU_SPATIAL_GEOGRAPHIC_POINT_QUERY_COUNTER_IDS.selectionMatches]: counters.selectedPointCount
  };
}

function readUint32AtByteOffset(bytes: Uint8Array, byteOffset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(byteOffset, true);
}

function createScalarBuffer(device: Device, id: string): Buffer {
  return device.createBuffer({
    id,
    byteLength: UINT32_BYTE_LENGTH,
    usage: Buffer.STORAGE | Buffer.COPY_SRC
  });
}

function importBuffer<Parameters>(graph: GPUCommandGraph<Parameters>, id: string, buffer: Buffer) {
  return graph.importBuffer({id, byteLength: buffer.byteLength, usage: buffer.usage}, buffer);
}

function projectLongitudeLatitude(
  longitudeLatitude: readonly [number, number],
  origin: readonly [number, number]
): readonly [number, number] {
  const [longitude, latitude] = longitudeLatitude;
  const midpointLatitudeRadians = (latitude + origin[1]) * 0.5 * DEGREES_TO_RADIANS;
  return [
    (origin[0] - longitude) * KILOMETRES_PER_DEGREE * Math.cos(midpointLatitudeRadians),
    (origin[1] - latitude) * KILOMETRES_PER_DEGREE
  ];
}

function validateProps(props: LuSpatialGeographicPointQueryEffectProps): void {
  if (props.longitudeLatitudes.length === 0 || props.longitudeLatitudes.length % 2 !== 0) {
    throw new Error('longitudeLatitudes must contain one or more packed coordinate pairs');
  }
  validateLongitudeLatitude(props.projectionOrigin, 'projectionOrigin');
  validateLongitudeLatitude([props.sourceBounds[0], props.sourceBounds[1]], 'sourceBounds minimum');
  validateLongitudeLatitude([props.sourceBounds[2], props.sourceBounds[3]], 'sourceBounds maximum');
  if (
    props.sourceBounds[0] >= props.sourceBounds[2] ||
    props.sourceBounds[1] >= props.sourceBounds[3]
  ) {
    throw new Error('sourceBounds minima must be less than maxima');
  }
  if (props.projectedBounds.some(value => !Number.isFinite(value))) {
    throw new Error('projectedBounds must contain finite values');
  }
  if (
    props.projectedBounds[0] > props.projectedBounds[2] ||
    props.projectedBounds[1] > props.projectedBounds[3]
  ) {
    throw new Error('projectedBounds minima must not exceed maxima');
  }
  const gridSize = props.gridSize ?? DEFAULT_GRID_SIZE;
  if (gridSize.some(value => !Number.isSafeInteger(value) || value <= 0)) {
    throw new Error('gridSize must contain positive safe integers');
  }
  if (!Number.isSafeInteger(gridSize[0] * gridSize[1])) {
    throw new Error('gridSize cell count must be a safe integer');
  }
  const radiusRange =
    props.selectionRadiusRangeKilometres ?? DEFAULT_SELECTION_RADIUS_RANGE_KILOMETRES;
  if (
    !Number.isFinite(radiusRange[0]) ||
    radiusRange[0] <= 0 ||
    Number.isNaN(radiusRange[1]) ||
    radiusRange[1] < radiusRange[0]
  ) {
    throw new Error('selectionRadiusRangeKilometres must be a positive ordered range');
  }
  if (props.initialSelection) {
    validateLongitudeLatitude(props.initialSelection.center, 'initialSelection center');
    if (!Number.isFinite(props.initialSelection.radiusKilometres)) {
      throw new Error('initialSelection radius must be finite');
    }
  }
  if (
    props.viewportProjectionPaddingKilometres !== undefined &&
    (!Number.isFinite(props.viewportProjectionPaddingKilometres) ||
      props.viewportProjectionPaddingKilometres < 0)
  ) {
    throw new Error('viewportProjectionPaddingKilometres must be a non-negative finite number');
  }
  if (
    props.maxInspectorSamples !== undefined &&
    (!Number.isSafeInteger(props.maxInspectorSamples) || props.maxInspectorSamples <= 0)
  ) {
    throw new Error('maxInspectorSamples must be a positive safe integer');
  }
}

function validateLongitudeLatitude(
  longitudeLatitude: readonly [number, number],
  label: string
): void {
  const [longitude, latitude] = longitudeLatitude;
  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(`${label} must be valid longitude/latitude degrees`);
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
