// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Attribute, {BufferLayoutPriority} from './attribute';

import type {Device} from '@luma.gl/core';

export type AllocationGroupKind =
  | 'geometry'
  | 'constants'
  | 'positions'
  | 'overflow'
  | 'dedicated'
  | 'standalone';

export type AttributeAllocationGroup = {
  id: string;
  kind: AllocationGroupKind;
  attributes: PlannedAttribute[];
  rowCount?: number;
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
};

export type AttributeBufferMapping = {
  attribute: Attribute;
  attributeName: string;
  bufferName: string;
  groupKind: AllocationGroupKind;
  fp64Component?: 'high' | 'low';
};

type PlannerProps = {
  device: Device;
  attributes: Attribute[];
  modelInfo?: {isInstanced?: boolean; reservedVertexBufferCount?: number};
  generateConstantAttributes: boolean;
  isTransitionAttribute: (attributeName: string) => boolean;
};

const PRIORITY_RANK: Record<BufferLayoutPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
};
const POSITIONS_GROUP_ID = 'positionAttributes';

export default class AttributeBufferPlanner {
  static getAllocationPlan({
    device,
    attributes,
    modelInfo,
    generateConstantAttributes,
    isTransitionAttribute
  }: PlannerProps): AttributeAllocationPlan {
    const sortedAttributes = [...attributes].sort((a, b) => a.id.localeCompare(b.id));
    const groups: AttributeAllocationGroup[] = [];
    const geometryAttributes: PlannedAttribute[] = [];
    const constantAttributes: PlannedAttribute[] = [];
    const positionAttributes: PlannedAttribute[] = [];
    const instanceAttributes: PlannedAttribute[] = [];
    const reservedVertexBufferCount = modelInfo?.reservedVertexBufferCount || 0;

    for (const attribute of sortedAttributes) {
      const stepMode = getAttributeStepMode(attribute, modelInfo);

      if (
        attribute.settings.isIndexed ||
        isTransitionAttribute(attribute.id) ||
        ((attribute.constant || attribute.isConstant) && !generateConstantAttributes) ||
        !canUsePlannedBuffer(attribute) ||
        (!attribute.supportsPackedBuffer(stepMode) && !isPositionAttribute(attribute))
      ) {
        groups.push({id: attribute.id, kind: 'standalone', attributes: [{attribute}]});
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
        instanceAttributes.push({attribute});
      }
    }

    if (geometryAttributes.length) {
      groups.push({id: 'geometry', kind: 'geometry', attributes: geometryAttributes});
    }
    if (constantAttributes.length) {
      groups.push({
        id: 'constants',
        kind: 'constants',
        attributes: constantAttributes,
        rowCount: getPackedRowCount([...geometryAttributes, ...positionAttributes])
      });
    }
    if (positionAttributes.length) {
      groups.push({id: POSITIONS_GROUP_ID, kind: 'positions', attributes: positionAttributes});
    }

    groups.push(
      ...allocateInstanceAttributes(device, groups, instanceAttributes, reservedVertexBufferCount)
    );
    validatePlan(device, groups, reservedVertexBufferCount);

    const groupsByAttributeId: Record<string, AttributeAllocationGroup[]> = {};
    const mappingsByAttributeId: Record<string, AttributeBufferMapping[]> = {};
    const packedAttributeIds = new Set<string>();
    for (const group of groups) {
      for (const {attribute, fp64Component} of group.attributes) {
        groupsByAttributeId[attribute.id] = groupsByAttributeId[attribute.id] || [];
        groupsByAttributeId[attribute.id].push(group);
        mappingsByAttributeId[attribute.id] = mappingsByAttributeId[attribute.id] || [];
        mappingsByAttributeId[attribute.id].push({
          attribute,
          attributeName: fp64Component === 'low' ? `${attribute.id}64Low` : attribute.id,
          bufferName: group.id,
          groupKind: group.kind,
          fp64Component
        });
        if (group.kind !== 'standalone') {
          packedAttributeIds.add(attribute.id);
        }
      }
    }

    return {groups, groupsByAttributeId, mappingsByAttributeId, packedAttributeIds};
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

function allocateInstanceAttributes(
  device: Device,
  fixedGroups: AttributeAllocationGroup[],
  attributes: PlannedAttribute[],
  reservedVertexBufferCount: number
): AttributeAllocationGroup[] {
  if (!attributes.length) {
    return [];
  }

  const sortedAttributes = [...attributes].sort((a, b) => {
    const priorityDiff = getPriorityRank(a.attribute) - getPriorityRank(b.attribute);
    return priorityDiff || a.attribute.id.localeCompare(b.attribute.id);
  });

  const fixedVertexBufferCount = countVertexBufferGroups(fixedGroups);
  const availableSlots =
    device.limits.maxVertexBuffers - reservedVertexBufferCount - fixedVertexBufferCount;
  const dedicatedCount =
    availableSlots >= sortedAttributes.length
      ? sortedAttributes.length
      : Math.max(0, availableSlots - 1);
  const groups: AttributeAllocationGroup[] = [];

  for (const attribute of sortedAttributes.slice(0, dedicatedCount)) {
    groups.push({id: attribute.attribute.id, kind: 'dedicated', attributes: [attribute]});
  }

  const overflowAttributes = sortedAttributes.slice(dedicatedCount);
  if (overflowAttributes.length) {
    groups.push({id: 'overflow', kind: 'overflow', attributes: overflowAttributes});
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

  for (const group of groups) {
    if (group.kind === 'standalone' || group.attributes[0]?.attribute.settings.isIndexed) {
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
  return groups.filter(group => !group.attributes[0]?.attribute.settings.isIndexed).length;
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

function getPackedRowCount(attributes: PlannedAttribute[]): number {
  return Math.max(1, ...attributes.map(({attribute}) => attribute.numInstances));
}

function canUsePlannedBuffer(attribute: Attribute): boolean {
  return !attribute.settings.noAlloc && (!attribute.doublePrecision || isPositionAttribute(attribute));
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
