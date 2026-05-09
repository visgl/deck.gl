// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import log from '../../utils/log';

import type {Device} from '@luma.gl/core';

export type TableColumnPriority = 'high' | 'medium' | 'low';

/** Describes the physical GPU allocation shape chosen for a table column or group of columns. */
export type AllocationGroupKind =
  /** Interleaved vertex-rate columns that describe a reusable geometry shared by all table rows. */
  | 'interleaved-shared-geometry-columns'
  /** Position columns, including multiple named position columns and fp64 high components. */
  | 'position-attribute-columns'
  /** Interleaved small buffer for constant columns and fp64 low position components. */
  | 'interleaved-constant-attribute-columns'
  /** One vertex-buffer binding dedicated to one attribute column. */
  | 'separate-attribute-column'
  /** One interleaved vertex-buffer binding shared by lower-priority attribute columns. */
  | 'interleaved-attribute-columns'
  /** One storage-buffer binding dedicated to one original table column. */
  | 'separate-storage-column'
  /** One storage-buffer binding containing multiple whole-column slices at aligned offsets. */
  | 'stacked-storage-columns'
  /** A column that keeps its existing external allocation/publication path. */
  | 'unmanaged-attribute-column';

/** Planner modes describing how source table rows map to draw-time geometry. */
export type TableBufferPlannerMode =
  /** Each source table row draws one instance of reusable shared geometry. */
  | 'table-with-shared-geometry'
  /** Each source table row expands into its own inline generated vertices. */
  | 'table-with-row-geometries';

/** Model geometry hints used by the planner. */
export type TableBufferPlannerModelInfo = {
  /** Whether the model draws one shared geometry instance per table row. */
  isInstanced?: boolean;
  /** Vertex-buffer slots already consumed by model geometry. */
  reservedVertexBufferCount?: number;
};

/** One allocation group emitted by the planner. */
export type TableBufferGroup = {
  /** Stable buffer/group id used by downstream model-binding code. */
  id: string;
  /** Physical allocation shape for this group. */
  kind: AllocationGroupKind;
  /** Vertex attribute columns or fp64 component views assigned to this group. */
  columns: PlannedColumn[];
  /** Number of rows to materialize for small generated buffers, such as constants. */
  rowCount?: number;
  /** Vertex input step mode for groups whose row count is planner-owned. */
  stepMode?: 'vertex' | 'instance';
  /** Byte length for storage-buffer groups. */
  byteLength?: number;
  /** Per-column byte offsets for storage-buffer groups. */
  byteOffsets?: Record<string, number>;
};

/** A source table column available to the planner. */
export type TableColumnDescriptor = {
  /** Stable column id, usually the deck.gl shader attribute id. */
  id: string;
  /** Byte stride contributed by this column to an interleaved vertex attribute buffer. */
  byteStride: number;
  /** Byte length of the original column when represented as storage data. */
  byteLength: number;
  /** Number of rows currently materialized for this column. */
  rowCount: number;
  /** Vertex input step mode this column would publish to a model. */
  stepMode: 'vertex' | 'instance';
  /** Whether this is a geometry-defining position column. */
  isPosition?: boolean;
  /** Whether this column is currently a constant value. */
  isConstant?: boolean;
  /** Whether this column is an index buffer. */
  isIndexed?: boolean;
  /** Whether this column is currently controlled by transitions. */
  isTransition?: boolean;
  /** Whether the column is backed only by an external GPU buffer and has no CPU value to pack. */
  isExternalBufferOnly?: boolean;
  /** Whether this is an fp64 source column. Non-position fp64 columns are unmanaged. */
  isDoublePrecision?: boolean;
  /** Whether this column should avoid standalone GPU buffers. */
  noAlloc?: boolean;
  /** Whether `noAlloc` may be ignored because the column is generated and CPU-backed. */
  allowNoAllocManaged?: boolean;
  /** Whether this column can be copied into planner-owned packed buffers. */
  supportsPackedBuffer?: boolean;
  /** Whether this generated row-geometry column must stay as a vertex attribute. */
  isGeneratedRowGeometry?: boolean;
  /** Priority for receiving a separate vertex-buffer binding. */
  priority?: TableColumnPriority;
};

