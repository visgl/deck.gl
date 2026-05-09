// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Attribute, {BufferLayoutPriority} from './attribute';

import type {Device} from '@luma.gl/core';

export type AllocationGroupKind =
  | 'interleaved-shared-geometry-columns'
  | 'position-attribute-columns'
  | 'interleaved-constant-attribute-columns'
  | 'separate-attribute-column'
  | 'interleaved-attribute-columns'
  | 'separate-storage-column'
  | 'stacked-storage-columns'
  | 'unmanaged-attribute-column';

export type TableBufferPlannerMode =
  | 'table-with-shared-geometry'
  | 'table-with-inline-row-geometry';

export type AttributeAllocationGroup = {
  id: string;
  kind: AllocationGroupKind;
  attributes: PlannedAttribute[];
  rowCount?: number;
  stepMode?: 'vertex' | 'instance';
  byteLength?: number;
  byteOffsets?: Record<string, number>;
};

export type PlannedAttribute = {
  attribute: Attribute;
  fp64Component?: 'high' | 'low';
};

export type AttributeAllocationPlan = {
  groups: AttributeAllocationGroup[];
  groupsByAttributeId: Record<string, AttributeAllocationGroup[]>;
  mappingsByAttributeId: Record<string, AttributeBufferMapping[]>;
  packedAttributeIds: Set<string>;
  storageAttributeIds: Set<string>;
};

export type AttributeBufferMapping = {
  attribute: Attribute;
  attributeName: string;
  bufferName: string;
  groupKind: AllocationGroupKind;
  fp64Component?: 'high' | 'low';
  byteOffset?: number;
};

type PlannerProps = {
  device: Device;
  attributes: Attribute[];
  modelInfo?: {isInstanced?: boolean; reservedVertexBufferCount?: number};
  mode?: TableBufferPlannerMode;
  useStorageBuffers?: boolean;
  generateConstantAttributes: boolean;
  isTransitionAttribute: (attributeName: string) => boolean;
};

const PRIORITY_RANK: Record<BufferLayoutPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
};
const POSITIONS_GROUP_ID = 'position-attribute-columns';
const STORAGE_OVERFLOW_COLUMN_ALIGNMENT = 256;

export default class TableBufferPlanner {
  static getAllocationPlan({
    device,
    attributes,
    modelInfo,
    mode = getPlannerMode(modelInfo),
    useStorageBuffers = false,
    generateConstantAttributes,
    isTransitionAttribute
  }: PlannerProps): AttributeAllocationPlan {
    const sortedAttributes = [...attributes].sort((a, b) => a.id.localeCompare(b.id));
    const groups: AttributeAllocationGroup[] = [];
    const geometryAttributes: PlannedAttribute[] = [];
    const constantAttributes: PlannedAttribute[] = [];
    const positionAttributes: PlannedAttribute[] = [];
    const dataAttributes: PlannedAttribute[] = [];
    const reservedVertexBufferCount = modelInfo?.reservedVertexBufferCount || 0;

    for (const attribute of sortedAttributes) {
      const stepMode = getAttributeStepMode(attribute, modelInfo);

      if (
        attribute.settings.isIndexed ||
        isTransitionAttribute(attribute.id) ||
        ((attribute.constant || attribute.isConstant) && !generateConstantAttributes) ||
        !canUsePlannedBuffer(attribute) ||
        (!attribute.supportsPackedBuffer(stepMode, modelInfo) && !isPositionAttribute(attribute))
      ) {
        groups.push({
          id: attribute.id,
          kind: 'unmanaged-attribute-column',
          attributes: [{attribute}]
        });
      } else if (mode === 'table-with-inline-row-geometry') {
        if (isPositionAttribute(attribute)) {
          positionAttributes.push({
            attribute,
            fp64Component: attribute.doublePrecision ? 'high' : undefined
          });
          if (attribute.doublePrecision && generateConstantAttributes) {
            constantAttributes.push({attribute, fp64Component: 'low'});
          }
        } else if ((attribute.constant || attribute.isConstant) && generateConstantAttributes) {
          constantAttributes.push({attribute});
        } else {
          dataAttributes.push({attribute});
        }
      } else if (stepMode === 'vertex') {
        geometryAttributes.push({attribute});
      } else if (isPositionAttribute(attribute)) {
        positionAttributes.push({
          attribute,
          fp64Component: attribute.doublePrecision ? 'high' : undefined
        });
        if (attribute.doublePrecision && generateConstantAttributes) {
          constantAttributes.push({attribute, fp64Component: 'low'});
        }
      } else if ((attribute.constant || attribute.isConstant) && generateConstantAttributes) {
        constantAttributes.push({attribute});
      } else {
        dataAttributes.push({attribute});
      }
    }

    if (geometryAttributes.length) {
      groups.push({
        id: 'interleaved-shared-geometry-columns',
        kind: 'interleaved-shared-geometry-columns',
        attributes: geometryAttributes
      });
    }
    if (constantAttributes.length) {
      groups.push({
        id: 'interleaved-constant-attribute-columns',
        kind: 'interleaved-constant-attribute-columns',
        attributes: constantAttributes,
        rowCount:
          mode === 'table-with-inline-row-geometry'
            ? 1
            : getPackedRowCount([...geometryAttributes, ...positionAttributes]),
        stepMode: mode === 'table-with-inline-row-geometry' ? 'instance' : 'vertex'
      });
    }
    if (positionAttributes.length) {
      groups.push({
        id: POSITIONS_GROUP_ID,
        kind: 'position-attribute-columns',
        attributes: positionAttributes
      });
    }

    const {storageGroups, vertexAttributes} = allocateStorageAttributes({
      device,
      mode,
      useStorageBuffers,
      attributes: dataAttributes
    });
    groups.push(...storageGroups);
    groups.push(
      ...allocateDataAttributes(device, groups, vertexAttributes, reservedVertexBufferCount)
    );
    validatePlan(device, groups, reservedVertexBufferCount);

    const groupsByAttributeId: Record<string, AttributeAllocationGroup[]> = {};
    const mappingsByAttributeId: Record<string, AttributeBufferMapping[]> = {};
    const packedAttributeIds = new Set<string>();
    const storageAttributeIds = new Set<string>();
    for (const group of groups) {
      for (const {attribute, fp64Component} of group.attributes) {
        groupsByAttributeId[attribute.id] = groupsByAttributeId[attribute.id] || [];
        groupsByAttributeId[attribute.id].push(group);
        mappingsByAttributeId[attribute.id] = mappingsByAttributeId[attribute.id] || [];
        const byteOffset = getStorageBufferByteOffset(group, attribute.id);
        mappingsByAttributeId[attribute.id].push({
          attribute,
          attributeName: fp64Component === 'low' ? `${attribute.id}64Low` : attribute.id,
          bufferName: group.id,
          groupKind: group.kind,
          fp64Component,
          ...(byteOffset === undefined ? {} : {byteOffset})
        });
        if (group.kind === 'separate-storage-column' || group.kind === 'stacked-storage-columns') {
          storageAttributeIds.add(attribute.id);
        } else if (group.kind !== 'unmanaged-attribute-column') {
          packedAttributeIds.add(attribute.id);
        }
      }
    }

    return {
      groups,
      groupsByAttributeId,
      mappingsByAttributeId,
      packedAttributeIds,
      storageAttributeIds
    };
  }

  static shouldSkipAttributeBuffer(
    attribute: Attribute,
    modelInfo: {isInstanced?: boolean} | undefined,
    isTransitionAttribute: (attributeName: string) => boolean
  ): boolean {
    const stepMode = getAttributeStepMode(attribute, modelInfo);
    return (
      !attribute.settings.isIndexed &&
      (!attribute.doublePrecision || isPositionAttribute(attribute)) &&
      !attribute.settings.noAlloc &&
      !attribute.settings.transition &&
      !isTransitionAttribute(attribute.id) &&
      (stepMode === 'vertex' || stepMode === 'instance')
    );
  }
}