/** A column view assigned to a group. Double-precision positions may produce two views. */
export type PlannedColumn = {
  /** Source table column id. */
  id: string;
  /** Selects the fp64 high or low component view for position columns. */
  fp64Component?: 'high' | 'low';
};

/** Complete planner output consumed by downstream model-binding code. */
export type TableBufferPlan = {
  /** Ordered allocation groups to publish to a Model. */
  groups: TableBufferGroup[];
  /** Reverse lookup from source column id to all groups containing that column. */
  groupsByColumnId: Record<string, TableBufferGroup[]>;
  /** Reverse lookup from source column id to shader/model binding names and offsets. */
  mappingsByColumnId: Record<string, TableBufferMapping[]>;
  /** Columns represented by planner-owned vertex buffers. */
  packedColumnIds: Set<string>;
  /** Columns represented by storage-buffer groups. */
  storageColumnIds: Set<string>;
};

/** Model-binding mapping for one planned vertex attribute or fp64 component view. */
export type TableBufferMapping = {
  /** Source table column id. */
  columnId: string;
  /** Shader-visible attribute name, e.g. `instanceSourcePositions64Low`. */
  attributeName: string;
  /** Buffer/group id that contains this attribute view. */
  bufferName: string;
  /** Physical allocation shape of the containing group. */
  groupKind: AllocationGroupKind;
  /** fp64 component represented by this mapping, if any. */
  fp64Component?: 'high' | 'low';
  /** Byte offset within a storage-buffer group. */
  byteOffset?: number;
};

/** Inputs to the table buffer planner. */
type PlannerProps = {
  /** Optional label used in probe logging, normally the layer id. */
  id?: string;
  /** Device whose vertex/storage binding limits constrain the plan. */
  device: Device;
  /** Candidate table columns. */
  columns: TableColumnDescriptor[];
  /** Model geometry mode and reserved vertex-buffer slots. */
  modelInfo?: TableBufferPlannerModelInfo;
  /** Optional explicit planner mode. Defaults from `modelInfo.isInstanced`. */
  mode?: TableBufferPlannerMode;
  /** Enables planner-only storage-buffer allocation for row-geometry table columns. */
  useStorageBuffers?: boolean;
  /** Whether constant columns should be materialized into small planner-owned buffers. */
  generateConstantAttributes: boolean;
  /** Returns whether a column is currently controlled by transitions. */
  isTransitionAttribute: (attributeName: string) => boolean;
};

const PRIORITY_RANK: Record<TableColumnPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
};
const POSITIONS_GROUP_ID = 'position-attribute-columns';
const STORAGE_OVERFLOW_COLUMN_ALIGNMENT = 256;

/** Builds a table-first GPU buffer allocation plan from abstract column descriptors. */
export default class TableBufferPlanner {
  /** Classifies columns, assigns groups, validates device limits, and returns model mappings. */
  static getAllocationPlan({
    id = 'table-buffer-planner',
    device,
    columns,
    modelInfo,
    mode = getPlannerMode(modelInfo),
    useStorageBuffers = false,
    generateConstantAttributes,
    isTransitionAttribute
  }: PlannerProps): TableBufferPlan {
    const sortedColumns = [...columns].sort((a, b) => a.id.localeCompare(b.id));
    const columnsById = Object.fromEntries(sortedColumns.map(column => [column.id, column]));
    const groups: TableBufferGroup[] = [];
    const geometryColumns: PlannedColumn[] = [];
    const constantColumns: PlannedColumn[] = [];
    const positionColumns: PlannedColumn[] = [];
    const dataColumns: PlannedColumn[] = [];
    const reservedVertexBufferCount = modelInfo?.reservedVertexBufferCount || 0;

    for (const column of sortedColumns) {
      if (
        column.isIndexed ||
        column.isTransition ||
        isTransitionAttribute(column.id) ||
        column.isExternalBufferOnly ||
        (column.isConstant && !generateConstantAttributes) ||
        (column.isPosition && column.isDoublePrecision && !generateConstantAttributes) ||
        !canUsePlannedBuffer(column) ||
        (!column.supportsPackedBuffer && !column.isPosition)
      ) {
        groups.push({
          id: column.id,
          kind: 'unmanaged-attribute-column',
          columns: [{id: column.id}]
        });
      } else if (mode === 'table-with-row-geometries') {
        if (column.isPosition) {
          positionColumns.push({
            id: column.id,
            fp64Component: column.isDoublePrecision ? 'high' : undefined
          });
          if (column.isDoublePrecision && generateConstantAttributes) {
            constantColumns.push({id: column.id, fp64Component: 'low'});
          }
        } else if (column.isConstant && generateConstantAttributes) {
          constantColumns.push({id: column.id});
        } else {
          dataColumns.push({id: column.id});
        }
      } else if (column.stepMode === 'vertex') {
        geometryColumns.push({id: column.id});
      } else if (column.isPosition) {
        positionColumns.push({
          id: column.id,
          fp64Component: column.isDoublePrecision ? 'high' : undefined
        });
        if (column.isDoublePrecision && generateConstantAttributes) {
          constantColumns.push({id: column.id, fp64Component: 'low'});
        }
      } else if (column.isConstant && generateConstantAttributes) {
        constantColumns.push({id: column.id});
      } else {
        dataColumns.push({id: column.id});
      }
    }

    if (geometryColumns.length) {
      groups.push({
        id: 'interleaved-shared-geometry-columns',
        kind: 'interleaved-shared-geometry-columns',
        columns: geometryColumns
      });
    }
    if (constantColumns.length) {
      groups.push({
        id: 'interleaved-constant-attribute-columns',
        kind: 'interleaved-constant-attribute-columns',
        columns: constantColumns,
        rowCount:
          mode === 'table-with-row-geometries'
            ? 1
            : getPackedRowCount([...geometryColumns, ...positionColumns], columnsById),
        stepMode: mode === 'table-with-row-geometries' ? 'instance' : 'vertex'
      });
    }
    if (positionColumns.length) {
      groups.push({
        id: POSITIONS_GROUP_ID,
        kind: 'position-attribute-columns',
        columns: positionColumns
      });
    }

    const {storageGroups, vertexColumns} = allocateStorageAttributes({
      device,
      mode,
      useStorageBuffers,
      columns: dataColumns,
      columnsById
    });
    groups.push(...storageGroups);
    groups.push(
      ...allocateDataAttributes(
        device,
        groups,
        vertexColumns,
        columnsById,
        reservedVertexBufferCount
      )
    );
    validatePlan(device, groups, columnsById, reservedVertexBufferCount);

    const groupsByColumnId: Record<string, TableBufferGroup[]> = {};
    const mappingsByColumnId: Record<string, TableBufferMapping[]> = {};
    const packedColumnIds = new Set<string>();
    const storageColumnIds = new Set<string>();
    for (const group of groups) {
      for (const {id: columnId, fp64Component} of group.columns) {
        groupsByColumnId[columnId] = groupsByColumnId[columnId] || [];
        groupsByColumnId[columnId].push(group);
        mappingsByColumnId[columnId] = mappingsByColumnId[columnId] || [];
        const byteOffset = getStorageBufferByteOffset(group, columnId);
        mappingsByColumnId[columnId].push({
          columnId,
          attributeName: fp64Component === 'low' ? `${columnId}64Low` : columnId,
          bufferName: group.id,
          groupKind: group.kind,
          fp64Component,
          ...(byteOffset === undefined ? {} : {byteOffset})
        });
        if (group.kind === 'separate-storage-column' || group.kind === 'stacked-storage-columns') {
          storageColumnIds.add(columnId);
        } else if (group.kind !== 'unmanaged-attribute-column') {
          packedColumnIds.add(columnId);
        }
      }
    }

    const allocationPlan = {
      groups,
      groupsByColumnId,
      mappingsByColumnId,
      packedColumnIds,
      storageColumnIds
    };

    log.probe(1, `TableBufferPlanner.getAllocationPlan(${id})`, getLoggablePlan(allocationPlan))();

    return allocationPlan;
  }