function allocateStorageAttributes({
  device,
  mode,
  useStorageBuffers,
  attributes
}: {
  device: Device;
  mode: TableBufferPlannerMode;
  useStorageBuffers: boolean;
  attributes: PlannedAttribute[];
}): {storageGroups: AttributeAllocationGroup[]; vertexAttributes: PlannedAttribute[]} {
  if (!shouldUseStorageBuffers(device, mode, useStorageBuffers) || !attributes.length) {
    return {storageGroups: [], vertexAttributes: attributes};
  }

  const maxStorageBuffers = Math.max(0, device.limits.maxStorageBuffersPerShaderStage || 0);
  const storageGroups: AttributeAllocationGroup[] = [];
  const vertexAttributes: PlannedAttribute[] = [];
  const storageAttributes: PlannedAttribute[] = [];

  for (const attribute of sortDataAttributes(attributes)) {
    const byteLength = getStorageBufferByteLength(attribute.attribute);
    if (
      byteLength <= device.limits.maxStorageBufferBindingSize &&
      !isGeneratedRowGeometryAttribute(attribute.attribute)
    ) {
      storageAttributes.push(attribute);
    } else {
      vertexAttributes.push(attribute);
    }
  }

  const dedicatedCount =
    maxStorageBuffers >= storageAttributes.length
      ? storageAttributes.length
      : Math.max(0, maxStorageBuffers - 1);

  for (const attribute of storageAttributes.slice(0, dedicatedCount)) {
    storageGroups.push({
      id: attribute.attribute.id,
      kind: 'separate-storage-column',
      attributes: [attribute],
      byteLength: getStorageBufferByteLength(attribute.attribute),
      byteOffsets: {[attribute.attribute.id]: 0}
    });
  }

  const overflowAttributes = storageAttributes.slice(dedicatedCount);
  if (overflowAttributes.length) {
    const layout = getStorageOverflowLayout(overflowAttributes);
    if (
      storageGroups.length < maxStorageBuffers &&
      layout.byteLength <= device.limits.maxStorageBufferBindingSize
    ) {
      storageGroups.push({
        id: 'stacked-storage-columns',
        kind: 'stacked-storage-columns',
        attributes: overflowAttributes,
        byteLength: layout.byteLength,
        byteOffsets: layout.byteOffsets
      });
    } else {
      vertexAttributes.push(...overflowAttributes);
    }
  }

  return {storageGroups, vertexAttributes};
}

function allocateDataAttributes(
  device: Device,
  fixedGroups: AttributeAllocationGroup[],
  attributes: PlannedAttribute[],
  reservedVertexBufferCount: number
): AttributeAllocationGroup[] {
  if (!attributes.length) {
    return [];
  }

  const sortedAttributes = sortDataAttributes(attributes);

  const fixedVertexBufferCount = countVertexBufferGroups(fixedGroups);
  const availableSlots =
    device.limits.maxVertexBuffers - reservedVertexBufferCount - fixedVertexBufferCount;
  const dedicatedCount =
    availableSlots >= sortedAttributes.length
      ? sortedAttributes.length
      : Math.max(0, availableSlots - 1);
  const groups: AttributeAllocationGroup[] = [];

  for (const attribute of sortedAttributes.slice(0, dedicatedCount)) {
    groups.push({
      id: attribute.attribute.id,
      kind: 'separate-attribute-column',
      attributes: [attribute]
    });
  }

  const overflowAttributes = sortedAttributes.slice(dedicatedCount);
  if (overflowAttributes.length) {
    groups.push({
      id: 'interleaved-attribute-columns',
      kind: 'interleaved-attribute-columns',
      attributes: overflowAttributes
    });
  }

  return groups;
}

function validatePlan(
  device: Device,
  groups: AttributeAllocationGroup[],
  reservedVertexBufferCount: number
): void {
  const vertexBufferCount = reservedVertexBufferCount + countVertexBufferGroups(groups);
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
    const byteLength =
      group.byteLength || getStorageBufferByteLength(group.attributes[0].attribute);
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
      group.attributes[0]?.attribute.settings.isIndexed
    ) {
      continue;
    }
    const byteStride = getGroupByteStride(group);
    if (byteStride > device.limits.maxVertexBufferArrayStride) {
      throw new Error(
        `Attribute buffer group "${group.id}" requires byteStride ${byteStride}, ` +
          `but this device supports ${device.limits.maxVertexBufferArrayStride}`
      );
    }
  }
}

function countVertexBufferGroups(groups: AttributeAllocationGroup[]): number {
  return groups.filter(
    group =>
      group.kind !== 'separate-storage-column' &&
      group.kind !== 'stacked-storage-columns' &&
      !group.attributes[0]?.attribute.settings.isIndexed
  ).length;
}