  /**
   * Returns true when a column should compute CPU values but skip creating
   * its own standalone GPU buffer because the attribute manager will publish it.
   */
  static shouldSkipColumnBuffer(
    column: TableColumnDescriptor,
    _modelInfo: TableBufferPlannerModelInfo | undefined,
    isTransitionAttribute: (attributeName: string) => boolean
  ): boolean {
    return (
      !column.isIndexed &&
      (!column.isDoublePrecision || Boolean(column.isPosition)) &&
      !column.isExternalBufferOnly &&
      (!column.noAlloc || Boolean(column.allowNoAllocManaged)) &&
      !column.isTransition &&
      !isTransitionAttribute(column.id) &&
      (column.stepMode === 'vertex' || column.stepMode === 'instance')
    );
  }
}

/**
 * Optionally moves row-geometry data columns into storage-buffer groups.
 * Columns that cannot be represented as storage buffers fall back to vertex attributes.
 */
function allocateStorageAttributes({
  device,
  mode,
  useStorageBuffers,
  columns,
  columnsById
}: {
  device: Device;
  mode: TableBufferPlannerMode;
  useStorageBuffers: boolean;
  columns: PlannedColumn[];
  columnsById: Record<string, TableColumnDescriptor>;
}): {storageGroups: TableBufferGroup[]; vertexColumns: PlannedColumn[]} {
  if (!shouldUseStorageBuffers(device, mode, useStorageBuffers) || !columns.length) {
    return {storageGroups: [], vertexColumns: columns};
  }

  const maxStorageBuffers = Math.max(0, device.limits.maxStorageBuffersPerShaderStage || 0);
  const storageGroups: TableBufferGroup[] = [];
  const vertexColumns: PlannedColumn[] = [];
  const storageColumns: PlannedColumn[] = [];

  for (const column of sortDataAttributes(columns, columnsById)) {
    const descriptor = columnsById[column.id];
    const byteLength = descriptor.byteLength;
    if (
      byteLength <= device.limits.maxStorageBufferBindingSize &&
      !descriptor.isGeneratedRowGeometry
    ) {
      storageColumns.push(column);
    } else {
      vertexColumns.push(column);
    }
  }

  const dedicatedCount =
    maxStorageBuffers >= storageColumns.length
      ? storageColumns.length
      : Math.max(0, maxStorageBuffers - 1);

  for (const column of storageColumns.slice(0, dedicatedCount)) {
    storageGroups.push({
      id: column.id,
      kind: 'separate-storage-column',
      columns: [column],
      byteLength: columnsById[column.id].byteLength,
      byteOffsets: {[column.id]: 0}
    });
  }

  const overflowColumns = storageColumns.slice(dedicatedCount);
  if (overflowColumns.length) {
    const layout = getStorageOverflowLayout(overflowColumns, columnsById);
    if (
      storageGroups.length < maxStorageBuffers &&
      layout.byteLength <= device.limits.maxStorageBufferBindingSize
    ) {
      storageGroups.push({
        id: 'stacked-storage-columns',
        kind: 'stacked-storage-columns',
        columns: overflowColumns,
        byteLength: layout.byteLength,
        byteOffsets: layout.byteOffsets
      });
    } else {
      vertexColumns.push(...overflowColumns);
    }
  }

  return {storageGroups, vertexColumns};
}

/**
 * Assigns ordinary data columns to dedicated vertex buffers while slots remain,
 * then packs the rest into one interleaved overflow attribute buffer.
 */
function allocateDataAttributes(
  device: Device,
  fixedGroups: TableBufferGroup[],
  columns: PlannedColumn[],
  columnsById: Record<string, TableColumnDescriptor>,
  reservedVertexBufferCount: number
): TableBufferGroup[] {
  if (!columns.length) {
    return [];
  }

  const sortedColumns = sortDataAttributes(columns, columnsById);

  const fixedVertexBufferCount = countVertexBufferGroups(fixedGroups, columnsById);
  const availableSlots =
    device.limits.maxVertexBuffers - reservedVertexBufferCount - fixedVertexBufferCount;
  const dedicatedCount =
    availableSlots >= sortedColumns.length ? sortedColumns.length : Math.max(0, availableSlots - 1);
  const groups: TableBufferGroup[] = [];

  for (const column of sortedColumns.slice(0, dedicatedCount)) {
    groups.push({
      id: column.id,
      kind: 'separate-attribute-column',
      columns: [column]
    });
  }

  const overflowColumns = sortedColumns.slice(dedicatedCount);
  if (overflowColumns.length) {
    groups.push({
      id: 'interleaved-attribute-columns',
      kind: 'interleaved-attribute-columns',
      columns: overflowColumns
    });
  }

  return groups;
}

/** Verifies vertex-buffer counts, storage-buffer counts/sizes, and vertex array stride limits. */
function validatePlan(
  device: Device,
  groups: TableBufferGroup[],
  columnsById: Record<string, TableColumnDescriptor>,
  reservedVertexBufferCount: number
): void {
  const vertexBufferCount =
    reservedVertexBufferCount + countVertexBufferGroups(groups, columnsById);
  if (vertexBufferCount > device.limits.maxVertexBuffers) {
    throw new Error(
      `Attribute buffer allocation requires ${vertexBufferCount} vertex buffers, ` +
        `but this device supports ${device.limits.maxVertexBuffers}`
    );
  }

  const storageBufferGroups = groups.filter(
    group => group.kind === 'separate-storage-column' || group.kind === 'stacked-storage-columns'
  );
  if (storageBufferGroups.length > device.limits.maxStorageBuffersPerShaderStage) {
    throw new Error(
      `Attribute buffer allocation requires ${storageBufferGroups.length} storage buffers, ` +
        `but this device supports ${device.limits.maxStorageBuffersPerShaderStage}`
    );
  }

  for (const group of storageBufferGroups) {
    const byteLength = group.byteLength || columnsById[group.columns[0].id].byteLength;
    if (byteLength > device.limits.maxStorageBufferBindingSize) {
      throw new Error(
        `Attribute storage buffer group "${group.id}" requires byteLength ${byteLength}, ` +
          `but this device supports ${device.limits.maxStorageBufferBindingSize}`
      );
    }
  }

  for (const group of groups) {
    if (
      group.kind === 'unmanaged-attribute-column' ||
      group.kind === 'separate-storage-column' ||
      group.kind === 'stacked-storage-columns' ||
      columnsById[group.columns[0]?.id]?.isIndexed
    ) {
      continue;
    }
    const byteStride = getGroupByteStride(group, columnsById);
    if (byteStride > device.limits.maxVertexBufferArrayStride) {
      throw new Error(
        `Attribute buffer group "${group.id}" requires byteStride ${byteStride}, ` +
          `but this device supports ${device.limits.maxVertexBufferArrayStride}`
      );
    }
  }
}

/** Counts groups that consume vertex-buffer bindings, excluding storage and index groups. */
function countVertexBufferGroups(
  groups: TableBufferGroup[],
  columnsById: Record<string, TableColumnDescriptor>
): number {
  return groups.filter(
    group =>
      group.kind !== 'separate-storage-column' &&
      group.kind !== 'stacked-storage-columns' &&
      !columnsById[group.columns[0]?.id]?.isIndexed
  ).length;
}

/** Sorts data columns by layout priority and then by id for deterministic plans. */
function sortDataAttributes(
  columns: PlannedColumn[],
  columnsById: Record<string, TableColumnDescriptor>
): PlannedColumn[] {
  return [...columns].sort((a, b) => {
    const priorityDiff = getPriorityRank(columnsById[a.id]) - getPriorityRank(columnsById[b.id]);
    return priorityDiff || a.id.localeCompare(b.id);
  });
}