function sortDataAttributes(attributes: PlannedAttribute[]): PlannedAttribute[] {
  return [...attributes].sort((a, b) => {
    const priorityDiff = getPriorityRank(a.attribute) - getPriorityRank(b.attribute);
    return priorityDiff || a.attribute.id.localeCompare(b.attribute.id);
  });
}

function getPriorityRank(attribute: Attribute): number {
  return PRIORITY_RANK[getBufferLayoutPriority(attribute)];
}

function getBufferLayoutPriority(attribute: Attribute): BufferLayoutPriority {
  if (attribute.settings.bufferLayoutPriority) {
    return attribute.settings.bufferLayoutPriority;
  }
  if (isGeneratedLowPriorityAttribute(attribute)) {
    return 'low';
  }
  if (isPositionAttribute(attribute) || isColorAttribute(attribute)) {
    return 'high';
  }
  return 'medium';
}

function getAttributeStepMode(
  attribute: Attribute,
  modelInfo?: {isInstanced?: boolean}
): 'vertex' | 'instance' {
  return attribute.getBufferLayout(modelInfo).stepMode as 'vertex' | 'instance';
}

function getPlannerMode(modelInfo?: {isInstanced?: boolean}): TableBufferPlannerMode {
  return modelInfo?.isInstanced === false
    ? 'table-with-inline-row-geometry'
    : 'table-with-shared-geometry';
}

function getPackedRowCount(attributes: PlannedAttribute[]): number {
  return Math.max(1, ...attributes.map(({attribute}) => attribute.numInstances));
}

function canUsePlannedBuffer(attribute: Attribute): boolean {
  return (
    !attribute.settings.noAlloc && (!attribute.doublePrecision || isPositionAttribute(attribute))
  );
}

function shouldUseStorageBuffers(
  device: Device,
  mode: TableBufferPlannerMode,
  useStorageBuffers: boolean
): boolean {
  return (
    useStorageBuffers && device.type === 'webgpu' && mode === 'table-with-inline-row-geometry'
  );
}

function getStorageBufferByteLength(attribute: Attribute): number {
  if (ArrayBuffer.isView(attribute.value)) {
    return attribute.value.byteLength;
  }
  return Math.max(1, attribute.numInstances) * attribute.getPackedBufferStride(null);
}

function getStorageOverflowLayout(attributes: PlannedAttribute[]): {
  byteLength: number;
  byteOffsets: Record<string, number>;
} {
  let byteLength = 0;
  const byteOffsets: Record<string, number> = {};

  for (const {attribute} of attributes) {
    byteLength = alignTo(byteLength, STORAGE_OVERFLOW_COLUMN_ALIGNMENT);
    byteOffsets[attribute.id] = byteLength;
    byteLength += getStorageBufferByteLength(attribute);
  }

  return {byteLength: alignTo(byteLength, STORAGE_OVERFLOW_COLUMN_ALIGNMENT), byteOffsets};
}

function getStorageBufferByteOffset(
  group: AttributeAllocationGroup,
  attributeId: string
): number | undefined {
  if (group.kind !== 'separate-storage-column' && group.kind !== 'stacked-storage-columns') {
    return undefined;
  }
  return group.byteOffsets?.[attributeId] ?? 0;
}

function alignTo(value: number, alignment: number): number {
  return Math.ceil(value / alignment) * alignment;
}

function getGroupByteStride(group: AttributeAllocationGroup): number {
  return group.attributes.reduce(
    (byteStride, {attribute, fp64Component}) =>
      byteStride + attribute.getPackedBufferStride(fp64Component ?? null),
    0
  );
}

function isPositionAttribute(attribute: Attribute): boolean {
  return attribute.id === 'positions' || attribute.id === 'instancePositions';
}

function isColorAttribute(attribute: Attribute): boolean {
  return /Colors?$/.test(attribute.id);
}

function isGeneratedLowPriorityAttribute(attribute: Attribute): boolean {
  return attribute.id === 'pickingColors' || attribute.id === 'instancePickingColors';
}

function isGeneratedRowGeometryAttribute(attribute: Attribute): boolean {
  return attribute.id === 'rowIndex' || attribute.id === 'pickingColors';
}