/** Converts a layout priority into a sortable rank. */
function getPriorityRank(column: TableColumnDescriptor): number {
  return PRIORITY_RANK[column.priority || 'medium'];
}

/** Selects the default planner mode from model instancing metadata. */
function getPlannerMode(modelInfo?: TableBufferPlannerModelInfo): TableBufferPlannerMode {
  return modelInfo?.isInstanced === false
    ? 'table-with-row-geometries'
    : 'table-with-shared-geometry';
}

/** Computes the materialized row count for shared geometry/constant packed groups. */
function getPackedRowCount(
  columns: PlannedColumn[],
  columnsById: Record<string, TableColumnDescriptor>
): number {
  return Math.max(1, ...columns.map(({id}) => columnsById[id].rowCount));
}

/** Returns whether a column can be represented by a planner-owned group. */
function canUsePlannedBuffer(column: TableColumnDescriptor): boolean {
  if (column.isDoublePrecision && !column.isPosition) {
    return false;
  }
  return !column.noAlloc || Boolean(column.allowNoAllocManaged);
}

/** Returns whether optional storage-buffer planning is enabled for this device/mode. */
function shouldUseStorageBuffers(
  device: Device,
  mode: TableBufferPlannerMode,
  useStorageBuffers: boolean
): boolean {
  return useStorageBuffers && device.type === 'webgpu' && mode === 'table-with-row-geometries';
}

/** Builds 256-byte-aligned whole-column slices for the stacked storage overflow buffer. */
function getStorageOverflowLayout(
  columns: PlannedColumn[],
  columnsById: Record<string, TableColumnDescriptor>
): {
  byteLength: number;
  byteOffsets: Record<string, number>;
} {
  let byteLength = 0;
  const byteOffsets: Record<string, number> = {};

  for (const {id} of columns) {
    byteLength = alignTo(byteLength, STORAGE_OVERFLOW_COLUMN_ALIGNMENT);
    byteOffsets[id] = byteLength;
    byteLength += columnsById[id].byteLength;
  }

  return {byteLength: alignTo(byteLength, STORAGE_OVERFLOW_COLUMN_ALIGNMENT), byteOffsets};
}

/** Returns a column's byte offset inside a storage-buffer group. */
function getStorageBufferByteOffset(group: TableBufferGroup, columnId: string): number | undefined {
  if (group.kind !== 'separate-storage-column' && group.kind !== 'stacked-storage-columns') {
    return undefined;
  }
  return group.byteOffsets?.[columnId] ?? 0;
}

/** Rounds `value` up to the next multiple of `alignment`. */
function alignTo(value: number, alignment: number): number {
  return Math.ceil(value / alignment) * alignment;
}

/** Computes byte stride for an interleaved vertex attribute group. */
function getGroupByteStride(
  group: TableBufferGroup,
  columnsById: Record<string, TableColumnDescriptor>
): number {
  return group.columns.reduce((byteStride, {id}) => byteStride + columnsById[id].byteStride, 0);
}

/** Returns a console-friendly snapshot that does not expose Sets or manager-owned objects. */
function getLoggablePlan(plan: TableBufferPlan): {
  groups: TableBufferGroup[];
  groupsByColumnId: Record<string, string[]>;
  mappingsByColumnId: Record<string, TableBufferMapping[]>;
  packedColumnIds: string[];
  storageColumnIds: string[];
} {
  return {
    groups: plan.groups,
    groupsByColumnId: Object.fromEntries(
      Object.entries(plan.groupsByColumnId).map(([id, groups]) => [
        id,
        groups.map(group => group.id)
      ])
    ),
    mappingsByColumnId: plan.mappingsByColumnId,
    packedColumnIds: [...plan.packedColumnIds],
    storageColumnIds: [...plan.storageColumnIds]
  };
}
